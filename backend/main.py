from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
import asyncio, json
from langchain_groq import ChatGroq   # ✅ Groq instead of OpenAI
from typing import TypedDict
from fpdf import FPDF
import os, uuid

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

class ResumeState(TypedDict):
    name: str
    email: str
    phone: str
    job_role: str
    summary: str
    skills: str
    experience: str
    projects: str
    education: str
    certifications: str
    languages: str
    pdf_path: str

# ✅ Read API key & model from system env
llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model=os.getenv("MODEL", "gemma-7b-it")   # fallback to gemma-7b-it
)

async def ai_generate(title, prompt):
    result = llm.invoke(prompt)
    return result.content if result else ""

@app.post("/generate_stream")
async def generate_stream(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    job_role: str = Form(...),
    details: str = Form(...)
):
    async def event_stream():
        state = {
            "name": name, "email": email, "phone": phone, "job_role": job_role,
            "summary": "", "skills": "", "experience": "", "projects": "",
            "education": "", "certifications": "", "languages": "", "pdf_path": ""
        }

        sections = {
            "summary": f"Write a professional summary for {job_role} based on {details}",
            "skills": f"Extract ATS-friendly skills from: {details}",
            "experience": f"Generate structured experience bullets for role {job_role}: {details}",
            "projects": f"Summarize notable projects from: {details}",
            "education": f"Summarize education history from: {details}",
            "certifications": f"List certifications from: {details}",
            "languages": f"List professional languages known from: {details}"
        }

        # Generate sections one by one (streaming updates)
        for key, prompt in sections.items():
            content = await ai_generate(key, prompt)
            state[key] = content
            yield f"data: {json.dumps({'section': key, 'content': content})}\n\n"
            await asyncio.sleep(0.2)

        # Save PDF
        os.makedirs("resumes", exist_ok=True)
        file_name = f"resumes/resume_{uuid.uuid4().hex}.pdf"

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Resume: {state['name']}", ln=True, align="C")
        pdf.ln(10)

        pdf.set_font("Arial", size=11)
        pdf.cell(200, 10, txt=f"Email: {state['email']} | Phone: {state['phone']}", ln=True)
        pdf.ln(5)

        for title, key in [
            ("Summary", "summary"),
            ("Skills", "skills"),
            ("Experience", "experience"),
            ("Projects", "projects"),
            ("Education", "education"),
            ("Certifications", "certifications"),
            ("Languages", "languages"),
        ]:
            if state[key]:
                pdf.set_font("Arial", "B", 12)
                pdf.cell(200, 10, txt=title, ln=True)
                pdf.set_font("Arial", size=11)
                pdf.multi_cell(0, 10, state[key])
                pdf.ln(5)

        pdf.output(file_name)
        state["pdf_path"] = file_name
        yield f"data: {json.dumps({'section': 'done', 'pdf': file_name})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/download/{filename}")
async def download(filename: str):
    file_path = f"resumes/{filename}"
    return FileResponse(path=file_path, filename=filename, media_type="application/pdf")
