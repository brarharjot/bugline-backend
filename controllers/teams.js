const teamRouter = require("express").Router()
const Team = require("../models/team")

//Get all teams owned or joined by the user
teamRouter.get("/", async (request, response) => {
  const user = request.user
  if (user) {
    const teams = await Team.find({
      members: { $all: [user._id] },
    }).populate("members", { username: 1 })
    response.json(teams)
  } else {
    response.status(401).json({ error: "user not logged in" })
  }
})

//Get a particular team
teamRouter.get("/:id", async (request, response) => {
  const user = request.user
  const team = await Team.findById(request.params.id)
    .populate("members", {
      username: 1,
      name: 1,
    })
    .populate("bugs", { name: 1, desc: 1 })

  const isUserMember = team.members.find(
    (member) => member.username === user.username
  )

  if (isUserMember) {
    response.json(team)
  } else {
    response.status(401).json({ error: "user is not a team member" })
  }
})

//Get an invite link to a team owned by the user
teamRouter.get("/:id/invite", async (request, response) => {
  const user = request.user
  const team = await Team.findById(request.params.id)
  if (!team) {
    response.status(401).json({ error: "no team exists for provided id" })
  } else if (team.owner.toString() === user._id.toString()) {
    const invite =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)

    team.invites = team.invites.concat(invite)
    await team.save()
    response.json(invite)
  } else {
    response.status(401).json({ error: "token doesn't match team owner" })
  }
})

//Create a new team
teamRouter.post("/", async (request, response) => {
  const body = request.body
  const user = request.user

  if (!user) {
    response.status(401).send({ error: "token missing or invalid" })
  } else {
    const team = new Team({
      name: body.name,
      owner: user._id,
      members: [].concat(user._id),
    })

    const savedTeam = await team.save()
    user.teams = user.teams.concat(savedTeam._id)
    await user.save()
    response.status(201).json(savedTeam)
  }
})

//Join a team from an invite link
teamRouter.get("/join/:link", async (request, response) => {
  const user = request.user
  if (!user) {
    response.status(401).send({ error: "token missing or invalid" })
  }
  const team = await Team.find({
    invites: request.params.link,
  })
  console.log(team)
  if (!team[0]) {
    response.status(401).json({ error: "no team exists for provided id" })
  }

  if (team[0].members.includes(user._id)) {
    response
      .status(400)
      .json({ error: "user is already a member of this team" })
  } else {
    team[0].members = team[0].members.concat(user._id)
    const savedTeam = await team[0].save()
    response.status(201).json(savedTeam)
  }
})

//Delete a team
teamRouter.delete("/:id", async (request, response) => {
  const user = request.user
  if (!user) {
    response.status(401).send({ error: "token missing or invalid" })
  } else {
    const teamToDelete = await Team.findById(request.params.id)

    if (teamToDelete.owner.toString() === user._id.toString()) {
      await Team.findByIdAndRemove(request.params.id)
      response.status(204).end()
    } else {
      response.status(401).json({ error: "token doesn't match team owner" })
    }
  }
})

//Edit the team's name
teamRouter.put("/:id", async (request, response) => {
  const body = request.body
  const user = request.user
  if (!user) {
    response.status(401).send({ error: "token missing or invalid" })
  } else {
    const teamToUpdate = await Team.findById(request.params.id)

    if (teamToUpdate.owner.toString() === user._id.toString()) {
      const team = {
        name: body.name,
      }
      const updatedTeam = await Team.findByIdAndUpdate(
        request.params.id,
        team,
        {
          new: true,
        }
      ).populate("members", {
        username: 1,
        name: 1,
      })
      response.status(200).json(updatedTeam)
    } else {
      response.status(401).json({ error: "token doesn't match team owner" })
    }
  }
})

module.exports = teamRouter
