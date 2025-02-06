const express = require("express");
const mongoose = require("mongoose");
const connectDb = require('./db');
const authRoutes = require('./routes/AuthRoutes');
const authMiddleware = require("./middleware/AuthMiddleware");
const converterRoutes = require('./routes/converter');
const cors = require('cors');

const app = express();
//middleware
app.use(express.json()); // parse incoming json data
app.use(cors());

// Allow all origins and specific methods
app.use(cors({
  origin: "*",  // Allow all domains
  methods: ["GET", "POST"],  // Allow these methods
  allowedHeaders: ["Content-Type", "Authorization"],  // Allow necessary headers
}));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/converter', authMiddleware, converterRoutes);


//connect mongodb

connectDb();

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>My Server</title></head>
      <body>
        <h1 style="color: blue; text-align: center;">Server is Running Successfully!</h1>
      </body>
    </html>
  `);
});


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`server is running on port`, PORT);
  `<h1>${"server is live"}</h1>`;
})
