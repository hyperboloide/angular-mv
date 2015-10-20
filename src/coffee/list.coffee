angular.module("angular-mv").factory("mvList", [
  "mvController"
  (
    mvController
  )->

    class MvList

      constructor: (@list, @elem, @vertical = true) ->
        @setup()

      getEl = (e) -> angular.element(e.target)

      stopPropagation = (e) ->
        e = if e.originalEvent? then e.originalEvent else e
        if e.stopPropagation? then e.stopPropagation()
        e

      handle: (next) ->
        (e) =>
          ctrl = mvController.get()
          if !ctrl? or !@accepts(ctrl.dragged.data, @list)
            return
          next(stopPropagation(e))

      setup: ->
        @elem.on("dragstart.angular-mv", "[mv-draggable]", @dragstart)
        @elem.on("dragenter.angular-mv", "[mv-draggable]", @handle(@dragenter))
        @elem.on("dragenter.angular-mv", ".mvPlaceholder", @handle(@dragenter))
        @elem.on("dragover.angular-mv", @handle(-> ))
        @elem.on("dragover.angular-mv", "[mv-draggable]", @handle(@dragover))
        @elem.on("drop.angular-mv", "[mv-draggable]", @handle(@drop))

      destroy: =>
        @elem.off("dragstart.angular-mv", "[mv-draggable]")
        @elem.off("dragenter.angular-mv", "[mv-draggable]")
        @elem.on("dragenter.angular-mv", ".mvPlaceholder")
        @elem.off("dragover.angular-mv")
        @elem.off("dragover.angular-mv", "[mv-draggable]")
        @elem.off("drop.angular-mv", "[mv-draggable]")

      draggedData: ->
        if mvController.get()?
          return mvController.get().dragged.data

      dragstart: (e) =>
        e = stopPropagation(e)
        el = getEl(e)
        dg =
          data: @list[el.index()]
          elem: el
          container: @
        mvController.start(dg, e, false, @vertical)

      dragenter: (e) =>
        ctrl = mvController.get()
        if !ctrl? then return
        el = getEl(e).closest(".mvPlaceholder, [mv-draggable]", @elem)
        if el.hasClass("mvPlaceholder")
          ctrl.insertInto(@)
        else if el.attr("mv-draggable")? and el.parent().is(@elem)
          data = @list[el.index()]
          if ctrl.dragged.data == data then return
          ctrl.switchWith(data, @, el, e)

      dragover: (e) =>
        if _.isFunction(e.preventDefault)?
          e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        ctrl = mvController.get()
        el = getEl(e)
        el = el.closest("[mv-draggable], .mvSelector", @elem)
        if el.parent().is(@elem)
          if el.hasClass("mvPlaceholder")
            ctrl.insertInto(@)
          else if el.index() != _.indexOf(@list, ctrl.dragged.data)
            ctrl.switchWith(@list[el.index()], @, el, e)
        false

      drop: (e) => mvController.stop()

      accepts: (data, list) -> true

      updated: ->

])
