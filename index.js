console.log("START HO GAYA");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors"); //CORS install karo
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json()); // JSON read karne ke liye

mongoose.connect("mongodb://127.0.0.1:27017/feedbackSystem")
.then(() => {
  console.log("DB Connected");

  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });

})
.catch(err => console.log(err));

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String
});



const User = mongoose.model("User", userSchema);

const complaintSchema = new mongoose.Schema({
  userId: String,
  name: String,
  title: String,
  category: String,
  description: String,
  status: {
    type: String,
    default: "Submitted"
  },
  date: {
    type: String,
    default: () => new Date().toLocaleDateString()
  }
});

const Complaint = mongoose.model("Complaint", complaintSchema);

const bcrypt = require("bcryptjs");

app.get("/", (req, res) => {
  res.send("Server chal raha hai 🚀");
});

// app.get("/register", (req, res) => {
//   res.send("Register API working (use POST request)");
// });

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role
});

    await newUser.save();

    res.json({ message: "Registered successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/complaint", authMiddleware, async (req, res) => { //complain submit krne ke liye
  try {
    const { title, category, description } = req.body;

    const newComplaint = new Complaint({
      userId: req.user.id,
      name: req.user.name, // JWT me name bhejna padega
      title,
      category,
      description
    });

    await newComplaint.save();

    res.json({ message: "Complaint submitted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


function authMiddleware(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, "secretkey");

    req.user = decoded; // id, role, name sab aa jayega

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ TOKEN CREATE
    const token = jwt.sign(
  { 
    id: user._id, 
    role: user.role,
    name: user.name   // ✅ ADD THIS
  },
  "secretkey",
  { expiresIn: "1h" }
);

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      name: user.name
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/complaints", authMiddleware, async (req, res) => { //Get all complaints to admin

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const complaints = await Complaint.find()
    .populate("userId", "name"); //  important

  res.json(complaints);
});

app.get("/my-complaints", authMiddleware, async (req, res) => { //Logged-in student ko sirf uske complaints return karega
  try {                                                         //Same data dashboard + your complaints dono me use hoga
    const complaints = await Complaint.find({ userId: req.user.id });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/complaint/:id", authMiddleware, async (req, res) => { //Update Status API
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }

  const { status } = req.body;

  await Complaint.findByIdAndUpdate(req.params.id, { status });

  res.json({ message: "Status updated" });
});


app.delete("/complaint/:id", authMiddleware, async (req, res) => { //ID ke basis pe complaint delete karega
  try {
    const complaintId = req.params.id;

    await Complaint.findByIdAndDelete(complaintId);

    res.json({ message: "Complaint deleted successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting complaint" });
  }
});