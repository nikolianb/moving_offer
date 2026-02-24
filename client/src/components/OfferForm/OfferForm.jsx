import React, { useState } from "react";
import "./OfferForm.css";

const ADDRESSES = [
  "Bahnhofstrasse 10, 8001 Zürich",
  "Hauptstrasse 5, 3011 Bern",
  "Rue du Marché 12, 1204 Genève",
  "Steinenvorstadt 33, 4051 Basel",
  "Pilatusstrasse 20, 6003 Luzern",
  "Bundesplatz 1, 3003 Bern",
  "Marktgasse 17, 8400 Winterthur",
  "Poststrasse 8, 9000 St. Gallen",
  "Freiestrasse 45, 4001 Basel",
  "Limmatquai 78, 8001 Zürich",
];

function randomAddress(exclude) {
  const options = ADDRESSES.filter((a) => a !== exclude);
  return options[Math.floor(Math.random() * options.length)];
}

const INITIAL = {
  rooms: "3.5",
  addressFrom: "",
  addressTo: "",
  hasLift: true,
  floor: "0",
  includeAssembly: true,
  expressService: false,
  heavyItems: "0",
};

export default function OfferForm({ onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      rooms: parseFloat(form.rooms),
      addressFrom: form.addressFrom,
      addressTo: form.addressTo,
      hasLift: form.hasLift,
      floor: parseInt(form.floor) || 0,
      includeAssembly: form.includeAssembly,
      expressService: form.expressService,
      heavyItems: parseInt(form.heavyItems) || 0,
    });
  }

  return (
    <form className="offer-form" onSubmit={handleSubmit}>
      <h2>Request a Moving Offer</h2>

      <div className="form-row">
        <label>
          <span className="label-text">Rooms</span>
          <input
            type="number"
            step="0.5"
            min="1"
            value={form.rooms}
            onChange={(e) => update("rooms", e.target.value)}
            required
          />
        </label>

        <label>
          <span className="label-text">Floor</span>
          <input
            type="number"
            min="0"
            max="20"
            value={form.floor}
            onChange={(e) => update("floor", e.target.value)}
          />
        </label>
      </div>

      <div className="address-field">
        <label>
          <span className="label-text">Address From</span>
          <input
            type="text"
            placeholder="e.g. Bahnhofstrasse 10, Zürich"
            value={form.addressFrom}
            onChange={(e) => update("addressFrom", e.target.value)}
            required
          />
        </label>
        <button
          type="button"
          className="random-btn"
          title="Random address"
          onClick={() => update("addressFrom", randomAddress(form.addressTo))}
        >
          🎲
        </button>
      </div>

      <div className="address-field">
        <label>
          <span className="label-text">Address To</span>
          <input
            type="text"
            placeholder="e.g. Hauptstrasse 5, Bern"
            value={form.addressTo}
            onChange={(e) => update("addressTo", e.target.value)}
            required
          />
        </label>
        <button
          type="button"
          className="random-btn"
          title="Random address"
          onClick={() => update("addressTo", randomAddress(form.addressFrom))}
        >
          🎲
        </button>
      </div>

      <div className="form-row checkboxes">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.hasLift}
            onChange={(e) => update("hasLift", e.target.checked)}
          />
          <span>Lift available</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.includeAssembly}
            onChange={(e) => update("includeAssembly", e.target.checked)}
          />
          <span>Furniture Assembly</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.expressService}
            onChange={(e) => update("expressService", e.target.checked)}
          />
          <span>Express Service (+20%)</span>
        </label>
      </div>

      <label>
        <span className="label-text">Heavy Items (piano, safe, etc.)</span>
        <input
          type="number"
          min="0"
          max="10"
          value={form.heavyItems}
          onChange={(e) => update("heavyItems", e.target.value)}
        />
      </label>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Generating..." : "Generate Offer"}
      </button>
    </form>
  );
}
