📝 AI Resume Builder

An AI-powered Resume Builder that generates ATS-friendly resumes using Groq-hosted LLMs (Gemma, LLaMA3, Mixtral).
Built with FastAPI + LangGraph for the backend and a Node.js/HTML frontend with real-time streaming updates.

✨ Features:

Generate professional resume sections (summary, skills, projects, experience, education, certifications, languages).

Live streaming updates while AI fills each section.

One-click PDF download of the final resume.

Reset option to start fresh.

Supports multiple models (Gemma, LLaMA3, Mixtral) via Groq API.

⚡ Tech Stack

Backend: FastAPI, LangGraph, Groq LLMs, FPDF

Frontend: Node.js, HTML, CSS, JavaScript (SSE streaming)

AI Models: Groq-hosted Gemma, LLaMA3, Mixtral

Other: Python, AsyncIO, PDF generation

📂 Project Structure
AI-Resume-Builder/
│── backend/
│   ├── main.py          # FastAPI backend with Groq LLM + PDF generation
│   ├── requirements.txt # Python dependencies
│── frontend/
│   ├── index.html       # Main UI
│   ├── style.css        # Styling
│   ├── script.js        # Frontend logic (SSE + API calls)
│── resumes/             # Generated resumes (PDFs)
│── README.md

🚀 Setup & Run
1. Clone Repo
git clone https://github.com/Himesh1511/AI-Resume-Builder.git
cd AI-Resume-Builder

2. Backend (FastAPI + Groq LLM)
cd backend
python -m venv venv
source venv/bin/activate     # On Linux/Mac
venv\Scripts\activate        # On Windows

pip install -r requirements.txt


Make sure you set your Groq API Key:

# Linux/Mac
export GROQ_API_KEY="your_api_key_here"
export MODEL="gemma-7b-it"

# Windows (Powershell)
setx GROQ_API_KEY "your_api_key_here"
setx MODEL "gemma-7b-it"


Run backend:

uvicorn main:app --reload --port 8000

3. Frontend
cd ../frontend
python -m http.server 5500


or

npx serve .


Open 👉 http://localhost:5500


💡 Example

Enter your details in the form → AI generates structured content → PDF downloaded in one click.

🌟 Future Improvements

Add LinkedIn/portfolio auto-import.

Support multiple resume templates.

Provide role-based resume tailoring.

Add cover letter generator.

🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss changes.


Created by Himesh Verma

Feel free to reach out if you want to collaborate!
