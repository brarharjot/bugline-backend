const bugRouter = require("express").Router()
const Bug = require("../models/bug")
const Team = require("../models/team")

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
    console.log(teamForBug)
    const isTeamMember = teamForBug.members.filter(
      (member) => member._id.toString() === user._id.toString()
    )
    if (isTeamMember.length > 0) {
      console.log("member check passed")
      const bug = new Bug({
        name: body.name,
        desc: body.desc,
        team: request.params.teamId,
        creator: user._id,
        severity: body.severity,
        solved: body.solved,
      })

      const savedBug = await bug.save()
      console.log("saved bug")
      teamForBug.bugs = teamForBug.bugs.concat(savedBug._id)
      console.log("concated bugs to team")
      await teamForBug.save()
      console.log("saved team")

      response.status(200).json(teamForBug)
    }
  } else {
    response.status(401).json({ error: "user not logged in" })
  }
})

module.exports = bugRouter
