const bugRouter = require("express").Router()
const Bug = require("../models/bug")
const Team = require("../models/team")

//Get all bugs for a specific team
bugRouter.get("/:team", async (request, response) => {
  const user = request.user
  if (user) {
    const team = await Team.findById(request.params.team)
    if (team.members.includes(user._id)) {
      const bugs = await Bug.find({ team: request.params.team })

      response.status(200).json(bugs)
    } else {
      response.status(400).json({ error: "user is not a member of the team" })
    }
  }
})

//Add a new bug report to a team
bugRouter.post("/:teamId", async (request, response) => {
  const user = request.user
  const body = request.body
  if (user) {
    const teamForBug = await Team.findById(request.params.teamId).populate(
      "members",
      {
        username: 1,
        name: 1,
      }
    )
    const isTeamMember = teamForBug.members.filter(
      (member) => member._id.toString() === user._id.toString()
    )
    if (isTeamMember.length > 0) {
      const bug = new Bug({
        name: body.name,
        desc: body.desc,
        team: request.params.teamId,
        creator: user._id,
        severity: body.severity,
        solved: body.solved,
      })

      const savedBug = await bug.save()
      teamForBug.bugs = teamForBug.bugs.concat(savedBug._id)
      await teamForBug.save()
      const teamToReturn = await teamForBug.populate("bugs")
      response.status(201).json(teamToReturn)
    }
  } else {
    response.status(401).json({ error: "user not logged in" })
  }
})

//Delete a bug
bugRouter.delete("/:bugId", async (request, response) => {
  const user = request.user
  if (!user) {
    response.status(401).send({ error: "token missing or invalid" })
  } else {
    const bugToDelete = await Bug.findById(request.params.bugId)
    const teamForBug = await Team.findById(bugToDelete.team)
    if (teamForBug.members.includes(user._id)) {
      await Bug.findByIdAndRemove(request.params.bugId)
      teamForBug.bugs = teamForBug.bugs.filter(
        (bug) => bug._id.toString() !== request.params.bugId
      )
      teamForBug.save()
      response.status(204).end()
    } else {
      response.status(401).json({ error: "token doesn't match bug owner" })
    }
  }
})

//Set bug as solved
bugRouter.get("/:bugId/solved", async (request, response) => {
  const user = request.user
  if (!user) {
    response.status(401).send({ error: "token missing or invalid" })
  } else {
    const bugToUpdate = await Bug.findById(request.params.bugId)
    const teamForBug = await Team.findById(bugToUpdate.team)
    if (teamForBug.members.includes(user._id)) {
      const updatedBug = {
        name: bugToUpdate.name,
        desc: bugToUpdate.desc,
        team: bugToUpdate.team,
        creator: bugToUpdate.creator,
        severity: bugToUpdate.severity,
        solved: true,
      }
      const savedBug = await Bug.findByIdAndUpdate(
        request.params.bugId,
        updatedBug,
        {
          new: true,
        }
      )
      response.status(200).json(savedBug)
    } else {
      response.status(401).json({ error: "token doesn't match bug owner" })
    }
  }
})

module.exports = bugRouter
