import React, { useEffect, useState } from "react";

import BoroughCrimeTotals from "./components/BoroughCrimeTotals.jsx";
import CrimeTrendByYear from "./components/CrimeTrendByYear.jsx";
import CrimeTypeDistribution from "./components/CrimeTypePieChart.jsx";
import CrimeByHour from "./components/CrimeByHour.jsx";
import TopCrimeTypesByBorough from "./components/TopCrimeTypesByBorough.jsx";
import CrimeMatrixHeatmap from "./components/BoroughCrimeMatrixHeatmap.jsx";
import CrimeLeafletMap from "./components/CrimeLeafletMap.jsx";

const API = "http://localhost:8000";

/* Utility: Safe wrapper to prevent crashes */
const safe = (fn, fallback = []) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export default function App() {
  // ---------------------- STATE ----------------------
  const [boroughTotals, setBoroughTotals] = useState([]);
  const [trendYear, setTrendYear] = useState("2015");
  const [trendData, setTrendData] = useState([]);
  const [crimeTypeDist, setCrimeTypeDist] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [selectedBorough, setSelectedBorough] = useState("");
  const [topCrimeTypes, setTopCrimeTypes] = useState([]);
  const [matrixData, setMatrixData] = useState([]);
  const [mapEvents, setMapEvents] = useState([]);

  // ---------------------- FETCH HELPERS ----------------------
  async function fetchJSON(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      return json;
    } catch (err) {
      console.error("Fetch error:", url, err);
      return null;
    }
  }

  // ---------------------- LOAD DATA ----------------------

  // Borough totals
  useEffect(() => {
    (async () => {
      const json = await fetchJSON(`${API}/api/boroughs`);
      const mapped = safe(
        () =>
          json.results.bindings.map((b) => ({
            borough: b.borough.value,
            count: Number(b.count.value),
          })),
        []
      );
      setBoroughTotals(mapped);
    })();
  }, []);

  // Trend by year
  useEffect(() => {
    (async () => {
      const json = await fetchJSON(`${API}/api/trend_by_year?year=${trendYear}`);

      const raw = safe(() => json.results.bindings, []);

      const monthMap = {};

      raw.forEach((b) => {
        if (!b.month || !b.count) return;  // skip 無效 row

        const month = Number(b.month.value);
        const count = Number(b.count.value);

        if (!monthMap[month]) monthMap[month] = 0;
        monthMap[month] += count;
      });

      const finalData = Object.keys(monthMap).map((m) => ({
        month: Number(m),
        count: monthMap[m],
      }));

      finalData.sort((a, b) => a.month - b.month);

      setTrendData(finalData);
    })();
  }, [trendYear]);


  // Crime type distribution
  useEffect(() => {
    (async () => {
      const json = await fetchJSON(`${API}/api/crime_type`);

      const mapped = safe(
        () =>
          json.results.bindings.map((b) => ({
            type: b.crimeType.value,
            count: Number(b.count.value),
          })),
        []
      );

      setCrimeTypeDist(mapped);
    })();
  }, []);


  // Hourly crime
  useEffect(() => {
    (async () => {
      const json = await fetchJSON(`${API}/api/crime_by_hour`);
      const mapped = safe(
        () =>
        json.results.bindings
        .filter(b => b.hour)  // 忽略沒有 hour 的
        .map(b => ({
          hour: Number(b.hour.value),
          count: Number(b.count.value),
      })),
  []
);
      setHourlyData(mapped);
    })();
  }, []);

  // Top crime types by borough
  useEffect(() => {
    (async () => {
      const boroughParam = selectedBorough ? `?borough=${selectedBorough}` : "";
      const json = await fetchJSON(`${API}/api/top_crimes${boroughParam}`);
      const mapped = safe(
        () =>
          json.results.bindings.map((b) => ({
            type: b.type.value,
            count: Number(b.count.value),
          })),
        []
      );
      setTopCrimeTypes(mapped);
    })();
  }, [selectedBorough]);


  // ---------------------- RENDER UI ----------------------
  return (
    <div style={{ fontFamily: "system-ui", padding: "1.5rem", maxWidth: 1400, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 4 }}>NYC Crime Analytics Dashboard</h1>
      <p style={{ color: "#666", marginTop: 0, marginBottom: "1rem" }}>
        Powered by GraphDB + SPARQL + React
      </p>

      {/* ---------- GRID LAYOUT ---------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* Borough totals */}
        <div>
          <BoroughCrimeTotals data={boroughTotals} />
        </div>

        {/* Trend by year */}
        <div>
          <CrimeTrendByYear
            data={trendData}
            year={trendYear}
            onChangeYear={setTrendYear}
          />
        </div>

        {/* Pie chart */}
        <div>
          <CrimeTypeDistribution data={crimeTypeDist} />
        </div>

        {/* Hourly */}
        <div>
          <CrimeByHour data={hourlyData} />
        </div>

        {/* Top crimes */}
        <div>
          <TopCrimeTypesByBorough
            data={topCrimeTypes}
            borough={selectedBorough}
            onChangeBorough={setSelectedBorough}
          />
        </div>

        {/* Heatmap */}
        <div>
          <CrimeMatrixHeatmap data={matrixData} />
        </div>


      </div>
    </div>
  );
}
