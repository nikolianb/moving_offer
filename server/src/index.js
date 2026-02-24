const express = require("express");
const cors = require("cors");
const { PORT } = require("./config");
const offerRoutes = require("./routes/offer");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use(offerRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
