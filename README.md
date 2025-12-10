# NY Crime Knowledge Graph Dashboard

A full-stack application that visualizes NYC crime data using a SPARQL-backed knowledge graph. The system consists of a Python Flask API that queries a GraphDB RDF repository and a React/Vite frontend that displays interactive charts and crime event details.

**Tech Stack:**
- **Backend:** Python Flask, SPARQLWrapper
- **Database:** GraphDB (RDF triple store) with Turtle-formatted ontology
- **Frontend:** React, Vite, Plotly.js
- **Data Format:** OWL/Turtle semantic web ontology

---

## Prerequisites

Before you begin, ensure you have installed:

1. **Python 3.8+** ([Download](https://www.python.org/downloads/))
2. **Node.js 16+** ([Download](https://nodejs.org/))
3. **GraphDB** 
   - The application expects GraphDB running on `http://localhost:7200`

---





## Setup Instructions

### Step 1: Install GraphDB and Import Data

1. **Download and install GraphDB**.
2. **Start GraphDB** (usually runs on `http://localhost:7200`).
3. **Create a new repository** named `nycrime`:
   - Open GraphDB Web UI: http://localhost:7200
   - Go to **Admin** → **Repositories** → **Create new repository**
4. **Import the ontology**:
   - In the repository, go to **Import** → **RDF**
   - Select `NYC_Crime.owl` from the project root
   - Click **Import**
   - (Note: You may see a Turtle format warning, but the import should succeed)

### Step 2: Set Up the Backend (Flask API)

Open PowerShell and navigate to the `api` directory:

```powershell
cd C:\SER532_Project_main\ser531-nyc-crime-data\api
```

#### Create and activate the virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

#### Install dependencies:

```powershell
pip install -r requirements.txt
```

#### Verify the `.env` file:

The `.env` file in the project root should contain:
```
GRAPHDB_ENDPOINT=http://localhost:7200/repositories/nycrime
FLASK_PORT=8000
```

If it doesn't exist, create it with the above content.

#### Start the Flask server:

```powershell
python app.py
```

You should see:
```
* Serving Flask app 'app'
* Running on http://127.0.0.1:8000
```

The API is now running on **http://localhost:8000**.

### Step 3: Set Up the Frontend (React + Vite)

Open a **new PowerShell window** and navigate to the `web` directory:

```powershell
cd C:\SER532_Project_main\ser531-nyc-crime-data\web
```

#### Create and activate the virtual environment (optional, for package management):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

#### Install Node dependencies:

```powershell
npm install
```

#### Start the development server:

```powershell
npm run dev
```

You should see:
```
VITE v5.4.21  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

The frontend is now running on **http://localhost:5173**.

---

## Running the Project

Once both services are running:

1. **Keep Flask API running** in the first PowerShell terminal (http://localhost:8000)
2. **Keep Vite dev server running** in the second PowerShell terminal (http://localhost:5173)
3. **Open your browser** and navigate to:
   ```
   http://localhost:5173
   ```

You should see the **NY Crime Knowledge Graph Dashboard** with:
- **Crime by Borough** (bar chart)
- **Crime Trends Over Time** (line chart)
- **Victim Demographics by Race** (chart)
- **Event Details List** (filterable by borough)

---

