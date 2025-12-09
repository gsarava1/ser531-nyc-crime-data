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


# -----------------------------------
# Core query executor
# -----------------------------------
def run_query(query):
    sparql = SPARQLWrapper(GRAPHDB_ENDPOINT)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(query)
    return sparql.query().convert()


def load_query(fname):
    qpath = Path(__file__).resolve().parent / "queries" / fname
    with open(qpath, "r", encoding="utf-8") as f:
        return f.read()


# -----------------------------------
# 1. Borough totals
# -----------------------------------
@app.get("/api/boroughs")
def boroughs():
    q = load_query("boroughs.rq")
    return jsonify(run_query(q))


# -----------------------------------
# 2. Trend by year
# -----------------------------------
@app.get("/api/trend_by_year")
def trend_by_year():
    print("\n====== /api/trend_by_year CALLED ======")
    year = request.args.get("year", "2015")
    print("YEAR =", year)

    q = load_query("trend_by_year.rq")
    print("LOADED QUERY:", q)

    q = q.replace("##YEAR_FILTER##", f"FILTER(YEAR(?date) = {year})")
    print("FINAL QUERY:", q)

    result = run_query(q)
    print("RESULT:", result)
    return jsonify(result)



# -----------------------------------
# 3. Crime type distribution (pie chart)
# -----------------------------------
@app.get("/api/crime_type")
def crime_type():
    q = load_query("crime_type.rq")
    return jsonify(run_query(q))

@app.get("/api/victim_race")
def victim_race():
    query = load_query("victim_race.rq")
    results = run_sparql(query)
    return jsonify(results)

# -----------------------------------
# 4. Crime by hour
# -----------------------------------
@app.get("/api/crime_by_hour")
def crime_by_hour():
    print("\n====== /api/crime_by_hour CALLED ======")
    q = load_query("crime_by_hour.rq")
    print("QUERY:", q)
    result = run_query(q)
    print("RESULT:", result)
    return jsonify(result)



# -----------------------------------
# 5. Events (filter: borough)
# -----------------------------------
@app.get("/api/events")
def events():
    borough = request.args.get("borough")
    base_query = load_query("events_by_borough.rq")

    if borough:
        filter_clause = f"""
        FILTER(LCASE(STR(?boroughName)) = LCASE("{borough}"))
        """
        insert_point = "ORDER BY"

        if insert_point in base_query:
            parts = base_query.split(insert_point)
            q = parts[0] + filter_clause + "\n" + insert_point + parts[1]
        else:
            q = base_query + "\n" + filter_clause
    else:
        q = base_query

    return jsonify(run_query(q))



# -----------------------------------
# 7. Top Crime Types per Borough
# -----------------------------------
@app.get("/api/top_crimes")
def top_crimes():
    borough = request.args.get("borough")

    q = load_query("top_crimes.rq")

    # only add filter if borough is provided
    if borough:
        filter_clause = f'FILTER (LCASE(STR(?b)) = LCASE("{borough}"))'
        q = q.replace("GROUP BY", f"{filter_clause}\nGROUP BY")

    print("=== RAW QUERY START ===")
    print(q)
    print("=== RAW QUERY END ===")

    return jsonify(run_query(q))




# -----------------------------------
# main
# -----------------------------------
if __name__ == "__main__":
    # Debug: show all registered routes
    with app.app_context():
        print("Registered routes:")
        for rule in app.url_map.iter_rules():
            print(rule)

    app.run(host="0.0.0.0", port=FLASK_PORT, debug=True)
