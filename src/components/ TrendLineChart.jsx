import React, { useEffect } from "react";
import Plotly from "plotly.js-dist-min";

const TrendLineChart = ({ data }) => {
  useEffect(() => {
    if (!data || data.length === 0) return;

    const x = data.map((r) => r.yearMonth);
    const y = data.map((r) => r.count);

    Plotly.newPlot(
      "trend-line",
      [
        {
          x,
          y,
          mode: "lines+markers"
        }
      ],
      {
        title: "Crime Events Over Time (Year-Month)",
        xaxis: { title: "Year-Month" },
        yaxis: { title: "Number of Events" },
        margin: { t: 40, l: 50, r: 10, b: 80 }
      }
    );
  }, [data]);

  return <div id="trend-line" style={{ width: "100%", height: 400 }} />;
};

export default TrendLineChart;
