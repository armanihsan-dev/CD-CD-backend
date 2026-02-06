import express from "express";

const app = express();
const PORT = 5000;

// middleware
app.use(express.json());

// home route
app.get("/", (req, res) => {
  res.send("🚀 Server running with ES6 Express");
});

// api route
app.get("/api", (req, res) => {
  res.json({
    message: "Hello from ES6 backend 🔥",
  });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
