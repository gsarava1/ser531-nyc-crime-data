import React, { useEffect } from "react";
import Plotly from "plotly.js-dist-min";

const CrimeByHourChart = ({ data }) => {
  useEffect(() => {
    if (!data || data.length === 0) return;

    Plotly.newPlot(
      "crime-hour",
      [
        {
          x: data.map((d) => d.hour),
          y: data.map((d) => d.count),
          type: "bar"
        }
      ],
      {
        title: "Crime by Hour (0–23)",
        xaxis: { title: "Hour of Day" },
        yaxis: { title: "Crime Count" },
        margin: { t: 40, l: 50, r: 10, b: 60 }
      }
    );
  }, [data]);

  return <div id="crime-hour" style={{ width: "100%", height: 380 }} />;
};

export default CrimeByHourChart;
