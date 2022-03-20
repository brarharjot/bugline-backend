const config = require("./utils/config")
const express = require("express")
require("express-async-errors")
const app = express()
const cors = require("cors")
const userRouter = require("./controllers/users")
const loginRouter = require("./controllers/login")
const teamRouter = require("./controllers/teams")
const middleware = require("./utils/middleware")
const logger = require("./utils/logger")
const mongoose = require("mongoose")

logger.info(`Connecting to ${config.MONGODB_URI}`)

mongoose
  .connect(config.MONGODB_URI, () => {
    logger.info("MongoDB connected")
  })
  .catch((e) => {
    logger.error("error connecting to mongodb", e)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use("/api/teams", middleware.userExtractor, teamRouter)
app.use("/api/users", userRouter)
app.use("/api/login", loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
