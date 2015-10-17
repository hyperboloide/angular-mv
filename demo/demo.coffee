angular.module('demo', ['angular-mv'])

angular.module('demo').controller("simpleCtrl", ["$scope", "$element", ($scope, $element) ->

  $scope.lines1 = [
    {msg: "Line 1"}
    {msg: "Line 2"}
    {msg: "Line 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}
    {msg: "Line 4"}
    {msg: "Line 5"}
    {msg: "Line 6"}
  ]

  $scope.lines2 = [
    {msg: "Line 1"}
  ]

  $scope.lines3 = []

  $scope.logModel = ->
    model =
      lines1: $scope.lines1
      lines2: $scope.lines2
      lines3: $scope.lines3
    console.log model

])

angular.module("demo").directive("demoList", [
  "mvList"
  (
    MvList
  ) ->

    l = (scope, elem) ->

      w = scope.$watch("lines", (lines) ->
        if !lines? then return else w()
        scope.list = new MvList(lines, elem)
        scope.list.updated = -> scope.$apply()
      )

      scope.$on("destroy", -> scope.list.destroy())

    return {
      link: l
      restrict: "E"
      replace: true
      scope:
        lines: "=lines"
      template: """
      <ul class="list-group">

        <li
          ng-repeat="line in lines"
          mv-draggable
          class="list-group-item"
          ng-class="{'list-group-item-warning': list.draggedData() == line}">

          {{ line.msg }}

        </li>

        <li class="list-group-item active mvPlaceholder">
          This list is empty, drop an element.
        </li>
      </ul>
      """
    }

])
