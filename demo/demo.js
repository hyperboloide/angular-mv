(function() {
  angular.module('demo', ['angular-mv']);

  angular.module('demo').controller("simpleCtrl", [
    "$scope", "$element", function($scope, $element) {
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

  angular.module("demo").directive("demoList", [
    "mvList", function(MvList) {
      var l;
      l = function(scope, elem) {
        var w;
        w = scope.$watch("lines", function(lines) {
          if (lines == null) {
            return;
          } else {
            w();
          }
          scope.list = new MvList(lines, elem);
          return scope.list.updated = function() {
            return scope.$apply();
          };
        });
        return scope.$on("destroy", function() {
          return scope.list.destroy();
        });
      };
      return {
        link: l,
        restrict: "E",
        replace: true,
        scope: {
          lines: "=lines"
        },
        template: "<ul class=\"list-group\">\n\n  <li\n    ng-repeat=\"line in lines\"\n    mv-draggable\n    class=\"list-group-item\"\n    ng-class=\"{'list-group-item-warning': list.draggedData() == line}\">\n\n    {{ line.msg }}\n\n  </li>\n\n  <li class=\"list-group-item active mvPlaceholder\">\n    This list is empty, drop an element.\n  </li>\n</ul>"
      };
    }
  ]);

}).call(this);
