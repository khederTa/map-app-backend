import express from "express";
import mongoose from "mongoose"
import cors from "cors"
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import userRoute from "./routes/users.js";
import pinRoute from "./routes/pins.js";
import mediaRoute from "./routes/media.js";
const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(express.json());

mongoose 
 .connect(process.env.MONGO_URL)   
 .then(() => console.log("MongoDB connected!"))
 .catch(err => console.log(err));

app.use("/api/auth", userRoute);
app.use("/api/pins", pinRoute);
app.use("/api/media", mediaRoute);

app.listen(PORT, () => {
  console.log("Backend server is running!");
});