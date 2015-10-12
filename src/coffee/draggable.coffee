angular.module("angular-mv").directive("mvDraggable", [
  () ->

    l = (scope, elem) ->

      elem.attr("draggable", true)

      dragstart = ->
        scope.mvDragged = true
        scope.$apply()

      dragend = ->
        scope.mvDragged = false
        scope.$apply()

      register = ->
        elem.off("dragstart.angular-mv").on("dragstart.angular-mv", dragstart)
        elem.off("dragend.angular-mv").on("dragend.angular-mv", dragend)

      scope.$watch(register)

      scope.$on("$destroy", ->
        elem.off("dragstart.angular-mv")
        elem.off("dragend.angular-mv")
      )

    return {
      link: l
      restrict: "A"
    }
])
