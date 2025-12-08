import React, { useEffect } from "react";
import Plotly from "plotly.js-dist-min";

const BoroughBarChart = ({ data }) => {
  useEffect(() => {
    if (!data || data.length === 0) return;

    const x = data.map((r) => r.borough);
    const y = data.map((r) => r.count);

    Plotly.newPlot(
      "borough-bar",
      [
        {
          x,
          y,
          type: "bar"
        }
      ],
      {
        title: "Crime Events by Borough",
        xaxis: { title: "Borough" },
        yaxis: { title: "Number of Events" },
        margin: { t: 40, l: 50, r: 10, b: 50 }
      }
    );
  }, [data]);

  return <div id="borough-bar" style={{ width: "100%", height: 400 }} />;
};

export default BoroughBarChart;
