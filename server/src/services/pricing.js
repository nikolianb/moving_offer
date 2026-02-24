// Pricing constants for moving services (CHF-based for Swiss market)
const BASE_RATES = {
  perRoom: 85,          // per room cost (packing + carrying)
  perKm: 2.50,          // transport cost per km
  transportBase: 80,    // base transport fee (loading/unloading)
  assembly: 45,         // furniture assembly per room
  noLiftPerFloor: 30,   // surcharge per floor when no lift available
};

const MODIFIERS = {
  expressMultiplier: 1.20,   // +20% for express/same-week service
  heavyItemCost: 50,         // per heavy item (piano, safe, etc.)
};

// Swiss city coordinates for distance calculation
const CITY_COORDS = {
  "zürich":     { lat: 47.3769, lng: 8.5417 },
  "zurich":     { lat: 47.3769, lng: 8.5417 },
  "bern":       { lat: 46.9480, lng: 7.4474 },
  "basel":      { lat: 47.5596, lng: 7.5886 },
  "genève":     { lat: 46.2044, lng: 6.1432 },
  "geneve":     { lat: 46.2044, lng: 6.1432 },
  "lausanne":   { lat: 46.5197, lng: 6.6323 },
  "luzern":     { lat: 47.0502, lng: 8.3093 },
  "st. gallen": { lat: 47.4245, lng: 9.3767 },
  "winterthur": { lat: 47.5001, lng: 8.7240 },
  "lugano":     { lat: 46.0037, lng: 8.9511 },
  "biel":       { lat: 47.1368, lng: 7.2467 },
  "thun":       { lat: 46.7580, lng: 7.6280 },
  "aarau":      { lat: 47.3925, lng: 8.0444 },
  "chur":       { lat: 46.8499, lng: 9.5329 },
  "schaffhausen": { lat: 47.6960, lng: 8.6350 },
  "frauenfeld": { lat: 47.5535, lng: 8.8987 },
  "solothurn":  { lat: 47.2088, lng: 7.5372 },
  "zug":        { lat: 47.1724, lng: 8.5172 },
};

function findCity(address) {
  const lower = address.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return coords;
  }
  return null;
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * (Math.PI / 180);
  const dLng = (b.lng - a.lng) * (Math.PI / 180);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function estimateDistanceKm(addressFrom, addressTo) {
  const from = findCity(addressFrom);
  const to = findCity(addressTo);

  if (from && to) {
    const straight = haversineKm(from, to);
    const driving = Math.round(straight * 1.3);
    return Math.max(driving, 5);
  }

  return 25; // fallback
}

function calculateOffer({ rooms, addressFrom, addressTo, hasLift, floor = 0, includeAssembly = true, expressService = false, heavyItems = 0, distanceOverride = null }) {
  const roomCount = parseFloat(rooms) || 3;
  const distanceKm = distanceOverride || estimateDistanceKm(addressFrom || "", addressTo || "");
  const distanceSource = distanceOverride ? "ai" : "local";
  const tasks = [];
  let totalPrice = 0;
  let taskId = 1;

  // Task: Packing & Carrying
  const packingCost = Math.round(roomCount * BASE_RATES.perRoom);
  tasks.push({
    id: taskId++,
    name: "Packing & Carrying",
    description: `Pack and carry belongings from ${roomCount} rooms`,
    price: packingCost,
    priceExplanation: `${roomCount} rooms × CHF ${BASE_RATES.perRoom}/room`,
  });
  totalPrice += packingCost;

  // Task: Transport (base + per km)
  const kmCost = Math.round(distanceKm * BASE_RATES.perKm);
  const transportCost = BASE_RATES.transportBase + kmCost;
  tasks.push({
    id: taskId++,
    name: "Transport",
    description: `Load, drive ${distanceKm} km, and unload the moving truck`,
    price: transportCost,
    priceExplanation: `Base CHF ${BASE_RATES.transportBase} + ${distanceKm} km × CHF ${BASE_RATES.perKm}/km`,
  });
  totalPrice += transportCost;

  // Task: Furniture Assembly (optional)
  if (includeAssembly) {
    const assemblyCost = Math.round(roomCount * BASE_RATES.assembly);
    tasks.push({
      id: taskId++,
      name: "Furniture Assembly",
      description: "Disassemble furniture at origin, reassemble at destination",
      price: assemblyCost,
      priceExplanation: `${roomCount} rooms × CHF ${BASE_RATES.assembly}/room`,
    });
    totalPrice += assemblyCost;
  }

  // Surcharge: No Lift
  if (!hasLift && floor > 0) {
    const liftCost = floor * BASE_RATES.noLiftPerFloor;
    tasks.push({
      id: taskId++,
      name: "No-Lift Surcharge",
      description: `Manual carrying up/down ${floor} floor(s) without elevator`,
      price: liftCost,
      priceExplanation: `${floor} floor(s) × CHF ${BASE_RATES.noLiftPerFloor}/floor`,
    });
    totalPrice += liftCost;
  }

  // Surcharge: Heavy Items
  if (heavyItems > 0) {
    const heavyCost = heavyItems * MODIFIERS.heavyItemCost;
    tasks.push({
      id: taskId++,
      name: "Heavy Items Handling",
      description: `Special handling for ${heavyItems} heavy item(s) (piano, safe, etc.)`,
      price: heavyCost,
      priceExplanation: `${heavyItems} item(s) × CHF ${MODIFIERS.heavyItemCost}/item`,
    });
    totalPrice += heavyCost;
  }

  // Express Service modifier
  let expressExtra = 0;
  if (expressService) {
    expressExtra = Math.round(totalPrice * (MODIFIERS.expressMultiplier - 1));
    totalPrice += expressExtra;
  }

  return {
    tasks,
    distance: { km: distanceKm, source: distanceSource, from: addressFrom, to: addressTo },
    subtotal: totalPrice - expressExtra,
    expressService: expressService
      ? { applied: true, surcharge: expressExtra, explanation: "+20% express service fee" }
      : { applied: false, surcharge: 0 },
    totalPrice,
    currency: "CHF",
  };
}

module.exports = { calculateOffer, estimateDistanceKm, BASE_RATES, MODIFIERS };
