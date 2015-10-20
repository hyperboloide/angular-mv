angular.module("angular-mv").factory("mvNew", [
  "mvController"
  (
    mvController
  )->

    class MvNew

      constructor: (@elem, @vertical = true) ->
        @elem.attr("draggable", true)
        @setup()

      stopPropagation = (e) ->
        e = if e.originalEvent? then e.originalEvent else e
        if e.stopPropagation? then e.stopPropagation()
        e

      setup: ->
        @elem.on("dragstart.angular-mv", @dragstart)

      destroy: =>
        @elem.off("dragstart.angular-mv")

      start: ->

      cancel: ->

      complete: ->

      preview: (data) -> @elem

      updated: ->

      dragstart: (e) =>
        e = stopPropagation(e)
        dg =
          data: @start()
          elem: @preview()
          container: @
        mvController.start(dg, e, false, @vertical)




])
