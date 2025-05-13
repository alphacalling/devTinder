require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/database");
const authRoute = require("./src/routes/authRoutes");
const userRoute = require("./src/routes/userRoutes");
const connectionRoute = require("./src/routes/connectionRoute");

let PORT = process.env.PORT;

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// default routes
app.use("/v1", authRoute);
app.use("/v1", userRoute);
app.use("/v1", connectionRoute);

//server connection
app.listen(PORT, (err) => {
  if (err)
    throw new Error("Error while connecting with database: ", err.message);
  console.log(`Server is live at PORT: ${PORT}`);
});

// database connection
connectDB();
