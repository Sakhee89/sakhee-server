const express = require("express");
const cors = require("cors");

const apiRouter = require("./routes/api-router");
const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
  handleInvalidRouteErrors,
} = require("./controllers/errors-controllers");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

app.get("/api/*", handleInvalidRouteErrors);

app.use(handleCustomErrors);

app.use(handlePsqlErrors);

app.use(handleServerErrors);

module.exports = app;
