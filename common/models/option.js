var OptionModel = function(optionId, optionText, numTimesSelected){
    this.optionId = optionId;
    this.optionText = optionText;
    this.numTimesSelected = numTimesSelected || 0;
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = OptionModel;
}
else if (typeof angular !== "undefined"){
    angular.module("pollApp")
        .factory("OptionModel", function(){ return OptionModel });
}