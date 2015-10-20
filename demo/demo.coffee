angular.module('demo', ['angular-mv'])

angular.module('demo').controller("horizontalCtrl", ["$scope", "$element", "mvList", ($scope, $element, MvList) ->

  $scope.words = [
    {txt:"machin", size: 2}
    {txt:"truc", size: 2}
    {txt:"xs", size: 1}
    {txt:"very long text", size: 4}
  ]

  $scope.list = new MvList($scope.words, $element, false)
  $scope.list.updated = -> $scope.$apply()
  $scope.list.accepts = (data, list) -> data.txt?

])


angular.module('demo').controller("simpleCtrl", ["$scope", "$element", "mvNew", "$compile", ($scope, $element, MvNew, $compile) ->

  $scope.selected = 0

  $scope.pages = [
    {
      title: "page 1"
      cols: [
        {
          lines: [
            {msg: "Line 1"}
            {msg: "Line 2"}
            {msg: "Line 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}
          ]
        }
        {
          lines: [
            {msg: "Line 1"}
            {msg: "Line 2"}
            {msg: "Line 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}
          ]
        }
      ]
    }
    {
      title: "page 2"
      cols: [
        {
          lines: [
            {msg: "Line 1"}
            {msg: "Line 2"}
            {msg: "Line 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}
          ]
        }
        {
          lines: [
            {msg: "Line 1"}
            {msg: "Line 2"}
            {msg: "Line 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}
          ]
        }
      ]
    }
    {
      title: "page 3"
      cols: [
        {
          lines: [
            {msg: "Line 1"}
            {msg: "Line 2"}
            {msg: "Line 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}
          ]
        }
        {
          lines: [
            {msg: "Line 1"}
            {msg: "Line 2"}
            {msg: "Line 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}
          ]
        }
      ]
    }
  ]

  $scope.logModel = -> console.log $scope.pages

  $scope.newLine = new MvNew($("#newLine"))
  $scope.newLine.start = -> {msg: "New Line"}
  $scope.newLine.cancel = -> console.log "cancel"
  # $scope.newLine.preview = (data)->



])

angular.module("demo").directive("demoPages", [
  "mvList"
  (
    MvList
  ) ->

    l = (scope, elem) ->
      scope.change = (idx) -> scope.selected = idx

      w = scope.$watch("pages", (pages) ->
        if !pages? then return else w()
        scope.list = new MvList(pages, elem)
        scope.list.updated = -> scope.$apply()
        scope.list.accepts = (data, list) -> data.cols?
      )

      elem.on("dragenter", "li", (e)->
        el = angular.element(e.target).closest("li")
        scope.selected = el.index()
        scope.$apply()
      )

      scope.$on("destroy", -> scope.list.destroy())

    return {
      link: l
      restrict: "E"
      replace: true
      template: """
      <ul class="nav nav-tabs nav-justified">
        <li ng-repeat="page in pages" role="presentation" mv-draggable ng-class="{'active': selected == $index}">
          <a ng-click="change($index)" href="">{{page.title}}</a>
        </li>
      </ul>
      """
    }

])

angular.module("demo").directive("demoCols", [
  "mvList"
  (
    MvList
  ) ->

    l = (scope, elem) ->

      w = scope.$watch("cols", (cols) ->
        if !cols? then return else w()
        scope.list = new MvList(cols, elem)
        scope.list.updated = -> scope.$apply()
        scope.list.accepts = (data, list) -> data.lines?
      )

      scope.$on("destroy", -> scope.list.destroy())

    return {
      link: l
      restrict: "E"
      replace: true
      scope:
        cols: "=cols"
      template: """
      <div>
        <div ng-repeat="col in cols" mv-draggable>
          <div class="panel panel-default" ng-class="{'panel-warning': list.draggedData() == col}">
            <div class="panel-heading">
              <h3 class="panel-title">Move me - {{col.lines.length}} elems</h3>
            </div>
              <demo-list lines="col.lines"></demo-list>
          </div>
        </div>
      </div>
      """
    }

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
        scope.list.accepts = (data, list) -> data.msg?
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
