import React, { useEffect } from "react";
import Plotly from "plotly.js-dist-min";

const CrimeTypeDistribution = ({ data }) => {
  useEffect(() => {
    if (!data || data.length === 0) return;

    const total = data.reduce((s, d) => s + d.count, 0);

    const threshold = total * 0.02;

    const major = data.filter((d) => d.count >= threshold);
    const others = data.filter((d) => d.count < threshold);

    const majorLabels = major.map((d) => d.type);
    const majorValues = major.map((d) => d.count);


    if (others.length > 0) {
      const othersSum = others.reduce((s, d) => s + d.count, 0);
      majorLabels.push("Others (<1%)");
      majorValues.push(othersSum);
    }

    Plotly.newPlot(
      "crime-type-dist",
      [
        {
          labels: majorLabels,
          values: majorValues,
          type: "pie",
          textinfo: "percent+label"
        }
      ],
      {
        title: "Crime Type Distribution",
        margin: { t: 40, l: 10, r: 10, b: 10 }
      }
    );
  }, [data]);

  return <div id="crime-type-dist" style={{ width: "100%", height: 450 }} />;
};

export default CrimeTypeDistribution;
