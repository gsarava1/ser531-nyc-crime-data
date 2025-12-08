import React from "react";

const EventList = ({ events }) => {
  if (!events || events.length === 0) {
    return <p>No events loaded for this borough yet.</p>;
  }

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "0.5rem"
      }}
    >
      <thead>
        <tr>
          <th style={th}>Incident ID</th>
          <th style={th}>Date</th>
          <th style={th}>Latitude</th>
          <th style={th}>Longitude</th>
          <th style={th}>Borough</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e, idx) => (
          <tr key={idx}>
            <td style={td}>{e.id}</td>
            <td style={td}>{e.date}</td>
            <td style={td}>{e.lat}</td>
            <td style={td}>{e.lon}</td>
            <td style={td}>{e.borough || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const th = {
  borderBottom: "1px solid #ccc",
  textAlign: "left",
  padding: "4px 8px",
  fontWeight: 600,
  fontSize: "0.85rem"
};

const td = {
  borderBottom: "1px solid #eee",
  padding: "4px 8px",
  fontSize: "0.8rem"
};

export default EventList;
