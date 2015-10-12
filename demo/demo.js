(function() {
  angular.module('demo', ['angular-mv']);

  angular.module('demo').controller("simpleCtrl", [
    "$scope", function($scope) {
      $scope.lines1 = [
        {
          msg: "Line 1"
        }, {
          msg: "Line 2"
        }, {
          msg: "Line 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        }, {
          msg: "Line 4"
        }, {
          msg: "Line 5"
        }, {
          msg: "Line 6"
        }
      ];
      $scope.lines2 = [
        {
          msg: "Line 1"
        }
      ];
      $scope.lines3 = [];
      return $scope.logModel = function() {
        var model;
        model = {
          lines1: $scope.lines1,
          lines2: $scope.lines2,
          lines3: $scope.lines3
        };
        return console.log(model);
      };
    }
  ]);

}).call(this);
