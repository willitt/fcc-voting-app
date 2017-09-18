'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
    name: String,
    creator: {id: String, userName: String},
    participants: [{userId: String, optionId: Number}],
    options: [{optionText: String, optionId: Number, numTimesSelected: Number}]
});

module.exports = mongoose.model('PollModel', Poll);