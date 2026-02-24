import React, { useState } from "react";
import { generateOffer } from "./api/offerApi.js";
import OfferForm from "./components/OfferForm/OfferForm.jsx";
import OfferResult from "./components/OfferResult/OfferResult.jsx";
import "./styles/App.css";

export default function App() {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(formData) {
    setLoading(true);
    setError(null);
    setOffer(null);

    try {
      const data = await generateOffer(formData);
      setOffer(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Umzugsfirma Zürich</h1>
        <p className="subtitle">Moving Offer Generator</p>
      </header>

      <main className="app-main">
        <OfferForm onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div className="error-box">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading-box">
            <div className="spinner" />
            <span>Generating your offer...</span>
          </div>
        )}

        {offer && <OfferResult offer={offer} />}
      </main>
    </div>
  );
}
