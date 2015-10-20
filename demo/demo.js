(function() {
  angular.module('demo', ['angular-mv']);

  angular.module('demo').controller("horizontalCtrl", [
    "$scope", "$element", "mvList", function($scope, $element, MvList) {
      $scope.words = [
        {
          txt: "machin",
          size: 2
        }, {
          txt: "truc",
          size: 2
        }, {
          txt: "xs",
          size: 1
        }, {
          txt: "very long text",
          size: 4
        }
      ];
      $scope.list = new MvList($scope.words, $element, false);
      $scope.list.updated = function() {
        return $scope.$apply();
      };
      return $scope.list.accepts = function(data, list) {
        return data.txt != null;
      };
    }
  ]);

  angular.module('demo').controller("simpleCtrl", [
    "$scope", "$element", "mvNew", "$compile", function($scope, $element, MvNew, $compile) {
      $scope.selected = 0;
      $scope.pages = [
        {
          title: "page 1",
          cols: [
            {
              lines: [
                {
                  msg: "Line 1"
                }, {
                  msg: "Line 2"
                }, {
                  msg: "Line 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
                }
              ]
            }, {
              lines: [
                {
                  msg: "Line 1"
                }, {
                  msg: "Line 2"
                }, {
                  msg: "Line 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
                }
              ]
            }
          ]
        }, {
          title: "page 2",
          cols: [
            {
              lines: [
                {
                  msg: "Line 1"
                }, {
                  msg: "Line 2"
                }, {
                  msg: "Line 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
                }
              ]
            }, {
              lines: [
                {
                  msg: "Line 1"
                }, {
                  msg: "Line 2"
                }, {
                  msg: "Line 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
                }
              ]
            }
          ]
        }, {
          title: "page 3",
          cols: [
            {
              lines: [
                {
                  msg: "Line 1"
                }, {
                  msg: "Line 2"
                }, {
                  msg: "Line 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
                }
              ]
            }, {
              lines: [
                {
                  msg: "Line 1"
                }, {
                  msg: "Line 2"
                }, {
                  msg: "Line 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
                }
              ]
            }
          ]
        }
      ];
      $scope.logModel = function() {
        return console.log($scope.pages);
      };
      $scope.newLine = new MvNew($("#newLine"));
      $scope.newLine.start = function() {
        return {
          msg: "New Line"
        };
      };
      return $scope.newLine.cancel = function() {
        return console.log("cancel");
      };
    }
  ]);

  angular.module("demo").directive("demoPages", [
    "mvList", function(MvList) {
      var l;
      l = function(scope, elem) {
        var w;
        scope.change = function(idx) {
          return scope.selected = idx;
        };
        w = scope.$watch("pages", function(pages) {
          if (pages == null) {
            return;
          } else {
            w();
          }
          scope.list = new MvList(pages, elem);
          scope.list.updated = function() {
            return scope.$apply();
          };
          return scope.list.accepts = function(data, list) {
            return data.cols != null;
          };
        });
        elem.on("dragenter", "li", function(e) {
          var el;
          el = angular.element(e.target).closest("li");
          scope.selected = el.index();
          return scope.$apply();
        });
        return scope.$on("destroy", function() {
          return scope.list.destroy();
        });
      };
      return {
        link: l,
        restrict: "E",
        replace: true,
        template: "<ul class=\"nav nav-tabs nav-justified\">\n  <li ng-repeat=\"page in pages\" role=\"presentation\" mv-draggable ng-class=\"{'active': selected == $index}\">\n    <a ng-click=\"change($index)\" href=\"\">{{page.title}}</a>\n  </li>\n</ul>"
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
        scope: {
          cols: "=cols"
        },
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
