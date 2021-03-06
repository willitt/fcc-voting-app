(function() {
    angular.module("pollApp")
        .service("pollService", ["$http", function($http) {
            var self = this;

            self.getPoll = function(id) {
                var url = "/poll/" + id;
                return $http({
                    method: "GET",
                    url: url
                });
            };

            self.getPolls = function(numItems) {
                var requestObj = { "numItems": numItems };
                return $http({
                    method: "GET",
                    url: "/polls",
                    params: requestObj
                });
            };

            self.getUserPolls = function(userId) {
                return $http({
                    method: "GET",
                    url: "/userPolls"
                });
            };

            self.createPoll = function(pollObj) {
                var requestData = pollObj;
                return $http({
                    method: "POST",
                    url: "/addPoll",
                    data: requestData
                });
            };

            self.editPoll = function(pollId, pollObj) {
                var requestData = {
                    "pollId": pollId,
                    "pollData": pollObj
                };
                return $http({
                    method: "POST",
                    url: "/editPoll",
                    data: requestData
                });
            };

            self.deletePoll = function(pollId) {
                var requestData = {
                    "pollId": pollId,
                };
                return $http({
                    method: "POST",
                    url: "/deletePoll",
                    data: requestData
                });
            };

            self.addPollOption = function(pollId, optionText) {
                var requestData = {
                    "pollId": pollId,
                    "optionText": optionText
                };

                return $http({
                    method: "POST",
                    url: "/addPollOption",
                    data: requestData,
                    type: "application/json"
                });
            }

            self.vote = function(pollId, optionId) {
                var requestData = {
                    "pollId": pollId,
                    "optionId": optionId
                };
                return $http({
                    method: "POST",
                    url: "/vote",
                    data: requestData,
                    type: "application/json"
                });
            };

            return self;
        }]);
}());
