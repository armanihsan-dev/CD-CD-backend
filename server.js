import express from "express";
import { spawn } from "child_process";
import cors from "cors";   // 👈 add
import crypto from "crypto";

const app = express();
const PORT = 5000;

// enable cors for all origins
app.use(cors());
/* ================================
   🔐 VERIFY GITHUB SIGNATURE
================================ */
function verifyGitHub(req) {
  const signature = req.headers["x-hub-signature-256"];
  const secret = "cicdsec@123"; // MUST match GitHub webhook secret

  if (!signature) return false;

  const hash =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(req.body).digest("hex");

  const sigBuffer = Buffer.from(signature);
  const hashBuffer = Buffer.from(hash);

  if (sigBuffer.length !== hashBuffer.length) return false;

  return crypto.timingSafeEqual(sigBuffer, hashBuffer);
}

/* ================================
   ⚠️ IMPORTANT MIDDLEWARE ORDER
   raw body FIRST for webhook
================================ */
app.use("/githubwebhook", express.raw({ type: "*/*" }));

// normal json middleware for other routes
app.use(express.json());

/* ================================
   HOME ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("🚀 CI/CD Server running");
});

/* ================================
   🔥 GITHUB WEBHOOK ROUTE
================================ */
app.post("/githubwebhook", (req, res) => {
  console.log("📩 Webhook received");

  // verify request came from github
  if (!verifyGitHub(req)) {
    console.log("❌ Unauthorized webhook attempt blocked");
    return res.status(401).send("Not allowed");
  }

  console.log("✅ GitHub webhook verified");
  console.log("🚀 Starting deployment...");

  // run deploy script
  const bashChildProcess = spawn("bash", ['deploy-ci.sh'], {
    cwd: '../',
    env: {
      ...process.env,
      CI_MODE: 'true'  // Add this flag
    }
  });

  // show logs in terminal
  bashChildProcess.stdout.on("data", (data) => {
    console.log(`📦 ${data}`);
  });

  bashChildProcess.stderr.on("data", (data) => {
    console.error(`❌ ERROR: ${data}`);
  });

  bashChildProcess.on("close", (code) => {
    if (code === 0) {
      console.log("✅ Deployment completed successfully");
    } else {
      console.log("❌ Deployment failed with code:", code);
    }
  });

  bashChildProcess.on("error", (err) => {
    console.error("❌ Failed to start deploy script:", err);
  });

  res.status(200).json({
    success: true,
    message: "🚀 Deployment started"
  });
});

/* ================================
   🔥 IMPRESSIVE DEVOPS STATUS API
================================ */
app.get("/api", (req, res) => {
  console.log("📡 CI/CD status endpoint hit");

  res.status(200).json({
    success: true,
    message: "CI/CD Running 🚀",
    time: new Date().toISOString(),

    server: {
      env: "production",
      uptime: process.uptime(),
      node: process.version
    },

    deployment: {
      project: "MERN App",
      branch: "main",
      status: "running"
    },

    pipeline: [
      "Push detected",
      "Webhook triggered",
      "Pulling code",
      "Building...",
      "Restarting..."
    ],

    infra: {
      server: "VPS",
      nginx: "on",
      ssl: "enabled 🔐"
    }
  });

});

/* ================================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
