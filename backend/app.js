const express = require("express");
const mongoose = require("mongoose");
// const BookRoutes = require("./routes/book");
// const userRoutes = require("./routes/user");
const path = require("path");

const app = express();
mongoose
  .connect(
    "mongodb+srv://OCGrimoire:TheGrim4@grimoire.s1n7h.mongodb.net/?retryWrites=true&w=majority&appName=Grimoire"
  )
  .then(() => {
    console.log("Successfully connected to MongoDB Atlas!");
  })
  .catch((error) => {
    console.log("Unable to connect to MongoDB Atlas!");
    console.error(error);
  });

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));

// app.use("/api/book", BookRoutes);
// app.use("/api/auth", userRoutes);

module.exports = app;
