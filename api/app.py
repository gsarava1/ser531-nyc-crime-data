from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)

# ----------------------------------------
# CONFIG
# ----------------------------------------
GRAPHDB_URL = "http://localhost:7200/repositories/nycrime_test"

QUERY_DIR = os.path.join(os.path.dirname(__file__), "queries")


# ----------------------------------------
# Load .rq file
# ----------------------------------------
def load_query(filename):
    path = os.path.join(QUERY_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


# ----------------------------------------
# Execute SPARQL query on GraphDB
# ----------------------------------------
def run_query(query):
    try:
        res = requests.post(
            GRAPHDB_URL,
            data=query,
            headers={
                "Content-Type": "application/sparql-query",
                "Accept": "application/sparql-results+json",
            },
        )
        res.raise_for_status()
        return res.json()
    except Exception as e:
        return jsonify({"error": str(e), "query": query}), 500


# ----------------------------------------
# API: /api/events
# Supports: ?year=2015
# ----------------------------------------
@app.route("/api/events")
def api_events():
    year = request.args.get("year")
    month = request.args.get("month")
    crime = request.args.get("crime")
    limit = request.args.get("limit")

    q = load_query("events.rq")

    if year:
        q = q.replace("##YEAR_FILTER##", f"FILTER(YEAR(?date) = {year})")
    else:
        q = q.replace("##YEAR_FILTER##", "")

    if month:
        q = q.replace("##MONTH_FILTER##", f"FILTER(MONTH(?date) = {month})")
    else:
        q = q.replace("##MONTH_FILTER##", "")

    if crime and crime != "ALL":
        q = q.replace("##CRIME_FILTER##",
                      f'FILTER(STR(?crimeType) = "{crime}")')
    else:
        q = q.replace("##CRIME_FILTER##", "")

    if limit:
        q = q.replace("##LIMIT##", f"LIMIT {int(limit)}")
    else:
        q = q.replace("##LIMIT##", "LIMIT 1000")  # default 1000

    return run_query(q)

@app.route("/api/borough_stats")
def api_borough_stats():
    year = request.args.get("year")
    month = request.args.get("month")
    crime = request.args.get("crime")

    q = load_query("borough_stats.rq")

    if year:
        q = q.replace("##YEAR_FILTER##", f"FILTER(YEAR(?date) = {year})")
    else:
        q = q.replace("##YEAR_FILTER##", "")

    if month:
        q = q.replace("##MONTH_FILTER##", f"FILTER(MONTH(?date) = {month})")
    else:
        q = q.replace("##MONTH_FILTER##", "")

    if crime and crime != "ALL":
        q = q.replace("##CRIME_FILTER##",
                      f'FILTER(STR(?crimeType) = "{crime}")')
    else:
        q = q.replace("##CRIME_FILTER##", "")

    return run_query(q)

# ----------------------------------------
# MAIN
# ----------------------------------------
if __name__ == "__main__":
    print("Backend running at http://localhost:8000")
    app.run(host="0.0.0.0", port=8000, debug=True)
