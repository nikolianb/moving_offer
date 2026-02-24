import React from "react";
import "./OfferResult.css";

export default function OfferResult({ offer }) {
  const { details, tasks, pricing, executionSummary } = offer;

  return (
    <div className="offer-result">
      <h2>Your Moving Offer</h2>

      {/* Summary */}
      <div className="result-summary">
        <div className="summary-row">
          <span className="summary-label">From</span>
          <span>{details.from}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">To</span>
          <span>{details.to}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Distance</span>
          <span>{details.distanceKm} km {details.distanceSource === "ai" ? "(AI estimated)" : ""}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Rooms</span>
          <span>{details.rooms}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Floor</span>
          <span>{details.floor} {details.hasLift ? "(lift)" : "(no lift)"}</span>
        </div>
        {details.includeAssembly && (
          <div className="summary-row">
            <span className="summary-label">Assembly</span>
            <span>Included</span>
          </div>
        )}
        {details.expressService && (
          <div className="summary-row express-badge">
            <span className="summary-label">Express Service</span>
            <span className="badge">Active</span>
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="tasks-section">
        <h3>Tasks & Pricing</h3>
        <div className="tasks-list">
          {tasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <span className="task-name">{task.name}</span>
                <span className="task-price">
                  {pricing.currency} {task.price}
                </span>
              </div>
              <p className="task-desc">{task.description}</p>
              <p className="task-explain">{task.priceExplanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="total-section">
        {pricing.expressService.applied && (
          <div className="total-row subtotal">
            <span>Subtotal</span>
            <span>{pricing.currency} {pricing.subtotal}</span>
          </div>
        )}
        {pricing.expressService.applied && (
          <div className="total-row express">
            <span>{pricing.expressService.explanation}</span>
            <span>+ {pricing.currency} {pricing.expressService.surcharge}</span>
          </div>
        )}
        <div className="total-row grand-total">
          <span>Total</span>
          <span>{pricing.currency} {pricing.totalPrice}</span>
        </div>
      </div>

      {/* Execution Summary */}
      {executionSummary && (
        <div className="exec-summary">
          <h3>Execution Summary</h3>
          <p>{executionSummary}</p>
        </div>
      )}
    </div>
  );
}
