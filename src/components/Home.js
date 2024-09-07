import React, { useState } from "react";
import "./Home.css";
import api from "./Api";

export default function Home() {
  const [url1, setUrl1] = useState("");
  const [url2, setUrl2] = useState("");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch product highlights from the backend API
  async function fetchProductHighlights(url) {
    try {
      const response = await api.post("/scrape", { url });
      return response.data.features;
    } catch (error) {
      console.error("Error fetching product highlights:", error);
      return null;
    }
  }

  async function generateAnswer() {
    if (!url1 || !url2) {
      alert("The Inputs cannot be empty");
      return;
    }

    setLoading(true);

    const productData1 = await fetchProductHighlights(url1);
    const productData2 = await fetchProductHighlights(url2);

    if (!productData1 || !productData2) {
      alert("Failed to fetch product highlights");
      setLoading(false);
      return;
    }

    const product1Highlights = productData1.join("\n");
    const product2Highlights = productData2.join("\n");

    const prompt = `
          Compare the following two products:

          Product 1 Specifications:
          ${product1Highlights}

          Product 2 Specifications:
          ${product2Highlights}

          Provide a detailed comparison based on the specifications. Write Pros and Cons of one product and Pros and cons of the other. After that, provide an overall recommendation.
      `;

    try {
      const response = await api.post("/compare", { prompt });
      const responseData = response.data.comparison;

      const parseComparison = (text) => {
        const prosCons = {
          pros1: [],
          cons1: [],
          pros2: [],
          cons2: [],
          overall: [],
        };
        let sections = text.split(/Pros:|Cons:|Overall|overall/);

        if (sections.length === 1) {  // No "Overall/overall" found
          sections = text.split(/Recommendation/);
        }
        
        sections = sections.map((section) =>
          section
            .trim()
            .split("\n")
            .filter((line) => line.trim() !== "")
        );
        

        if (sections.length >= 4) {
          prosCons.pros1 = sections[1];
          prosCons.cons1 = sections[2];
          prosCons.pros2 = sections[3];
          prosCons.cons2 = sections[4];
          prosCons.overall = sections[5] || [];
        }

        return prosCons;
      };

      const { pros1, cons1, pros2, cons2, overall } =
        parseComparison(responseData);

      // Add a check to ensure that the arrays are defined before calling cleanList
      const cleanList = (list) => {
        if (list && list.length > 2) {
          list = list.slice(1, -1);
          return list.map((item) =>
            item.replace(/^\*s*/, "").replace(/\*/g, "")
          );
        }
        return [];
      };

      const cleanedPros1 = cleanList(pros1 || []);
      const cleanedCons1 = cleanList(cons1 || []);
      const cleanedPros2 = cleanList(pros2 || []);
      const cleanedCons2 = cleanList(cons2 || []);
      const cleanedOverall = cleanList(overall || []);

      setComparison({
        product1: product1Highlights.split("\n")[0].trim(),
        product2: product2Highlights.split("\n")[0].trim(),
        pros1: cleanedPros1,
        cons1: cleanedCons1,
        pros2: cleanedPros2,
        cons2: cleanedCons2,
        overall: cleanedOverall,
      });
    } catch (error) {
      console.error("Error generating comparison:", error);
      alert("Failed to generate comparison");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1 className="title">SMART COMPARE</h1>
      <div className="textarea-container">
        <textarea
          className="textarea"
          placeholder="Enter URL for Product 1"
          value={url1}
          onChange={(e) => setUrl1(e.target.value)}
        />
        <textarea
          className="textarea"
          placeholder="Enter URL for Product 2"
          value={url2}
          onChange={(e) => setUrl2(e.target.value)}
        />
      </div>
      <button className="button" onClick={generateAnswer} disabled={loading}>
        {loading ? <div className="loader"></div> : "COMPARE"}
      </button>
      {comparison && (
        <div className="result">
          <h2>Comparison Result:</h2>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>{comparison.product1}</th>
                <th>{comparison.product2}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <h3>Pros</h3>
                  <ul>
                    {comparison.pros1.map((pro, index) => (
                      <li key={index}>
                        <span className="bullet-point">&#8226;</span> {pro}
                      </li>
                    ))}
                  </ul>
                  <h3>Cons</h3>
                  <ul>
                    {comparison.cons1.map((con, index) => (
                      <li key={index}>
                        <span className="bullet-point">&#8226;</span> {con}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <h3>Pros</h3>
                  <ul>
                    {comparison.pros2.map((pro, index) => (
                      <li key={index}>
                        <span className="bullet-point">&#8226;</span> {pro}
                      </li>
                    ))}
                  </ul>
                  <h3>Cons</h3>
                  <ul>
                    {comparison.cons2.map((con, index) => (
                      <li key={index}>
                        <span className="bullet-point">&#8226;</span> {con}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
          <h3>Overall Recommendation:</h3>
          <p>{comparison.overall.join(" ").replace(/\*\*/g, "")}</p>
        </div>
      )}
    </div>
  );
}
