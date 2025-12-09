import React, { useEffect } from "react";
import Plotly from "plotly.js-dist-min";

export default function TopCrimeTypesByBorough({ data, borough, onChangeBorough }) {
  useEffect(() => {
    if (!data || data.length === 0) return;

    Plotly.newPlot(
      "top-crime-types",
      [
        {
          x: data.map((d) => d.type),
          y: data.map((d) => d.count),
          type: "bar"
        }
      ],
      {
        title: `Top Crime Types in ${borough || "All Boroughs"}`,
        margin: { t: 40, l: 40, r: 10, b: 80 }
      }
    );
  }, [data, borough]);

  return (
    <div>
      <label>Borough: </label>
      <select value={borough} onChange={(e) => onChangeBorough(e.target.value)}>
        <option value="">All Boroughs</option>
        <option value="BROOKLYN">BROOKLYN</option>
        <option value="MANHATTAN">MANHATTAN</option>
        <option value="QUEENS">QUEENS</option>
        <option value="BRONX">BRONX</option>
        <option value="STATEN ISLAND">STATEN ISLAND</option>
      </select>

      <div id="top-crime-types" style={{ width: "100%", height: 350 }} />
    </div>
  );
}
 
