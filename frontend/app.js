// DOM Elements
const form = document.getElementById("resumeForm");
const btnLoader = document.getElementById("btnLoader");
const submitBtn = form.querySelector('button[type="submit"]');
const previewName = document.getElementById("previewName");
const previewRole = document.getElementById("previewRole");
const previewEmail = document.getElementById("previewEmail");
const previewPhone = document.getElementById("previewPhone");

// Form input elements
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const jobRoleInput = document.getElementById("job_role");

// Real-time preview updates
function updatePreviewHeader() {
  previewName.textContent = nameInput.value || "Your Name";
  previewRole.textContent = jobRoleInput.value || "Job Role";
  previewEmail.textContent = emailInput.value || "email@example.com";
  previewPhone.textContent = phoneInput.value || "+1 (555) 123-4567";
}

// Add event listeners for real-time updates
nameInput.addEventListener("input", updatePreviewHeader);
emailInput.addEventListener("input", updatePreviewHeader);
phoneInput.addEventListener("input", updatePreviewHeader);
jobRoleInput.addEventListener("input", updatePreviewHeader);

// Form submission handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Show loading state
  showLoadingState();
  
  const formData = new FormData(form);

  try {
    const response = await fetch("http://localhost:8000/generate_stream", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // Clear previous content
    clearPreviewSections();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (let line of lines) {
        if (line.startsWith("data:")) {
          try {
            const event = JSON.parse(line.replace("data:", "").trim());

            if (event.section === "done") {
              handleDownloadReady(event.pdf);
            } else if (event.section && event.content) {
              updatePreviewSection(event.section, event.content);
            }
          } catch (parseError) {
            console.warn("Failed to parse event:", parseError);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error generating resume:", error);
    showErrorState("Failed to generate resume. Please try again.");
  } finally {
    hideLoadingState();
  }
});

// Reset form handler
form.addEventListener("reset", () => {
  setTimeout(() => {
    updatePreviewHeader();
    clearPreviewSections();
    clearDownloadLink();
  }, 10);
});

// Helper functions
function showLoadingState() {
  submitBtn.disabled = true;
  btnLoader.classList.add("active");
  submitBtn.querySelector("i").style.display = "none";
  
  // Add loading class to preview sections
  const previewSections = document.querySelectorAll(".preview-section-item");
  previewSections.forEach(section => {
    section.classList.add("loading");
  });
}

function hideLoadingState() {
  submitBtn.disabled = false;
  btnLoader.classList.remove("active");
  submitBtn.querySelector("i").style.display = "inline";
  
  // Remove loading class from preview sections
  const previewSections = document.querySelectorAll(".preview-section-item");
  previewSections.forEach(section => {
    section.classList.remove("loading");
  });
}

function showErrorState(message) {
  const downloadSection = document.getElementById("downloadLink");
  downloadSection.innerHTML = `
    <div style="padding: 20px; text-align: center; color: var(--accent-error); background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.3);">
      <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
      <p style="margin: 0; font-weight: 500;">${message}</p>
    </div>
  `;
}

function updatePreviewSection(sectionId, content) {
  const section = document.querySelector(`#${sectionId} .section-content p`);
  if (section) {
    // Add fade-in animation
    section.style.opacity = '0';
    section.textContent = content;
    
    // Trigger fade-in
    setTimeout(() => {
      section.style.transition = 'opacity 0.3s ease-in-out';
      section.style.opacity = '1';
    }, 50);
  }
}

function clearPreviewSections() {
  const sections = ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'languages'];
  sections.forEach(sectionId => {
    const section = document.querySelector(`#${sectionId} .section-content p`);
    if (section) {
      section.textContent = getPlaceholderText(sectionId);
      section.style.opacity = '0.5';
    }
  });
}

function getPlaceholderText(sectionId) {
  const placeholders = {
    summary: "Your professional summary will appear here...",
    skills: "Your skills will be listed here...",
    experience: "Your work experience will be displayed here...",
    projects: "Your projects will be showcased here...",
    education: "Your educational background will appear here...",
    certifications: "Your certifications will be listed here...",
    languages: "Your language skills will appear here..."
  };
  return placeholders[sectionId] || "Content will appear here...";
}

function handleDownloadReady(pdfPath) {
  const filePath = pdfPath.split("/").pop();
  const downloadSection = document.getElementById("downloadLink");
  
  downloadSection.innerHTML = `
    <div class="download-ready fade-in">
      <div style="margin-bottom: 16px;">
        <i class="fas fa-check-circle" style="color: var(--accent-success); font-size: 32px; margin-bottom: 8px; display: block;"></i>
        <h3 style="color: var(--text-primary); margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Resume Generated Successfully!</h3>
        <p style="color: var(--text-secondary); margin: 0; font-size: 14px;">Your professional resume is ready for download</p>
      </div>
      <a href="http://localhost:8000/download/${filePath}" download style="text-decoration: none;">
        <button type="button" style="
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
          font-family: var(--font-family);
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 15px -3px rgba(0, 0, 0, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.4)'">
          <i class="fas fa-download"></i>
          Download Resume PDF
        </button>
      </a>
    </div>
  `;
  
  // Add success animation
  downloadSection.querySelector('.download-ready').classList.add('fade-in');
}

function clearDownloadLink() {
  const downloadSection = document.getElementById("downloadLink");
  downloadSection.innerHTML = "";
}

// Initialize preview header on page load
document.addEventListener("DOMContentLoaded", () => {
  updatePreviewHeader();
  
  // Add smooth scrolling for better UX
  const form = document.getElementById("resumeForm");
  form.addEventListener("submit", () => {
    // Scroll to preview section after a short delay
    setTimeout(() => {
      const previewSection = document.querySelector(".preview-section");
      if (previewSection) {
        previewSection.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }
    }, 1000);
  });
  
  // Add input validation feedback
  const inputs = form.querySelectorAll("input, textarea");
  inputs.forEach(input => {
    input.addEventListener("blur", validateInput);
    input.addEventListener("input", clearValidationError);
  });
});

// Input validation
function validateInput(event) {
  const input = event.target;
  const value = input.value.trim();
  
  // Remove existing validation styling
  input.classList.remove("error", "success");
  
  if (input.hasAttribute("required") && !value) {
    showInputError(input, "This field is required");
  } else if (input.type === "email" && value && !isValidEmail(value)) {
    showInputError(input, "Please enter a valid email address");
  } else if (value) {
    showInputSuccess(input);
  }
}

function clearValidationError(event) {
  const input = event.target;
  input.classList.remove("error");
  const errorMsg = input.parentNode.querySelector(".error-message");
  if (errorMsg) {
    errorMsg.remove();
  }
}

function showInputError(input, message) {
  input.classList.add("error");
  
  // Remove existing error message
  const existingError = input.parentNode.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }
  
  // Add new error message
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.style.cssText = `
    color: var(--accent-error);
    font-size: 12px;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  `;
  errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
  input.parentNode.appendChild(errorDiv);
  
  // Add error styling to input
  input.style.borderColor = "var(--accent-error)";
  input.style.boxShadow = "0 0 0 3px rgba(239, 68, 68, 0.1)";
}

function showInputSuccess(input) {
  input.classList.add("success");
  input.style.borderColor = "var(--accent-success)";
  input.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)";
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Add CSS for validation states
const style = document.createElement("style");
style.textContent = `
  .form-group input.error,
  .form-group textarea.error {
    border-color: var(--accent-error) !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  }
  
  .form-group input.success,
  .form-group textarea.success {
    border-color: var(--accent-success) !important;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
  }
  
  .error-message {
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
