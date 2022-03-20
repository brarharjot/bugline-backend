const mongoose = require("mongoose")

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  bugs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bug",
    },
  ],
  invites: [{ type: String }],
})

teamSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const Team = mongoose.model("Team", teamSchema)

module.exports = Team
