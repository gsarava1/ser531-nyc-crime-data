import React, { useEffect, useState } from "react";
import BoroughBarChart from "./components/BoroughBarChart.jsx";
import TrendLineChart from "./components/TrendLineChart.jsx";
import VictimRaceChart from "./components/VictimRaceChart.jsx";
import EventList from "./components/EventList.jsx";

const API_BASE = "http://localhost:8000";

const App = () => {
  const [boroughData, setBoroughData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [victimRaceData, setVictimRaceData] = useState([]);
  const [selectedBorough, setSelectedBorough] = useState("");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const mapBoroughResponse = (json) =>
    json.results.bindings.map((b) => ({
      borough: b.borough.value,
      count: Number(b.count.value)
    }));

  const mapTrendResponse = (json) =>
    json.results.bindings.map((b) => ({
      yearMonth: b.yearMonth.value,
      count: Number(b.count.value)
    }));

  const mapVictimRaceResponse = (json) =>
    json.results.bindings.map((b) => ({
      race: b.race.value,
      count: Number(b.count.value)
    }));

  const mapEventsResponse = (json) =>
    json.results.bindings.map((b) => ({
      id: b.id.value,
      date: b.date.value,
      lat: Number(b.lat.value),
      lon: Number(b.lon.value),
      borough: b.borough ? b.borough.value : null
    }));

  useEffect(() => {
    fetch(`${API_BASE}/api/boroughs`)
      .then((r) => r.json())
      .then((j) => setBoroughData(mapBoroughResponse(j)))
      .catch((e) => console.error("Error loading boroughs", e));

    fetch(`${API_BASE}/api/trend`)
      .then((r) => r.json())
      .then((j) => setTrendData(mapTrendResponse(j)))
      .catch((e) => console.error("Error loading trend", e));

    fetch(`${API_BASE}/api/victim_race`)
      .then((r) => r.json())
      .then((j) => setVictimRaceData(mapVictimRaceResponse(j)))
      .catch((e) => console.error("Error loading victim race", e));
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      try {
        const url = selectedBorough
          ? `${API_BASE}/api/events?borough=${encodeURIComponent(
              selectedBorough
            )}`
          : `${API_BASE}/api/events`;

        const res = await fetch(url);
        const json = await res.json();
        setEvents(mapEventsResponse(json));
      } catch (err) {
        console.error("Error loading events", err);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, [selectedBorough]);

  const boroughOptions = [...new Set(boroughData.map((b) => b.borough))];

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "1.5rem",
        maxWidth: 1200,
        margin: "0 auto"
      }}
    >
      <h1 style={{ marginBottom: "0.25rem" }}>
        NY Crime Knowledge Graph Dashboard
      </h1>
      <p style={{ marginTop: 0, color: "#555", fontSize: "0.9rem" }}>
        Backed by GraphDB + SPARQL (NYPD Shooting Incident Data).
      </p>

      
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginTop: "1rem"
        }}
      >
        <div>
          <BoroughBarChart data={boroughData} />
        </div>
        <div>
          <TrendLineChart data={trendData} />
        </div>
      </div>

      
      <div style={{ marginTop: "2rem" }}>
        <VictimRaceChart data={victimRaceData} />
      </div>

      
      <div style={{ marginTop: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem"
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Event Details</h2>
          <span style={{ fontSize: "0.85rem", color: "#555" }}>
            (Latest 500 events)
          </span>
        </div>

        <label style={{ fontSize: "0.85rem", marginRight: "0.5rem" }}>
          Filter by Borough:
        </label>
        <select
          value={selectedBorough}
          onChange={(e) => setSelectedBorough(e.target.value)}
          style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}
        >
          <option value="">All</option>
          {boroughOptions.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {loadingEvents ? (
          <p style={{ marginTop: "0.5rem" }}>Loading events...</p>
        ) : (
          <EventList events={events} />
        )}
      </div>
    </div>
  );
};

export default App;
