import React, { useEffect } from "react";
import Plotly from "plotly.js-dist-min";

export default function CrimeTrendByYear({ data, year, onChangeYear }) {
  useEffect(() => {
    if (!data || data.length === 0) return;

    Plotly.newPlot(
      "trend-year-chart",
      [
        {
          x: data.map((d) => d.month),
          y: data.map((d) => d.count),
          mode: "lines+markers"
        }
      ],
      {
        title: `Crime Trend in ${year}`,
        xaxis: { title: "Month" },
        yaxis: { title: "Crime Count" },
        margin: { t: 40, l: 40, r: 10, b: 50 }
      }
    );
  }, [data, year]);

  return (
    <div>
      <label style={{ marginRight: 8 }}>Select Year:</label>
      <select
        value={year}
        onChange={(e) => onChangeYear(e.target.value)}
        style={{ marginBottom: 10 }}
      >
        <option value="2015">2015</option>
        <option value="2016">2016</option>
        <option value="2017">2017</option>
        <option value="2018">2018</option>
        <option value="2019">2019</option>
        <option value="2020">2020</option>
        <option value="2021">2021</option>
      </select>

      <div id="trend-year-chart" style={{ width: "100%", height: 350 }} />
    </div>
  );
}
