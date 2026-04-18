import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('dataset'));

const FILE_PATH = "./data.json";

// ---------------- READ DATA ----------------
const getData = () => {
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify({ users: [] }, null, 2));
  }
  const raw = fs.readFileSync(FILE_PATH);
  return JSON.parse(raw);
};

// ---------------- WRITE DATA ----------------
const saveData = (data) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
};

// ---------------- HOME ROUTE (FIX ERROR) ----------------
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ---------------- SIGN UP ----------------
app.post("/api/signup", (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const data = getData();

  const existingUser = data.users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = {
    id: Date.now(),
    fullName,
    email,
    password
  };

  data.users.push(newUser);
  saveData(data);

  res.json({ message: "Signup successful" });
});

// ---------------- SIGN IN ----------------
app.post("/api/signin", (req, res) => {
  const { email, password } = req.body;

  const data = getData();

  const user = data.users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    message: "Login successful",
    user
  });
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});