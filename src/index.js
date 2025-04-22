// import dotenv from "dotenv";
// import { app } from "./app.js";
// import connectDB from "../config/db.js";

dotenv.config({
  path: "./.env",
});

(async () => {
  await connectDB();
  app.listen(process.env.PORT || 8000, () => {
    console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
  });
})();

// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});
