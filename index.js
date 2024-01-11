require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = 5000;
const DB_URL = process.env.DB_URL;
const https = require("https");
const fs = require("fs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const AuthRoutes = require("./Routes/auth/linkedin");
const UserRoutes = require("./Routes/user");

// const httpsServer = https.createServer(
//   {
//     key: fs.readFileSync("privkey.pem"),
//     cert: fs.readFileSync("fullchain.pem"),
//   },
//   app
// );


// // MIDDLEWARES
var corsOptions = {
  origin: [
    "https://collab.anchors.in",
    "http://localhost:5173",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // allow session cookie from browser to pass through
};

app.use(cors(corsOptions));

app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("mongo is connected");
  })
  .catch((e) => {
    console.log("error in connecting mongo", e);
  });

//Routes middleware
app.use("/auth", AuthRoutes);
app.use("/user", UserRoutes);
app.use("/aws", require("./Routes/awsRoute"));

app.get("/", (req, res) => {
  res.send("Welcome to anchors collab");
});

app.listen(PORT, () => {
 console.log("Server started in port 5000");
});


// httpsServer.listen(PORT, () => {
//   console.log("HTTPS Server running on port 5000");
// });
