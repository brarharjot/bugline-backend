const mongoose = require("mongoose")

const bugSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  severity: {
    type: String,
    enum: ["URGENT", "MEDIUM", "LOW"],
    default: "LOW",
  },
})

bugSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const Bug = mongoose.model("Bug", bugSchema)

module.exports = Bug
