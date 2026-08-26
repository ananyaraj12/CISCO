# NetSage AI

## AI-Powered Network Diagnosis and Cisco Troubleshooting Assistant

NetSage AI is an AI-powered network troubleshooting platform designed to help diagnose Cisco networking issues using structured network cases, rule-based validation, and Google Gemini.

The system combines:

- Cisco/network troubleshooting concepts
- Rule-based diagnosis
- AI-powered diagnosis using Gemini
- Evidence-based reasoning
- Human review and correction
- Responsible AI logging
- Analytics and dashboard visualization
- A React-based frontend
- A FastAPI backend

The goal is to provide network engineers and learners with a structured workflow for identifying network problems, understanding their possible root causes, and receiving recommended troubleshooting commands and corrective steps.

---

## Features

### 1. AI Network Diagnosis

Users can select a network troubleshooting case and request an AI-generated diagnosis.

The diagnosis provides:

- Root cause
- Confidence score
- Supporting evidence
- Recommended next command
- Suggested fix steps
- OSI layer
- Networking concept

Example request:

```json
{
  "case_id": "NET-001"
}
````

Example response:

```json
{
  "case_id": "NET-001",
  "diagnosis": {
    "root_cause": "Indeterminate root cause due to missing network-state data.",
    "confidence": 0.3,
    "evidence": [
      "Structured network-state data is unavailable in the input."
    ],
    "next_command": "show ip interface brief",
    "fix_steps": [
      "Run 'show ip interface brief' to check interface status.",
      "Verify VLAN configuration.",
      "Verify IP address and default gateway configuration."
    ],
    "osi_layer": "Data Link",
    "concept": "Default Gateway Connectivity"
  }
}
```

---

## 2. Gemini AI Integration

NetSage AI uses Google Gemini to generate structured network diagnoses.

The Gemini integration is isolated inside the backend so that:

* API credentials remain server-side
* The frontend never receives the Gemini API key
* AI responses are converted into the application's structured diagnosis format
* Errors from the AI service are handled safely

The API key is stored through environment configuration and should never be committed to Git.

---

## 3. Rule-Based Network Validation

Before or alongside AI reasoning, the backend can perform deterministic rule checks on available network information.

This helps provide:

* Evidence for the diagnosis
* Additional validation
* More reliable troubleshooting
* A separation between deterministic checks and generative AI

---

## 4. Human Review

NetSage AI supports human review of AI-generated diagnoses.

A reviewer can:

* Accept the AI diagnosis
* Edit the diagnosis
* Provide a correction
* Explain the reason for the correction

Supported decisions include:

```text
ACCEPTED
EDITED
REJECTED
```

Example review request:

```json
{
  "case_id": "NET-001",
  "ai_root_cause": "Possible gateway connectivity issue.",
  "ai_confidence": 0.8,
  "decision": "EDITED",
  "human_correction": "The diagnosis requires additional interface evidence.",
  "correction_reason": "The original diagnosis was incomplete.",
  "reviewer": "network-admin"
}
```

---

## 5. Responsible AI Logging

Human review decisions are stored in the Responsible AI log.

The log records information such as:

* Case ID
* AI diagnosis
* AI confidence
* Human decision
* Human correction
* Correction reason
* Reviewer
* Timestamp

Review records are appended rather than overwriting previous records.

This provides an audit trail for evaluating AI performance and human corrections.

---

## 6. Analytics Dashboard

The frontend provides an interactive dashboard for viewing system information and review metrics.

The dashboard can display information such as:

* Total cases
* AI diagnoses
* Human reviews
* Accepted diagnoses
* Edited diagnoses
* Rejected diagnoses
* Confidence information
* OSI layer distribution
* Case distribution
* Review statistics

The frontend retrieves data dynamically from the FastAPI backend.

---

## 7. Case Management

The application provides access to available network troubleshooting cases.

Each case can contain information such as:

* Case ID
* Network topology
* Scenario
* Evidence
* Packet Tracer resources
* Network configuration information

Ground-truth diagnosis information is kept internal to the backend and is not unnecessarily exposed through the public API responses.

---

# System Architecture

```text
                    ┌──────────────────────┐
                    │      User / Admin    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │   Cisco Dashboard    │
                    └──────────┬───────────┘
                               │
                         HTTP / JSON
                               │
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌──────────────┐  ┌──────────────┐
       │ Case/Data  │   │ Rule Checker │  │ Review       │
       │ Loader     │   │              │  │ Service      │
       └────────────┘   └──────────────┘  └──────────────┘
              │                │                │
              │                │                ▼
              │                │       Responsible AI Log
              │                │
              └────────────┬───┘
                           ▼
                  ┌─────────────────┐
                  │ Diagnosis       │
                  │ Service         │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Gemini AI       │
                  │ Integration     │
                  └─────────────────┘
```

---

# Project Structure

```text
netsage-ai/
│
├── backend/
│   │
│   ├── api/
│   │   ├── main.py
│   │   ├── models.py
│   │   └── test_api.py
│   │
│   ├── data/
│   │   ├── responsible_ai_log.json
│   │   └── ...
│   │
│   ├── dataset/
│   │   ├── loader.py
│   │   └── test_loader.py
│   │
│   ├── diagnosis/
│   │   ├── service.py
│   │   └── test_service.py
│   │
│   ├── llm/
│   │   ├── service.py
│   │   └── test_service.py
│   │
│   ├── review/
│   │   ├── models.py
│   │   ├── service.py
│   │   └── test_review.py
│   │
│   └── rule_checker/
│       ├── checker.py
│       └── test_checker.py
│
├── frontend/
│   │
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── ...
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

---

# Technology Stack

## Frontend

* React
* Vite
* JavaScript
* HTML
* CSS
* React components
* REST API integration

## Backend

* Python
* FastAPI
* Uvicorn
* Pydantic
* Pytest

## AI

* Google Gemini API

## Data

* JSON
* CSV
* Local network troubleshooting datasets

---

# API Endpoints

## Health Check

### `GET /health`

Checks whether the backend is running.

Example:

```text
GET http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

---

## Diagnosis

### `POST /diagnose`

Generates an AI-assisted diagnosis for a network troubleshooting case.

Request:

```json
{
  "case_id": "NET-001"
}
```

The endpoint returns a structured diagnosis containing:

```text
case_id
diagnosis
    root_cause
    confidence
    evidence
    next_command
    fix_steps
    osi_layer
    concept
```

---

## Human Review

### `POST /review`

Stores a human review of an AI diagnosis.

The review can contain:

```text
case_id
ai_root_cause
ai_confidence
decision
human_correction
correction_reason
reviewer
```

---

## Cases

### `GET /cases`

Returns the available network troubleshooting cases required by the frontend.

---

## Evidence

### `GET /cases/{case_id}/evidence`

Returns available evidence associated with a case.

---

## Packet Tracer Resources

### `GET /cases/{case_id}/packet-tracer`

Provides Packet Tracer resources associated with a case when available.

---

## Review History

### `GET /reviews`

Returns stored human review information.

---

## AI Responses Log

### `GET /logs/ai-responses`

Provides AI diagnosis/review information required by the dashboard.

---

## Corrections Log

### `GET /logs/corrections`

Provides human correction information.

---

## Analytics

### `GET /analytics`

Returns aggregated metrics used by the frontend dashboard.

---

# Environment Configuration

Create a `.env` file for local development.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
```

For the frontend, configure the API base URL through Vite environment variables when required:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Do not commit `.env` files or API keys to GitHub.

The `.gitignore` should contain:

```gitignore
.env
frontend/.env
frontend/node_modules/
frontend/dist/
__pycache__/
*.pyc
.pytest_cache/
```

---

# Installation

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-name>
```

---

# Backend Setup

## 2. Create a Virtual Environment

Windows:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\Activate.ps1
```

---

## 3. Install Backend Dependencies

```powershell
pip install -r requirements.txt
```

---

## 4. Configure Environment Variables

Create:

```text
.env
```

and add the required Gemini configuration:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
```

---

# Start the Backend

From the project root:

```powershell
.venv\Scripts\python.exe -m uvicorn backend.api.main:app --host 127.0.0.1 --port 8000
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Test the Backend

Open another terminal in the project root.

Run:

```powershell
.venv\Scripts\python -m pytest
```

A successful test run should show all available tests passing, with only intentionally skipped tests if applicable.

---

# Test Backend Health

With the backend running:

```powershell
curl http://127.0.0.1:8000/health
```

In PowerShell, you can also use:

```powershell
Invoke-WebRequest http://127.0.0.1:8000/health -UseBasicParsing
```

Expected response:

```json
{
  "status": "ok"
}
```

---

# Test Diagnosis API

With the backend running:

```powershell
curl -X POST http://127.0.0.1:8000/diagnose `
  -H "Content-Type: application/json" `
  -d '{\"case_id\":\"NET-001\"}'
```

Expected result:

```text
HTTP 200 OK
```

with a structured diagnosis response.

You can also test the endpoint directly through Swagger:

```text
http://127.0.0.1:8000/docs
```

Then:

1. Open `POST /diagnose`
2. Click **Try it out**
3. Enter:

```json
{
  "case_id": "NET-001"
}
```

4. Click **Execute**
5. Verify that the response is `200 OK`.

---

# Frontend Setup

Open a second terminal.

Move into the frontend directory:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

---

# Start the Frontend

Run:

```powershell
npm run dev
```

Vite will display the local frontend URL in the terminal.

Open that URL in your browser.

The frontend communicates with the FastAPI backend through the configured API base URL.

---

# Frontend + Backend Workflow

The complete application workflow is:

```text
User opens dashboard
        │
        ▼
Frontend loads cases
        │
        ▼
User selects a case
        │
        ▼
Frontend sends POST /diagnose
        │
        ▼
FastAPI receives case_id
        │
        ▼
Dataset / evidence loaded
        │
        ▼
Rule checker evaluates available information
        │
        ▼
Diagnosis service processes the case
        │
        ▼
Gemini generates structured diagnosis
        │
        ▼
Backend validates response
        │
        ▼
Diagnosis returned to frontend
        │
        ▼
User reviews AI diagnosis
        │
        ▼
Human Review
        │
        ├── ACCEPTED
        ├── EDITED
        └── REJECTED
        │
        ▼
Review saved
        │
        ▼
Responsible AI Log updated
        │
        ▼
Analytics updated
```

---

# Error Handling

The backend uses controlled exception handling.

Internal errors are not exposed directly to the client.

For unexpected backend errors, the API returns:

```json
{
  "detail": "Unexpected backend error occurred."
}
```

Detailed exceptions and stack traces are logged server-side for debugging.

Sensitive information such as:

* Gemini API keys
* Internal exception details
* Internal file paths
* Stack traces

should not be returned in API responses.

---

# Security Considerations

NetSage AI follows several security practices:

### API Key Protection

Gemini credentials are stored in environment variables.

They are not included in frontend code.

### Ground Truth Protection

Ground-truth fields used internally for evaluation are not unnecessarily exposed through diagnosis responses.

### Error Protection

Internal exceptions are logged on the server rather than returned to users.

### Git Protection

Environment files and frontend dependencies are excluded through `.gitignore`.

---

# Testing

The backend contains tests for:

* API endpoints
* Dataset loading
* Diagnosis service
* Gemini service
* Review service
* Rule checker
* API integration
* Human review workflow

Run all tests:

```powershell
.venv\Scripts\python -m pytest
```

Example successful result:

```text
85 passed, 1 skipped
```

The exact number may change as new tests are added.

---

# Development Workflow

Recommended development workflow:

```text
1. Start backend
        ↓
2. Verify /health
        ↓
3. Start frontend
        ↓
4. Open dashboard
        ↓
5. Load cases
        ↓
6. Run diagnosis
        ↓
7. Review diagnosis
        ↓
8. Submit human review
        ↓
9. Verify analytics/logs
        ↓
10. Run pytest
        ↓
11. Run frontend build
        ↓
12. Commit changes
```

---

# Frontend Production Build

From the project root:

```powershell
npm --prefix frontend run build
```

Or:

```powershell
cd frontend
npm run build
```

The production build is generated in:

```text
frontend/dist/
```

This directory should not be committed to Git.

---

# API Documentation

FastAPI automatically provides interactive API documentation.

Once the backend is running, open:

```text
http://127.0.0.1:8000/docs
```

You can use Swagger UI to test:

* Health check
* Diagnosis
* Reviews
* Cases
* Evidence
* Logs
* Analytics

---

# Responsible AI

Human oversight is a core part of NetSage AI.

The system does not treat AI-generated diagnoses as automatically correct.

Instead:

```text
AI Diagnosis
     ↓
Human Review
     ↓
Accept / Edit / Reject
     ↓
Responsible AI Log
```

This enables:

* Human oversight
* Error identification
* Correction tracking
* AI performance evaluation
* Auditability

---

# Current Status

### Backend

* FastAPI API implemented
* Gemini integration implemented
* Diagnosis workflow implemented
* Rule checker implemented
* Human review implemented
* Responsible AI logging implemented
* Analytics endpoints implemented
* API error handling implemented
* Backend tests passing

### Frontend

* React dashboard implemented
* Backend API integration implemented
* Dynamic case loading implemented
* Dynamic diagnosis workflow implemented
* Human review workflow integrated
* Analytics connected to backend
* Logs connected to backend
* Vite development setup configured

### Integration

```text
React Frontend
      ↕
FastAPI REST API
      ↕
Diagnosis + Review Services
      ↕
Gemini + Local Dataset
```

---

# Future Improvements

Potential future improvements include:

* Cisco Packet Tracer integration
* More network troubleshooting cases
* Improved evidence extraction
* Advanced network topology visualization
* Authentication and role-based access
* Database-backed persistence
* Improved AI evaluation metrics
* Automated diagnosis benchmarking
* More detailed Responsible AI analytics
* Deployment to a cloud environment
* CI/CD pipeline
* Containerized deployment using Docker

# Project Goal

NetSage AI aims to combine **networking knowledge, deterministic troubleshooting, generative AI, and human expertise** into a single platform for explainable and responsible network diagnosis.

The project focuses not only on generating an answer, but also on showing:

```text
What is the problem?
        ↓
Why does the AI think it is the problem?
        ↓
What evidence supports it?
        ↓
What should be checked next?
        ↓
How should it be fixed?
        ↓
Was the AI diagnosis correct?
        ↓
What did the human reviewer decide?
```

This creates a complete AI-assisted network troubleshooting workflow rather than a simple chatbot.
