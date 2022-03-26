const bcrypt = require("bcrypt")
const userRouter = require("express").Router()
const User = require("../models/user")

userRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body

  if (!(username && password)) {
    return response.status(400).json({
      error: "username or password is missing",
    })
  } else if (!(username.length >= 3 && password.length >= 3)) {
    return response.status(400).json({
      error: "username and password must be atleast 3 characters long",
    })
  }

  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: "username already taken",
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

userRouter.get("/", async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

userRouter.get("/:id", async (request, response) => {
  const user = await User.find(request.params.id)
  if (user) {
    response.json(user)
  } else {
    response.status(400).json({ error: "no user found" })
  }
})

module.exports = userRouter
