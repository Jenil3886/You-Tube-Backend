// require('dotenv').config({path: './env'})
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

import connectDB from "./db/index.js";
import { server } from "./app.js";
import "./models/associations.js";

(async () => {
  await connectDB();
  //   app.listen(process.env.PORT || 8000, () => {
  //     console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
  //   });
  server.listen(process.env.PORT || 8000, () => {
    console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
  });
})();
