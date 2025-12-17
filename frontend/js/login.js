import { loginUser, setToken } from "./api.js";

const loginForm = document.getElementById("login-form");
const btn = document.getElementById("login-btn");
const terminal = document.getElementById("status-terminal");
const statusText = document.getElementById("status-text");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. UI Initialization
    const originalText = btn.textContent;
    btn.textContent = "WAITING...";
    btn.disabled = true;

    // Show terminal and reset style
    terminal.classList.remove("hidden");
    terminal.style.borderLeftColor = "#3b82f6";
    terminal.style.background = "#f0f7ff";
    terminal.style.color = "#1e40af";
    statusText.textContent = "> Establishing uplink to Render API...";

    // 2. Handle Render Sleep (Cold Start)
    const sleepTimer = setTimeout(() => {
      terminal.style.borderLeftColor = "#f59e0b"; // Warning Orange
      terminal.style.background = "#fffbeb";
      terminal.style.color = "#92400e";
      statusText.innerHTML = "> <strong>NOTICE:</strong> Server waking up from hibernation. This may take ~40 seconds.";
    }, 3500);

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const { status, data } = await loginUser(username, password);

      clearTimeout(sleepTimer);

      if (status === 200) {
        terminal.style.borderLeftColor = "#10b981"; // Success Green
        terminal.style.background = "#ecfdf5";
        terminal.style.color = "#065f46";
        statusText.textContent = "> ACCESS GRANTED. Redirecting to workspace...";

        setToken(data.access);

        // Small delay so user can read the success message
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        handleError(data.detail || "Authentication sequence failed.");
      }
    } catch (error) {
      clearTimeout(sleepTimer);
      handleError("NETWORK_ERROR: Check server availability.");
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