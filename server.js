import express from "express";
import { spawn } from 'child_process'

const app = express();
const PORT = 5000;

// middleware
app.use(express.json());

// home route
app.get("/", (req, res) => {
  res.send("🚀 Server running with ES6 Express");
});

app.post('/githubwebhook', (req, res) => {
  console.log(req.headers);
  console.log(req.body);

  const bashChildProcess = spawn('bash', ['../deploy.sh'])
  bashChildProcess.stdout.on('data', (data) => {
    process.stdout.write(data)
  })
  // console.log(bashChildProcess.stderr);

  bashChildProcess.on('close', (code) => {
    if (code == 0) {
      console.log('Script executed successfully');
    } else {
      console.log('Script execution failed with code: ' + code);
    }
    console.log(code);
  })

  bashChildProcess.on('error', (err) => {
    console.error('Failed to start subprocess.', err);
  })
  res.status(200).json({ message: 'Webhook received' });
})

// api route
app.get("/api", (req, res) => {
  res.json({
    message: "Hello from ES6 backend 🔥",
    response: {
      name: "John Doe",
      age: 30,
      email: `jhoan@gmail.com`
    }
  });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
