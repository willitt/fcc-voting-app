var Users = require('../models/users.js');
var pollInfo = require("../models/general/pollInfo.js");

function UserHandler() {
    
    this.getUserInfo = function(req, res) {
        if(req.user){
        Users.findOne({ '_id': req.user._id })
            .exec(function(err, result) {
                if (err) {
                    throw err;
                }
                else {
                    res.json(result);
                }
            });
        }
        else{
            res.status(500);
            res.json({status: 0, message: "User Not Logged In"});
        }
    };
    
    this.addUpdateParticipatedPoll = function(userId, pollId, pollName) {
        return new Promise(function(resolve, reject) {
            Users.findOne({ 'github.id': userId }).exec(function(err, result) {
                if (err) {
                    reject("DB Error Occured");
                }
                else {
                    if (!isPollParticipated(result.participatedPolls, pollId)) {
                        result.participatedPolls.push(new pollInfo(pollId, pollName));
                        result.save(function(err, result) {
                            if (err) {
                                reject("DB Error Occured");
                            }
                            else {
                                resolve("Updated");
                            }
                        });
                    }
                    else {
                        resolve("Poll participated");
                    }
                }
            });
        });
    }

    function isPollParticipated(participatedPolls, pollId) {
        var pollParticipated = false;
        participatedPolls.forEach(function(pollInfo) {
            pollParticipated = pollParticipated || pollInfo.id === pollId;
        });
        return pollParticipated;
    }

}

module.exports = UserHandler;