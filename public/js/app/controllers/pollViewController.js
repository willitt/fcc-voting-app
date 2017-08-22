angular.module("pollViewControllerModule", ["pollsServiceModule"])
    .controller("pollViewController", ["$routeParams", "$scope", "pollService", function($routeParams, $scope, pollService) {
        $scope.vm = {};
        if ($routeParams.pollId != null && $routeParams.pollId !== "") {
            pollService.getPoll($routeParams.pollId).then(function(pollObject) {
                if (pollObject.data) {
                    $scope.vm.poll = pollObject.data;
                    $scope.vm.selectedOption = "";
                }
            });
        }
        else {
            window.location.href = "/404";
        }
        
        $scope.vm.submitSelection = function(){
            pollService.vote($routeParams.pollId, $scope.vm.selectedOption)
            .then(function(resp){
                console.log(resp);
            });
        }
        
    }]);
