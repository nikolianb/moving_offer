# Umzugsfirma Zürich – Moving Offer Generator

A mini **Task Engine + Offer Generator** that creates structured moving offers based on user input. Built with React + Node.js/Express.

## Architecture

```
sf_task/
├── server/                        → Node.js + Express backend
│   └── src/
│       ├── index.js               Entry point (server setup)
│       ├── config/
│       │   └── index.js           Environment & constants
│       ├── routes/
│       │   └── offer.js           POST /generate-offer endpoint
│       └── services/
│           ├── pricing.js         Task generation + price calculation
│           └── ai.js              OpenAI integration (distance + enrichment)
├── client/                        → React (Vite) frontend
│   └── src/
│       ├── main.jsx               Entry point
│       ├── App.jsx                Main app component
│       ├── api/
│       │   └── offerApi.js        API call logic
│       ├── components/
│       │   ├── OfferForm/         Input form (jsx + css)
│       │   └── OfferResult/       Offer display (jsx + css)
│       └── styles/
│           ├── global.css         Reset & base styles
│           └── App.css            App layout styles
└── README.md
```

## How to Run

### Prerequisites
- Node.js 18+
- (Optional) OpenAI API key for AI-enhanced descriptions + distance estimation

### 1. Install & Start the Backend

```bash
cd server
npm install
npm run dev
```

The server starts on `http://localhost:3001`.

### 2. Install & Start the Frontend

```bash
cd client
npm install
npm run dev
```

The frontend starts on `http://localhost:5173` with API proxy to the backend.

### 3. (Optional) Enable AI Features

Create a `.env` file in the `server/` directory:

```
OPENAI_API_KEY=sk-your-key-here
```

With the key, the system uses OpenAI to:
- Estimate driving distance between addresses (km)
- Generate professional task descriptions
- Create an execution summary

Without the key, everything works — it uses local Swiss city coordinates for distance and built-in description templates.

## API

### `POST /generate-offer`

**Request Body:**
```json
{
  "rooms": 3.5,
  "addressFrom": "Bahnhofstrasse 10, 8001 Zürich",
  "addressTo": "Hauptstrasse 5, 3011 Bern",
  "hasLift": true,
  "floor": 2,
  "includeAssembly": true,
  "expressService": false,
  "heavyItems": 1
}
```

**Response:**
```json
{
  "service": "Moving",
  "details": {
    "rooms": 3.5,
    "from": "Bahnhofstrasse 10, 8001 Zürich",
    "to": "Hauptstrasse 5, 3011 Bern",
    "distanceKm": 124,
    "distanceSource": "ai",
    "hasLift": true,
    "floor": 2,
    "includeAssembly": true,
    "expressService": false,
    "heavyItems": 1
  },
  "tasks": [
    {
      "id": 1,
      "name": "Packing & Carrying",
      "description": "Pack and carry belongings from 3.5 rooms",
      "price": 298,
      "priceExplanation": "3.5 rooms × CHF 85/room"
    },
    {
      "id": 2,
      "name": "Transport",
      "description": "Load, drive 124 km, and unload the moving truck",
      "price": 390,
      "priceExplanation": "Base CHF 80 + 124 km × CHF 2.5/km"
    }
  ],
  "pricing": {
    "subtotal": 1106,
    "expressService": { "applied": false, "surcharge": 0 },
    "totalPrice": 1106,
    "currency": "CHF"
  },
  "executionSummary": "Moving service for a 3.5-room apartment..."
}
```
