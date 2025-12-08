import os
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from SPARQLWrapper import SPARQLWrapper, JSON
from dotenv import load_dotenv

# Load environment variables from ../.env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

GRAPHDB_ENDPOINT = os.getenv("GRAPHDB_ENDPOINT", "http://localhost:7200/repositories/nycrime")
FLASK_PORT = int(os.getenv("FLASK_PORT", "8000"))

app = Flask(__name__)
CORS(app)  # allow calls from React dev server

def run_sparql(query: str):
    """Run a SPARQL SELECT query against GraphDB and return JSON results."""
    sparql = SPARQLWrapper(GRAPHDB_ENDPOINT)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(query)
    # GET is usually fine; can use POST if size gets big.
    results = sparql.query().convert()
    return results

def load_query(filename: str) -> str:
    """Load a .rq file from the queries directory."""
    q_path = Path(__file__).resolve().parent / "queries" / filename
    with open(q_path, "r", encoding="utf-8") as f:
        return f.read()

# ------------------- Endpoints -------------------

@app.get("/api/boroughs")
def boroughs():
    """
    GET /api/boroughs
    Returns: events per borough (for bar chart).
    """
    query = load_query("boroughs.rq")
    results = run_sparql(query)
    return jsonify(results)

@app.get("/api/trend")
def trend():
    """
    GET /api/trend
    Returns: monthly trend of events (YYYY-MM).
    """
    query = load_query("trend_by_month.rq")
    results = run_sparql(query)
    return jsonify(results)

@app.get("/api/victim_race")
def victim_race():
    """
    GET /api/victim_race
    Returns: distribution of victim race.
    """
    query = load_query("victim_race.rq")
    results = run_sparql(query)
    return jsonify(results)

@app.get("/api/crime_type")
def crime_type():
    """
    GET /api/crime_type
    Returns: distribution of crime types (Shooting, Robbery, etc.).
    """
    query = load_query("crime_type.rq")
    results = run_sparql(query)
    return jsonify(results)

@app.get("/api/events")
def events():
    """
    GET /api/events
    Optional query param: ?borough=MANHATTAN
    Returns: up to 500 events (id, date, lat, lon, borough).
    """
    borough = request.args.get("borough")
    base_query = load_query("events_by_borough.rq")

    # If borough filter is given, inject a FILTER
    if borough:
        filter_clause = f"""
        FILTER(LCASE(STR(?borough)) = LCASE("{borough}"))
        """
        # Cheap way: append filter at end of WHERE block before ORDER BY/LIMIT
        # Our .rq already has ?borough as OPTIONAL, so this is safe.
        insert_point = "ORDER BY"
        if insert_point in base_query:
            parts = base_query.split(insert_point)
            query = parts[0] + filter_clause + "\n" + insert_point + parts[1]
        else:
            query = base_query + "\n" + filter_clause
    else:
        query = base_query

    results = run_sparql(query)
    return jsonify(results)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=FLASK_PORT, debug=True)