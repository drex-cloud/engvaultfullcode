import { registerUser } from "./api.js";

const form = document.getElementById("register-form");
const btn = document.getElementById("reg-btn");
const terminal = document.getElementById("status-terminal");
const statusText = document.getElementById("status-text");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Loading UI Initialization
    const originalText = btn.textContent;
    btn.textContent = "INITIALIZING...";
    btn.disabled = true;

    // Reset Terminal Styles
    terminal.classList.remove("hidden");
    terminal.style.borderLeftColor = "#3b82f6";
    terminal.style.background = "#f0f7ff";
    terminal.style.color = "#1e40af";
    statusText.textContent = "> Allocating cloud resources...";

    // 2. Render "Cold Start" Handling
    const sleepTimer = setTimeout(() => {
      terminal.style.borderLeftColor = "#f59e0b"; // Warning Orange
      terminal.style.background = "#fffbeb";
      terminal.style.color = "#92400e";
      statusText.innerHTML = "> <strong>NOTICE:</strong> Backend is cold-starting. Deployment may take up to 40 seconds.";
    }, 4000);

    const user = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;

    try {
      const { status, data } = await registerUser(user, email, pass);

      // Response received, clear the timer
      clearTimeout(sleepTimer);

      if (status === 201) {
        terminal.style.borderLeftColor = "#10b981"; // Success Green
        terminal.style.background = "#ecfdf5";
        terminal.style.color = "#065f46";
        statusText.textContent = "> VAULT_INITIALIZED. Redirecting to Portal...";

        // Delay for user feedback
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      } else {
        let errorMsg = "Allocation failed.";
        if (data.username) errorMsg = `ID_CONFLICT: ${data.username}`;
        else if (data.email) errorMsg = `EMAIL_INVALID: ${data.email}`;

        handleError(errorMsg);
      }
    } catch (error) {
      clearTimeout(sleepTimer);
      handleError("NETWORK_TIMEOUT: Server unreachable.");
    }

    function handleError(msg) {
      terminal.style.borderLeftColor = "#ef4444"; // Error Red
      terminal.style.background = "#fef2f2";
      terminal.style.color = "#991b1b";
      statusText.textContent = `> ERROR: ${msg}`;
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}