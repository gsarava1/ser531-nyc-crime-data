import React, { useEffect } from "react";
import Plotly from "plotly.js-dist-min";

const BoroughBarChart = ({ data }) => {
  useEffect(() => {
    if (!data || data.length === 0) return;

    Plotly.newPlot(
      "borough-bar",
      [
        {
          x: data.map((d) => d.borough),
          y: data.map((d) => d.count),
          type: "bar"
        }
      ],
      {
        title: "Crime Count by Borough",
        xaxis: { title: "Borough" },
        yaxis: { title: "Crime Count" },
        margin: { t: 40, l: 50, r: 10, b: 60 }
      }
    );
  }, [data]);

  return <div id="borough-bar" style={{ width: "100%", height: 380 }} />;
};

export default BoroughBarChart;
