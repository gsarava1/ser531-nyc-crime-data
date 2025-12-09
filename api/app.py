import os
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from SPARQLWrapper import SPARQLWrapper, JSON
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

GRAPHDB_ENDPOINT = os.getenv("GRAPHDB_ENDPOINT", "http://localhost:7200/repositories/nycrime_test")
FLASK_PORT = int(os.getenv("FLASK_PORT", "8000"))

app = Flask(__name__)
CORS(app)  

def run_sparql(query: str):
    sparql = SPARQLWrapper(GRAPHDB_ENDPOINT)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(query)
    results = sparql.query().convert()
    return results

def load_query(filename: str) -> str:
    q_path = Path(__file__).resolve().parent / "queries" / filename
    with open(q_path, "r", encoding="utf-8") as f:
        return f.read()



@app.get("/api/boroughs")
def boroughs():
    query = load_query("boroughs.rq")
    results = run_sparql(query)
    return jsonify(results)

@app.get("/api/trend")
def trend():
    
    query = load_query("trend_by_month.rq")
    results = run_sparql(query)
    return jsonify(results)

@app.get("/api/victim_race")
def victim_race():
   
    query = load_query("victim_race.rq")
    results = run_sparql(query)
    return jsonify(results)

@app.get("/api/crime_type")
def crime_type():
    
    query = load_query("crime_type.rq")
    results = run_sparql(query)
    return jsonify(results)

@app.get("/api/events")
def events():
    
    borough = request.args.get("borough")
    query = load_query("events_by_borough.rq")

    if borough and borough != "ALL":
        query = query.replace("##BOROUGH_FILTER##",
                      f'FILTER(STR(?borough) = "{borough}")')
    else:
        query = query.replace("##BOROUGH_FILTER##", "")
 
    results = run_sparql(query)
    return jsonify(results)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=FLASK_PORT, debug=True)
