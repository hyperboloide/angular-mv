angular.module("angular-mv").directive("mvDraggable", [
  () ->

    l = (scope, elem) ->

      elem.attr("draggable", true)

    return {
      link: l
      restrict: "A"
    }
])
