angular.module("angular-mv").directive("mvDraggable", [
  "$timeout"
  "mvController"
  (
    $timeout
    mvController
  ) ->

    l = (scope, elem) ->

      elem.attr("draggable", true)

      # start = ->
      #   scope.mvDragged = true
      #   scope.$apply()
      #
      # end = ->
      #   scope.mvDragged = false
      #   scope.$apply()
      #
      # elem.on("dragstart.angular-mv", start)
      # elem.on("dragend.angular-mv", end)
      #
      # scope.$on("$destroy", ->
      #   elem.off("dragstart.angular-mv")
      #   elem.off("dragend.angular-mv")
      # )

    return {
      link: l
      restrict: "A"
    }
])
