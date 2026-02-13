require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");
const authRoute = require("./routes/authRoutes");
const userRoute = require("./routes/userRoutes");
const postRoute = require("./routes/postRoute");
const connectionRoute = require("./routes/connectionRoute");

let PORT = process.env.PORT;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);
// Properly handle preflight requests
app.options(
  "*",
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173/"],
  })
);

const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// default routes
app.use("/v1", authRoute);
app.use("/v1", userRoute);
app.use("/v1", postRoute);
app.use("/v1", connectionRoute);

// start server after database connection
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server is live at PORT: ${PORT}`);
    });
  } catch (err) {
    console.error("Error while connecting to the database:", err.message);
    process.exit(1);
  }
};

startServer();
