'use strict';

var Poll = require('../models/polls.js');
var pollModel = require('../../common/models/poll.js');
var userSelection = require('../../common/models/userSelection.js');
var UserHandler = require('../controllers/userHandler.server.js');

function PollHandler() {

	var userHandler = new UserHandler();

	this.getPoll = function(req, res) {
		Poll.findOne({ '_id': req.params.id })
			.exec(function(err, result) {
				var response = {
					userSelection: null,
					pollInfo: result
				};
				if (err) { throw err; }
				if (req.user) {
					var selectArray = result.participants.filter(function(participant) {
						return participant.userId == req.user.github.id
					});
					response.userSelection = selectArray.length > 0 ? selectArray[0].optionId : null;
				}
				res.json(response);
			});
	};

	this.getPolls = function(req, res) {
		Poll.find(function(err, results) {
			if (err) {
				throw err;
			}
			else {
				res.status(200);
				res.json(results);
			}
		});
	};

	this.getUserPolls = function(req, res) {
		if (req.user) {
			Poll.find({ "creator.id": req.user.github.id }, function(err, results) {
				if (err) {
					throw err;
				}
				else {
					res.status(200);
					res.json(results);
				}
			});
		}
		else {
			throw "User Not Logged In";
		}
	};
	this.addPoll = function(req, res) {
		if (req.user) {
				var newPoll = new Poll(new pollModel(req.body.name, req.body.description, req.user.github.id, req.user.github.displayName, req.body.options));
				newPoll.save(function(err, savedNewPoll) {
					if (!err) {
						res.status(200);
						res.json({ pollId: savedNewPoll._id });
					}
					else {
						throw err;
					}
				});
		}
		else {
			res.json({ message: "User Must Log In" });
		}
	};

	this.editPoll = function(req, res) {
		if (req.user) {
			Poll.findOne({ '_id': req.params.id })
				.exec(function(err, pollToEdit) {
					if (err) { throw err; }
					else if (pollToEdit.creator.id !== req.user.github.id) {
						res.status(403);
						res.json({ status: 2, message: "You are not authorized to edit this poll" });
					}
					else {
						req.body.options.forEach(function(option) {
							option.numTimesSelected = 0;
						});
						pollToEdit.name = req.body.name;
						pollToEdit.description = req.body.description;
						pollToEdit.options = req.body.options;
						pollToEdit.participants = [];


						pollToEdit.save(function(err, updatedPoll) {
							if (err) {
								throw err;
							}
							else {
								res.status(200);
								res.json({ status: 0, message: "Poll Edit Successful" });

							}
						});
					}
				});
		}
		else {
			res.status(403);
			res.json({ status: 1, message: "Must Log In To Edit Poll" });
		}
	}

	this.voteOnPoll = function(req, res) {
		var cookie = req.cookies.WillittFccVote;
		Poll.findOne({ '_id': req.body.pollId },
			function(err, votingPoll) {
				var selectedOption,
					userVoted = false;
				if (err || votingPoll == null) {
					res.status(500);
					res.send("Poll Not Found");
				}
				else {
					if (req.user) {
						votingPoll.participants.forEach(function(userInfo, index, participantArray) {
							if (req.user.github.id === userInfo.userId) {
								userVoted = true;
								adjustOption(votingPoll.options, userInfo.optionId, -1);
								userInfo.optionId = req.body.optionId;
								adjustOption(votingPoll.options, req.body.optionId, 1);
							}
						});
						if (!userVoted) {
							adjustOption(votingPoll.options, req.body.optionId, 1);
							votingPoll.participants.push(new userSelection(req.user.github.id, "", req.body.optionId));
						}
						savePoll();
					}
					else if(cookie){
						votingPoll.participants.forEach(function(userInfo, index, participantArray) {
							if (cookie.uuid === userInfo.uuid) {
								userVoted = true;
								adjustOption(votingPoll.options, userInfo.optionId, -1);
								userInfo.optionId = req.body.optionId;
								adjustOption(votingPoll.options, req.body.optionId, 1);
							}
						});
						if (!userVoted) {
							adjustOption(votingPoll.options, req.body.optionId, 1);
							votingPoll.participants.push(new userSelection("", cookie.uuid, req.body.optionId));
						}
						savePoll();
					}
					else{
						throw { status: 3, message: "You Must Be Logged in or have cookies enabled to use this application"};
					}
				}

				function savePoll() {
					votingPoll.save(function(err, updatedPoll) {
						if (err) {
							res.status(500);
							res.send("Unexpected Error Occured")
						}
						else {
							res.status(200);
							res.json(updatedPoll);
						}
					});
				}
			}
		);
	}

	function validatePoll(pollObj) {
		if (pollObj.name && pollObj.creator && pollObj.creator.id && pollObj.options.length) {
			return { isValid: true };
		}
		else {
			return { isValid: false, message: "Invalid poll data Provided" };
		}
	}

	function adjustOption(pollOptions, selectedId, adjustment) {
		for (var i = 0; i < pollOptions.length; i++) {
			if (pollOptions[i].optionId === selectedId) {
				pollOptions[i].numTimesSelected += adjustment;
				return;
			}
		}
	}
}

module.exports = PollHandler;