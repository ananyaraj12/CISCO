Absolutely — here is a **complete `README.md` in one single block** that you can directly copy-paste into GitHub.

````markdown
# NetSage AI

NetSage AI is an AI-powered network diagnosis system designed to analyze common computer-networking issues and provide structured troubleshooting recommendations.

The system combines a rule-based network diagnostic engine with Google's Gemini API to generate explainable AI-based diagnoses. It also includes a human-review workflow that allows reviewers to accept, edit, or reject AI-generated diagnoses while maintaining a Responsible AI audit log.

---

## 🚀 Features

- AI-powered network fault diagnosis
- Rule-based network configuration checking
- CSV-based network case dataset
- Google Gemini integration
- Structured AI diagnosis using Pydantic models
- FastAPI REST API
- Swagger/OpenAPI documentation
- Human-in-the-loop review workflow
- Responsible AI logging
- AI confidence scoring
- Evidence-based diagnosis
- Recommended next troubleshooting command
- Suggested network fix steps
- OSI layer and networking concept classification
- Input validation and error handling
- Automated backend test suite
- Ground-truth protection from API responses

---

## 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │     Client/User     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     FastAPI API     │
                         │                     │
                         │ /health             │
                         │ /diagnose           │
                         │ /review             │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    │                                │
                    ▼                                ▼
          ┌──────────────────┐             ┌──────────────────┐
          │ Dataset Loader   │             │ Human Review      │
          │                  │             │ Service           │
          │ cases.csv        │             │                  │
          └────────┬─────────┘             └────────┬─────────┘
                   │                                │
                   ▼                                ▼
          ┌──────────────────┐             ┌──────────────────┐
          │ Diagnosis        │             │ Responsible AI   │
          │ Service          │             │ Log              │
          └────────┬─────────┘             │                  │
                   │                       │ JSON audit log   │
                   ▼                       └──────────────────┘
          ┌──────────────────┐
          │ Rule Checker     │
          │                  │
          │ Network Rules    │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Gemini Diagnosis │
          │ Service          │
          │                  │
          │ Gemini API       │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Structured AI    │
          │ Diagnosis        │
          └──────────────────┘
````

---

## 🛠️ Tech Stack

### Backend

* Python
* FastAPI
* Uvicorn
* Pydantic
* Pytest

### AI / LLM

* Google Gemini API
* Gemini Flash model

### Data

* CSV
* JSON

### Development

* Git
* GitHub
* Python Virtual Environment

---

## 📁 Project Structure

```text
netsage AI/
│
├── backend/
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── test_api.py
│   │
│   ├── dataset/
│   │   ├── __init__.py
│   │   ├── loader.py
│   │   └── test_loader.py
│   │
│   ├── diagnosis/
│   │   ├── __init__.py
│   │   ├── service.py
│   │   └── test_service.py
│   │
│   ├── llm/
│   │   ├── __init__.py
│   │   ├── service.py
│   │   └── test_service.py
│   │
│   ├── review/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── service.py
│   │   └── test_review.py
│   │
│   ├── rule_checker/
│   │   ├── __init__.py
│   │   ├── checker.py
│   │   └── test_checker.py
│   │
│   ├── data/
│   │   ├── cases.csv
│   │   └── responsible_ai_log.json
│   │
│   └── check_env.py
│
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

> **Important:** The `.env` file should not be committed to GitHub because it contains the Gemini API key.

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/netsage-ai.git
cd netsage-ai
```

Replace `YOUR-USERNAME` with your GitHub username.

---

## 2. Create a Virtual Environment

### Windows

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\Activate.ps1
```

---

## 3. Install Dependencies

```powershell
pip install -r requirements.txt
```

If `requirements.txt` is not available, install the required packages:

```powershell
pip install fastapi uvicorn httpx python-dotenv pytest google-genai
```

---

# 🔑 Gemini API Configuration

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Replace:

```text
your_gemini_api_key_here
```

with your actual Gemini API key.

### ⚠️ Security

Never commit your API key to GitHub.

Make sure `.gitignore` contains:

```gitignore
.env
.venv/
__pycache__/
*.pyc
.pytest_cache/
```

---

# ▶️ Running the Backend

Start the FastAPI server using:

```powershell
.venv\Scripts\python.exe -m uvicorn backend.api.main:app --reload
```

The server will start at:

```text
http://127.0.0.1:8000
```

---

# 📚 API Documentation

Once the server is running, open:

```text
http://127.0.0.1:8000/docs
```

FastAPI automatically provides an interactive Swagger UI where the API endpoints can be tested.

---

# 🔍 API Endpoints

## 1. Health Check

### Request

```http
GET /health
```

### Response

```json
{
  "status": "ok"
}
```

---

# 🧠 2. Network Diagnosis

### Endpoint

```http
POST /diagnose
```

### Request

```json
{
  "case_id": "NET-001"
}
```

The API:

1. Loads the requested network case from the dataset.
2. Creates the diagnosis context.
3. Runs rule-based network checks.
4. Sends the relevant context to Gemini.
5. Validates the generated response.
6. Returns a structured AI diagnosis.

### Example Response

```json
{
  "case_id": "NET-001",
  "diagnosis": {
    "root_cause": "Unable to determine the definitive root cause due to missing network state information.",
    "confidence": 0.3,
    "evidence": [
      "Structured network-state data is unavailable in the input."
    ],
    "next_command": "show ip interface brief",
    "fix_steps": [
      "Verify interface status.",
      "Verify VLAN configuration.",
      "Verify IP address and default gateway configuration."
    ],
    "osi_layer": "Network",
    "concept": "IP Connectivity"
  }
}
```

---

# 👨‍💻 3. Human Review

### Endpoint

```http
POST /review
```

The review endpoint allows a human reviewer to evaluate an AI-generated diagnosis.

A reviewer can:

* Accept the diagnosis
* Edit the diagnosis
* Reject the diagnosis

---

## ACCEPTED Review

### Request

```json
{
  "case_id": "NET-001",
  "ai_root_cause": "Unable to determine the definitive root cause.",
  "ai_confidence": 0.3,
  "decision": "ACCEPTED",
  "reviewer": "reviewer-name"
}
```

---

## EDITED Review

```json
{
  "case_id": "NET-001",
  "ai_root_cause": "Unable to determine the definitive root cause.",
  "ai_confidence": 0.3,
  "decision": "EDITED",
  "human_correction": "The diagnosis should be corrected after reviewing the available network evidence.",
  "correction_reason": "The original diagnosis was incomplete.",
  "reviewer": "reviewer-name"
}
```

---

## REJECTED Review

```json
{
  "case_id": "NET-001",
  "ai_root_cause": "Unable to determine the definitive root cause.",
  "ai_confidence": 0.3,
  "decision": "REJECTED",
  "human_correction": "The generated diagnosis is not sufficiently supported by the available evidence.",
  "correction_reason": "Insufficient evidence.",
  "reviewer": "reviewer-name"
}
```

---

# 🤖 AI Diagnosis Output

Each diagnosis contains the following information:

| Field          | Description                                               |
| -------------- | --------------------------------------------------------- |
| `root_cause`   | AI-generated explanation of the suspected network problem |
| `confidence`   | Confidence score between 0 and 1                          |
| `evidence`     | Evidence supporting the diagnosis                         |
| `next_command` | Recommended network troubleshooting command               |
| `fix_steps`    | Suggested steps to resolve the issue                      |
| `osi_layer`    | Relevant OSI layer                                        |
| `concept`      | Networking concept involved                               |

---

# 🧪 Testing

The project contains automated tests for all major backend components.

Run the complete test suite:

```powershell
.venv\Scripts\python.exe -m pytest
```

Current test coverage includes:

```text
API
Dataset Loader
Diagnosis Service
Gemini LLM Service
Rule Checker
Human Review
```

The backend test suite currently verifies:

* API endpoints
* Request validation
* Response schemas
* Case ID lookup
* Case ID normalization
* Dataset loading
* Rule checking
* Diagnosis orchestration
* Gemini service behavior
* Human review validation
* Responsible AI logging
* Multiple sequential reviews
* Error handling
* Environment configuration
* End-to-end mocked API workflow

---

# 🛡️ Responsible AI

NetSage AI includes a human-in-the-loop review system.

AI-generated diagnoses are not treated as automatically correct.

Human reviewers can evaluate each diagnosis using three decisions:

```text
ACCEPTED
EDITED
REJECTED
```

Reviews are stored in:

```text
backend/data/responsible_ai_log.json
```

The log stores information such as:

* Case ID
* AI diagnosis
* AI confidence
* Human decision
* Human correction
* Correction reason
* Reviewer
* Timestamp

This provides an audit trail for evaluating AI performance and identifying cases where human intervention was required.

---

# 🔐 Security

The application follows several security practices:

### API Key Protection

The Gemini API key is stored in an environment variable:

```env
GEMINI_API_KEY=...
```

It is not returned through API responses.

### Ground Truth Protection

Expected answers and ground-truth fields from the dataset are kept internal to the backend and are not exposed through the `/diagnose` API response.

### Error Protection

Unexpected backend errors return a safe response:

```json
{
  "detail": "Unexpected backend error occurred."
}
```

Internal stack traces are logged only on the backend during debugging and are not exposed to API clients.

---

# 📊 Network Cases

The dataset contains network troubleshooting cases such as:

* Wrong VLAN assignment
* Trunk disabled
* Missing VLAN
* VLAN not allowed on trunk
* Access port configured as trunk
* Router subinterface shutdown
* Incorrect gateway IP
* Incorrect PC default gateway
* ACL blocking a host
* Router VLAN subinterface shutdown

Cases are identified using IDs such as:

```text
NET-001
NET-002
NET-003
...
NET-030
```

---

# 🔄 Diagnosis Workflow

```text
User
  │
  ▼
POST /diagnose
  │
  ▼
Case ID Validation
  │
  ▼
Load Case from cases.csv
  │
  ▼
Prepare Diagnosis Context
  │
  ├───────────────┐
  ▼               ▼
Rule Checker     Network Context
  │               │
  └───────┬───────┘
          ▼
   Gemini Diagnosis
          │
          ▼
   Structured Output
          │
          ▼
    Pydantic Validation
          │
          ▼
     API Response
          │
          ▼
    Human Review
          │
     ┌────┼────┐
     ▼    ▼    ▼
 ACCEPT EDIT REJECT
     │    │    │
     └────┼────┘
          ▼
 Responsible AI Log
```

---

# 📈 Error Handling

The API handles different classes of errors:

| Status Code | Meaning                             |
| ----------- | ----------------------------------- |
| `200`       | Successful request                  |
| `400`       | Invalid request/business validation |
| `404`       | Requested case does not exist       |
| `422`       | Invalid request body                |
| `500`       | Unexpected backend error            |

Example for an invalid case:

```json
{
  "case_id": "NET-999"
}
```

Response:

```json
{
  "detail": "Requested case does not exist."
}
```

---

# 🧑‍💻 Development

Run the application in development mode:

```powershell
.venv\Scripts\python.exe -m uvicorn backend.api.main:app --reload
```

Then open:

```text
http://127.0.0.1:8000/docs
```

---

# 📌 Example Complete Workflow

### Step 1 — Start the server

```powershell
.venv\Scripts\python.exe -m uvicorn backend.api.main:app --reload
```

### Step 2 — Open Swagger

```text
http://127.0.0.1:8000/docs
```

### Step 3 — Diagnose a case

```json
{
  "case_id": "NET-001"
}
```

### Step 4 — Review the diagnosis

Submit the generated diagnosis to:

```text
POST /review
```

### Step 5 — Choose a review decision

```text
ACCEPTED
```

or

```text
EDITED
```

or

```text
REJECTED
```

### Step 6 — Verify the audit log

Check:

```text
backend/data/responsible_ai_log.json
```

---

# 📝 Current Project Status

```text
Backend Architecture        ✅ Complete
CSV Dataset Integration     ✅ Complete
Rule-Based Diagnosis        ✅ Complete
Gemini Integration          ✅ Complete
FastAPI API Layer           ✅ Complete
Human Review Workflow       ✅ Complete
Responsible AI Logging      ✅ Complete
API Validation              ✅ Complete
Error Handling              ✅ Complete
Automated Testing           ✅ Complete
Swagger API Documentation   ✅ Complete
```

---

# 🚀 Future Improvements

Possible future improvements include:

* Frontend dashboard
* Network topology visualization
* Cisco Packet Tracer integration
* More network fault cases
* Real-time network monitoring
* Authentication and authorization
* Database-backed review storage
* Reviewer dashboard
* AI performance analytics
* Diagnosis accuracy metrics
* Confidence calibration
* Model comparison
* Deployment using Docker
* Cloud deployment

---

# 👥 Contributors

NetSage AI is developed as a collaborative AI/networking project.

Add project contributors here:

```text
- Your Name
- Team Member 1
- Team Member 2
- Team Member 3
```

---

# 📄 License

This project is intended for educational and development purposes.

Add an appropriate open-source license if you plan to distribute the project publicly.

````

### One important correction before you push it

In the README, **don't put your real `GEMINI_API_KEY` anywhere**. Also, if your actual model is currently `gemini-3.6-flash` rather than `gemini-2.5-flash`, change this line:

```env
GEMINI_MODEL=gemini-2.5-flash
````

to whatever model is actually present in your `.env`.

And make sure `.env` is in `.gitignore` before pushing.
