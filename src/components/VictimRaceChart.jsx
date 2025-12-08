import React, { useEffect } from "react";
import Plotly from "plotly.js-dist-min";

const VictimRaceChart = ({ data }) => {
  useEffect(() => {
    if (!data || data.length === 0) return;

    const labels = data.map((r) => r.race);
    const values = data.map((r) => r.count);

    Plotly.newPlot(
      "victim-race",
      [
        {
          labels,
          values,
          type: "pie"
        }
      ],
      {
        title: "Victim Race Distribution",
        margin: { t: 40, l: 10, r: 10, b: 10 }
      }
    );
  }, [data]);

  return <div id="victim-race" style={{ width: "100%", height: 400 }} />;
};

export default VictimRaceChart;
