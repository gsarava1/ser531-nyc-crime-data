import React, { useMemo } from "react";
import Plotly from "plotly.js-dist-min";

const BoroughTopCrimeTypes = ({ events }) => {
  const processed = useMemo(() => {
    const counts = {};
    events.forEach((e) => {
      if (!e.crimeType) return;
      counts[e.crimeType] = (counts[e.crimeType] || 0) + 1;
    });

    const entries = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      labels: entries.map((x) => x[0]),
      values: entries.map((x) => x[1])
    };
  }, [events]);

  React.useEffect(() => {
    if (!processed.labels.length) return;

    Plotly.newPlot(
      "top-crime-types",
      [
        {
          x: processed.labels,
          y: processed.values,
          type: "bar"
        }
      ],
      { title: "Top Crime Types", margin: { t: 40, l: 50, r: 10, b: 60 } }
    );
  }, [processed]);

  return <div id="top-crime-types" style={{ width: "100%", height: 380 }} />;
};

export default BoroughTopCrimeTypes;
