const express = require("express");
const { calculateOffer } = require("../services/pricing");
const { enrichWithAI, estimateDistanceWithAI } = require("../services/ai");

const router = express.Router();

/**
 * POST /generate-offer
 *
 * Body:
 *  - rooms: number (e.g. 3.5)
 *  - addressFrom: string
 *  - addressTo: string
 *  - hasLift: boolean
 *  - floor: number (optional, default 0)
 *  - includeAssembly: boolean (optional, default true)
 *  - expressService: boolean (optional)
 *  - heavyItems: number (optional, count of heavy items)
 */
router.post("/generate-offer", async (req, res) => {
  try {
    const { rooms, addressFrom, addressTo, hasLift, floor, includeAssembly, expressService, heavyItems } = req.body;

    // Validation
    const errors = [];
    if (!rooms || isNaN(parseFloat(rooms)) || parseFloat(rooms) <= 0) {
      errors.push("rooms must be a positive number (e.g. 3.5)");
    }
    if (!addressFrom || !addressFrom.trim()) {
      errors.push("addressFrom is required");
    }
    if (!addressTo || !addressTo.trim()) {
      errors.push("addressTo is required");
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    // Build input
    const offerInput = {
      rooms: parseFloat(rooms),
      addressFrom: addressFrom.trim(),
      addressTo: addressTo.trim(),
      hasLift: Boolean(hasLift),
      floor: parseInt(floor) || 0,
      includeAssembly: includeAssembly !== false,
      expressService: Boolean(expressService),
      heavyItems: parseInt(heavyItems) || 0,
    };

    // Try AI distance estimation first, fall back to local calculation
    const aiDistance = await estimateDistanceWithAI(offerInput.addressFrom, offerInput.addressTo);
    if (aiDistance) {
      offerInput.distanceOverride = aiDistance.km;
    }

    // Calculate offer
    const offer = calculateOffer(offerInput);

    // Enrich with AI
    const enriched = await enrichWithAI(offerInput, offer);

    // Build response
    const response = {
      service: "Moving",
      details: {
        rooms: offerInput.rooms,
        from: offerInput.addressFrom,
        to: offerInput.addressTo,
        distanceKm: offer.distance.km,
        distanceSource: offer.distance.source,
        hasLift: offerInput.hasLift,
        floor: offerInput.floor,
        includeAssembly: offerInput.includeAssembly,
        expressService: offerInput.expressService,
        heavyItems: offerInput.heavyItems,
      },
      tasks: offer.tasks.map((task) => {
        const enhanced = enriched.enhancedTasks.find((e) => e.id === task.id);
        return {
          ...task,
          description: enhanced ? enhanced.description : task.description,
        };
      }),
      pricing: {
        subtotal: offer.subtotal,
        expressService: offer.expressService,
        totalPrice: offer.totalPrice,
        currency: offer.currency,
      },
      executionSummary: enriched.executionSummary,
    };

    res.json(response);
  } catch (err) {
    console.error("Error generating offer:", err);
    res.status(500).json({ error: "Failed to generate offer" });
  }
});

module.exports = router;
