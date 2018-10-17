var mongoose = require("mongoose");

var taskSchema = new mongoose.Schema({
   content: String,
   page: String,
   section: String,
   status: String,
   stamp: {type: Date, default: Date.now}},
   {versionKey: false 
});

module.exports = mongoose.model("task", taskSchema);