angular.module("angular-mv").factory("mvController", [
  "$timeout"
  (
    $timeout
  )->

    _controller = null


    class MvController

      constructor: (@dragged, event, @mobile) ->
        @position =
          parent: @dragged.elem.parent()
          index: @dragged.elem.index()
        if @mobile == false
          json = JSON.stringify(@dragged.data)
          event.dataTransfer.setData("application/json", json)
        @createPreview(event)

      previewOffset: (event) ->
        o = @dragged.elem.offset()
        @offset = [event.pageX - o.left, event.pageY - o.top]

      createPreview: (event)->
        @preview = @dragged.elem.clone()
        @preview.width(@dragged.elem.width())
        @preview.appendTo("body")
        @preview.attr("angular-mv-dragger-preview", true)
        [x, y] = @previewOffset(event)
        event.dataTransfer.setDragImage(@preview[0], x, y)
        $timeout( =>
          @preview.hide()
        )

      switchWith: (elem, list) ->
        @list = list
        isLast = elem.index() == elem.parent().children().length - 1
        if isLast or elem.prev().is(@dragged.elem)
          @dragged.elem.insertAfter(elem)
        else @dragged.elem.insertBefore(elem)
        if @list != @dragged.list and @onLeaveList? then @onLeaveList(true)
        @switching = true

      leaveListCb: (fn) -> @onLeaveList = fn

      insertInto: (elem, list) ->
        @list = list
        elem.prepend(@dragged.elem)
        @switching = true

      restorePosition: ()->
        if @switching then @switching = false
        else
          @list = null
          childs = @position.parent.children()
          if @position.index >= childs.length
            @position.parent.append(@dragged.elem)
          else @dragged.elem.insertBefore(childs[@position.index])
          if @list != @dragged.list and @onLeaveList?
            @onLeaveList(false)

      commit: (item) ->
        if !@list? then return
        dlist = @dragged.list
        dlist.splice(_.indexOf(dlist, @dragged.data), 1)
        index = @dragged.elem.index()
        @list.splice(index, 0, @dragged.data)
        @restorePosition()

      clean: ->
        @preview.remove()


    return {
      start: (dragged, event, mobile) ->
        if _controller? then this.stop()
        _controller = new MvController(dragged, event, mobile)

      get: -> _controller

      commit: ->
        if _controller? then _controller.commit()
        this.stop()

      stop: ->
        if _controller?
          _controller.clean()
          _controller = null
    }

])
