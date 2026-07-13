import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import router from "./routes/agent.route.js";
dotenv.config();
const app = express();
app.use(express.json());
const port=process.env.PORT

app.use("/",router);

app.use((err, req, res, next) => {

  console.error(err);
  
  let status = err.status || 500;
  
  // Prevent frontend from interpreting external API auth errors (e.g. Qdrant 401) as a user session expiration
  if (status === 401) {
    status = 500;
  }

  if (err.status) {

    return res
      .status(status)
      .json(err.data || { success: false, message: err.message });

  }

  return res
    .status(500)
    .json({

      success: false,

      message: err.message || "Internal Server Error"

    });

});

app.listen(port, () => {
    connectDB()
  console.log(
    `agent service running on ${port}`
  );
});
