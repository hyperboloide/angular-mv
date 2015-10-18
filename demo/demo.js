(function() {
  angular.module('demo', ['angular-mv']);

  angular.module('demo').controller("simpleCtrl", [
    "$scope", "$element", function($scope, $element) {
      var lines1, lines2, lines3;
      lines1 = [
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
      lines2 = [
        {
          msg: "Line 1"
        }, {
          msg: "Line 2"
        }
      ];
      lines3 = [];
      $scope.cols = [
        {
          lines: lines1
        }, {
          lines: lines2
        }, {
          lines: lines3
        }
      ];
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

  angular.module("demo").directive("demoCols", [
    "mvList", function(MvList) {
      var l;
      l = function(scope, elem) {
        var w;
        w = scope.$watch("cols", function(cols) {
          if (cols == null) {
            return;
          } else {
            w();
          }
          scope.list = new MvList(cols, elem);
          scope.list.updated = function() {
            return scope.$apply();
          };
          return scope.list.accepts = function(data, list) {
            return data.lines != null;
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
        template: "<div>\n  <div ng-repeat=\"col in cols\" mv-draggable>\n    <div class=\"panel panel-default\" ng-class=\"{'panel-warning': list.draggedData() == col}\">\n      <div class=\"panel-heading\">\n        <h3 class=\"panel-title\">Move me - {{col.lines.length}} elems</h3>\n      </div>\n        <demo-list lines=\"col.lines\"></demo-list>\n    </div>\n  </div>\n</div>"
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
          scope.list.updated = function() {
            return scope.$apply();
          };
          return scope.list.accepts = function(data, list) {
            return data.msg != null;
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
        template: "<ul class=\"list-group\">\n  <li\n    ng-repeat=\"line in lines\"\n    mv-draggable\n    class=\"list-group-item\"\n    ng-class=\"{'list-group-item-warning': list.draggedData() == line}\">\n    {{ line.msg }}\n  </li>\n  <li class=\"list-group-item active mvPlaceholder\">\n    This list is empty, drop an element.\n  </li>\n</ul>\n"
      };
    }
  ]);

}).call(this);
