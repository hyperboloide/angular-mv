angular.module("angular-mv").factory("mvController", [
  "$timeout"
  "$rootScope"
  (
    $timeout
    $rootScope
  )->

    _controller = null


    class MvController

      constructor: (@dragged, event, @mobile = false, @vertical = true) ->
        @original =
          container: @dragged.container
          index: _.indexOf(@dragged.container.list, @dragged.data)
          height: @dragged.elem.outerHeight()
          whidth: @dragged.elem.outerWidth()
        if @mobile == false
          json = JSON.stringify(@dragged.data)
          event.dataTransfer.setData("application/json", json)
          @setDragPreview(event)
        @registerBody()
        @original.container.updated()

      registerBody: ->
        if @mobile == false
          $("body").on("dragover.angular-mv", (e) =>
            e = e.originalEvent
            if _.isFunction(e.preventDefault)? then e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            @restorePosition()
            false
          )
          $("body").on("drop.angular-mv", =>
            console.log "body drop"
            @clean()
          )

      unregisterBody: ->
        if @mobile == false
          $("body").off("dragover.angular-mv")
          $("body").off("drop.angular-mv")

      restorePosition: ->
        if @dragged.container != @original.container
          idx = _.indexOf(@dragged.container.list, @dragged.data)
          @dragged.container.list.splice(idx, 1)
          @dragged.container.updated()
        idx = _.indexOf(@original.container.list, @dragged.data)
        if idx != @original.index
            if idx >= 0 then @original.container.list.splice(idx, 1)
            @original.container.list.splice(@original.index, 0, @dragged.data)
            @dragged.container = @original.container
            @original.container.updated()

      previewOffset: (event) ->
        o = @dragged.elem.offset()
        @offset =
          x: event.pageX - o.left
          y: event.pageY - o.top

      createPreview: (event)->
        @preview = @dragged.elem.clone()
        @preview.width(@dragged.elem.width())
        @preview.appendTo("body")
        @preview.attr("angular-mv-dragger-preview", true)
        @previewOffset(event)

      setDragPreview: (event) ->
        @createPreview(event)
        event.dataTransfer.setDragImage(@preview[0], @offset.x, @offset.y)
        $timeout(=>
          @preview.hide()
        )

      # setTouchPreview: (event) ->
      #   touch = event.touches[0]
      #   @createPreview(touch)
      #   @preview.css("position", "relative")
      #   @preview.css("z-index", "9999")
      #   @preview.offset({
      #     top: touch.pageY - @offset.y
      #     left: touch.pageX - @offset.x})
      #   @intervalId = setInterval(@checkUnder, 50)

      # checkUnder: =>
      #   if !@lastTouchMove then return
      #   @preview.hide()
      #   el = $(document.elementFromPoint(@lastTouchMove.clientX, @lastTouchMove.clientY))
      #   if el.attr("mv-draggable") != "" and el.hasClass("mvPlaceholder") != ""
      #     @restorePosition()
      #
      #   # if @lastElem? and !el.is(@lastElem)
      #   #   if @lastElem.attr("mv-placeholder") == ""
      #   #     if @lastElem.parent().children().length < 2
      #   #       console.log "show"
      #   #       @lastElem.trigger("showplaceholder.angular-mv")
      #   #     else console.log @lastElem.parent().children()
      #   # @lastElem = el
      #
      #   el.trigger("move.angular-mv")
      #   @preview.show()

      # setLastTouchmove: (e) -> @lastTouchMove = e
      #
      canSwitch: (elem, event) ->
        if @vertical
          if elem.outerHeight() <= @original.height then return true
          return event.pageY - elem.offset().top <= @original.height
        return false

      moveAfter: (list, data) ->
        idx = _.indexOf(list, @dragged.data)
        if idx != -1 then list.splice(idx, 1)
        idx = _.indexOf(list, data)
        list.splice(idx + 1, 0, @dragged.data)

      moveBefore: (list, data) ->
        idx = _.indexOf(list, @dragged.data)
        if idx != -1 then list.splice(idx, 1)
        idx = _.indexOf(list, data)
        list.splice(idx, 0, @dragged.data)

      removeFrom: ->
        idx = _.indexOf(@dragged.container.list, @dragged.data)
        @dragged.container.list.splice(idx, 1)
        @dragged.container.updated()

      switchWith: (data, container, elem, event) ->
        if container != @dragged.container then @removeFrom()
        idxElem = _.indexOf(container.list, data)
        idxDrag = _.indexOf(container.list, @dragged.data)
        switch
          when idxDrag == -1
            @moveBefore(container.list, data)
          when idxElem == container.list.length - 1
            @moveAfter(container.list, data)
          when idxElem == idxDrag + 1
            @moveAfter(container.list, data)
          when @canSwitch(elem, event)
            @moveBefore(container.list, data)
        @dragged.container = container
        container.updated()

      insertInto: (container) ->
        @removeFrom()
        container.list.push(@dragged.data)
        @dragged.container = container
        container.updated()

      clean: ->
        @unregisterBody()
        _controller = null
        @dragged.container.updated()


    return {
      start: (dragged, event, mobile) ->
        if _controller? then this.stop()
        _controller = new MvController(dragged, event, mobile)

      get: -> _controller

      stop: -> if _controller? then _controller.clean()
    }

])
