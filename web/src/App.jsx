import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "leaflet.heat";
import "leaflet.markercluster";

const API = "http://localhost:8000";

export default function App() {
  const [points, setPoints] = useState([]);
  const [heatPoints, setHeatPoints] = useState([]);

  const [boroughShapes, setBoroughShapes] = useState(null);
  const [boroughStats, setBoroughStats] = useState({}); // fix

  const [year, setYear] = useState("ALL");
  const [month, setMonth] = useState("ALL");
  const [crimeType, setCrimeType] = useState("ALL");
  const [limit, setLimit] = useState("1000");

  // layer toggles
  const [showHeat, setShowHeat] = useState(true);
  const [showCluster, setShowCluster] = useState(true);
  const [showChoropleth, setShowChoropleth] = useState(false);

  // Load borough shapes
  useEffect(() => {
    fetch("/boroughs.geojson")
      .then((res) => res.json())
      .then((data) => setBoroughShapes(data));
  }, []);

  // Load events (points)
  useEffect(() => {
    async function load() {
      let url = `${API}/api/events`;
      const params = [];

      if (year !== "ALL") params.push(`year=${year}`);
      if (month !== "ALL") params.push(`month=${month}`);
      if (crimeType !== "ALL") params.push(`crime=${crimeType}`);
      if (limit !== "1000") params.push(`limit=${limit}`);

      if (params.length > 0) url += "?" + params.join("&");

      const res = await fetch(url);
      const json = await res.json();

      const mapped =
        json.results?.bindings?.map((b) => ({
          lat: Number(b.lat.value),
          lon: Number(b.long.value),
          date: b.date.value,
          crimeType: b.crimeType.value,
        })) ?? [];

      setPoints(mapped);
      setHeatPoints(mapped.map((p) => [p.lat, p.lon, 0.6]));
    }
    load();
  }, [year, month, crimeType, limit]);

  // Load borough aggregated crime counts
  useEffect(() => {
    async function loadBoroughStats() {
      let url = `${API}/api/borough_stats`;

      const params = [];
      if (year !== "ALL") params.push(`year=${year}`);
      if (month !== "ALL") params.push(`month=${month}`);
      if (crimeType !== "ALL") params.push(`crime=${crimeType}`);

      if (params.length > 0) url += "?" + params.join("&");

      const res = await fetch(url);
      const json = await res.json();

      const mapped = {};
      json.results?.bindings?.forEach((b) => {
        mapped[b.borough.value.toUpperCase()] = Number(b.count.value);
      });

      setBoroughStats(mapped);
    }

    loadBoroughStats();
  }, [year, month, crimeType]);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {/* Control Panel */}
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          top: 15,
          right: 10,
          background: "white",
          padding: "15px",
          borderRadius: "10px",
        }}
      >
        <label>
          <input
            type="checkbox"
            checked={showHeat}
            onChange={() => setShowHeat((prev) => !prev)}
          />
          Heatmap
        </label>
        <br />

        <label>
          <input
            type="checkbox"
            checked={showCluster}
            onChange={() => setShowCluster((prev) => !prev)}
          />
          Marker Clusters
        </label>
        <br />

        <label>
          <input
            type="checkbox"
            checked={showChoropleth}
            onChange={() => setShowChoropleth((prev) => !prev)}
          />
          Precincts
        </label>

        <hr />

        {/* Filtering */}
        <label>Year: </label>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="ALL">ALL</option>
          {[2015, 2016, 2017, 2018, 2019].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <br />
        <label>Month: </label>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="ALL">ALL</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1}>{i + 1}</option>
          ))}
        </select>

        <br />
        <label>Crime Type: </label>
        <select value={crimeType} onChange={(e) => setCrimeType(e.target.value)}>
          <option value="ALL">ALL</option>
          <option value="ASSAULT">ASSAULT</option>
          <option value="ROBBERY">ROBBERY</option>
          <option value="BURGLARY">BURGLARY</option>
          <option value="GRAND LARCENY">GRAND LARCENY</option>
        </select>

        <br />
        <label>Limit:</label>
        <select value={limit} onChange={(e) => setLimit(e.target.value)}>
          <option value="100">100</option>
          <option value="500">500</option>
          <option value="1000">1000</option>
          <option value="5000">5000</option>
          <option value="ALL">ALL (slow)</option>
        </select>
      </div>

      {/* Map */}
      <MapContainer
        center={[40.7128, -74.006]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Borough Choropleth */}
        {showChoropleth && boroughShapes && (
          <GeoJSON
            data={boroughShapes}
            style={(feature) => {
              const raw =
              feature.properties.borough ||
              feature.properties.boro_name ||
              feature.properties.BoroName;

              if (!raw) {
                return {
                  color: "#555",
                  weight: 2,
                  fillColor: "#ccc",
                  fillOpacity: 0.2,
                };
              }

              const name = raw.toUpperCase();
              const count = boroughStats[name] ?? 0;

              return {
                fillColor: getColor(count),
                color: "#2c0404ff",
                weight: 2,
                fillOpacity: 0.6,
              };
            }}
            onEachFeature={(feature, layer) => {
              const raw =
                feature.properties.borough ||
                feature.properties.boro_name ||
                feature.properties.BoroName;

              const name = raw ? raw.toUpperCase() : "UNKNOWN";
              const count = boroughStats[name] ?? 0;

              layer.bindPopup(`${name}: ${count} crimes`);
            }}
          />
        )}
        {showChoropleth && <ChoroplethLegend />}


        {/* Heatmap */}
        {showHeat && <HeatLayer points={heatPoints} />}

        {/* Marker Clusters */}
        {showCluster && (
          <MarkerClusterGroup chunkedLoading>
            {points.map((p, i) => (
              <Marker key={i} position={[p.lat, p.lon]}>
                <Popup>
                  <b>Date:</b> {p.date}
                  <br />
                  <b>Crime:</b> {p.crimeType}
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}
      </MapContainer>
    </div>
  );
}

function HeatLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;

    const layer = L.heatLayer(points, {
      radius: 12,
      blur: 15,
      minOpacity: 0.6,
    });
    layer.addTo(map);
    return () => map.removeLayer(layer);
  }, [points]);
  return null;
}

function ChoroplethLegend() {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "info legend");
      const grades = [100, 200, 400, 600, 800];
      const colors = [
        "#FEB24C",
        "#FD8D3C",
        "#FC4E2A",
        "#E31A1C",
        "#BD0026",
        "#800026",
      ];



      return div;
    };

    legend.addTo(map);

    return () => map.removeControl(legend);
  }, [map]);

  return null;
}


function getColor(count) {
  return count > 20000
    ? "#800026"
    : count > 15000
    ? "#BD0026"
    : count > 10000
    ? "#E31A1C"
    : count > 5000
    ? "#FC4E2A"
    : count > 1000
    ? "#FD8D3C"
    : "#FEB24C";
}
