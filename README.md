# 🛡️ EngiVault | Full-Stack Technical Asset Manager

**EngiVault** is a specialized Document Management System (DMS) built to solve data fragmentation in engineering environments. It centralizes technical specifications, rich-text logs, and PDF blueprints into a secure, hierarchical vault.

## 🔗 Live Deployments
* **Production UI (Vercel):** [https://engvault-frontend.vercel.app/dashboard]
* **Production API (Render):** [https://drex-notes-api.onrender.com]

---

## 🏗️ System Architecture
This repository is structured as a **decoupled monorepo**, ensuring a clean separation of concerns between the client interface and the server-side logic.



### 📁 Repository Structure
* **`/frontend`**: A high-performance Single Page Application (SPA) built with Vanilla JavaScript (ES6+). Optimized for mobile-first field access and low-latency rendering.
* **`/backend`**: A robust REST API built with **Django REST Framework (DRF)**. Manages relational data integrity, JWT authentication, and technical asset storage.

---

## ⚙️ Core Engineering Features

### 1. Relational Technical Hierarchy
Unlike generic note-taking applications, EngiVault enforces a domain-specific data model:
**Systems (Units) ➔ Specifications (Subtopics) ➔ Technical Assets (Blueprints/Logs)**.
This ensures that all field data is anchored to a specific engineering module, maintaining strict data integrity.



### 2. Secure JWT Handshake & Diagnostic UI
The system utilizes **JSON Web Tokens (JWT)** for stateless, secure authentication. To handle backend "Cold Starts" on cloud infrastructure, I engineered a custom **Status Terminal** that monitors API handshakes and provides real-time diagnostic feedback to the user.

### 3. Integrated Asset Archival Service
Supports the archival and retrieval of technical schematics. Engineers can upload PDF blueprints directly to specific sub-systems, providing a single source of truth for on-site operations.

---

## 🛠️ Technology Stack
| Tier | Technology |
| :--- | :--- |
| **Frontend** | JavaScript (ES6+), HTML5, CSS3 (Flex/Grid) |
| **Backend** | Python 3, Django REST Framework |
| **Database** | PostgreSQL |
| **Auth** | JWT (SimpleJWT) |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 🚦 Local Setup & Installation

### Backend (API)
1. Navigate to `/backend`.
2. Initialize virtual environment: `python -m venv venv`.
3. Activate: `source venv/bin/activate` (Unix) or `venv\Scripts\activate` (Win).
4. Install dependencies: `pip install -r requirements.txt`.
5. Configure `.env` with your `SECRET_KEY` and `DATABASE_URL`.
6. Apply migrations: `python manage.py migrate`.

### Frontend (UI)
1. Navigate to `/frontend`.
2. Configure `js/api.js` to point to your local backend (`http://127.0.0.1:8000`).
3. Launch `index.html` via a local server (e.g., VS Code Live Server).

---

## 💡 Technical Reflection
A primary challenge was managing server hibernation on free-tier hosting. I transformed this infrastructure limitation into a professional UX feature by developing a "System Boot" diagnostic terminal, which significantly improved user trust during the 30-second initialization period.
