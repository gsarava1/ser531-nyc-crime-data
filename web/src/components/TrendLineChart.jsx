import React, { useEffect } from "react";
import Plotly from "plotly.js-dist-min";

const TrendLineChart = ({ data }) => {
  useEffect(() => {
    if (!data || data.length === 0) return;

    const sortedData = [...data].sort((a, b) =>
      a.yearMonth.localeCompare(b.yearMonth)
    );

    const x = sortedData.map((r) => r.yearMonth);
    const y = sortedData.map((r) => r.count);

    Plotly.newPlot(
      "trend-line",
      [
        {
          x,
          y,
          type: "scatter",
          mode: "lines+markers",
          line: { color: "#1f77b4", width: 2 },
          marker: { size: 6 }
        }
      ],
      {
        title: "Crime Trends Over Time",
        xaxis: { title: "Year-Month" },
        yaxis: { title: "Number of Events" },
        margin: { t: 40, l: 50, r: 10, b: 50 }
      }
    );
  }, [data]);

  return <div id="trend-line" style={{ width: "100%", height: 400 }} />;
};

export default TrendLineChart;
