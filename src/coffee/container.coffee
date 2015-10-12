angular.module("angular-mv").directive("mvContainer", [
  "mvList"
  "mvController"
  "$timeout"
  "$rootScope"
  (
    MvList
    mvController
    $timeout
    $rootScope
  ) ->

    l = (scope, elem) ->

      placeholder = $(elem.parent().find("[mv-placeholder]")[0])

      showPlaceholder = ->
        if !placeholder.length then return
        if !$.contains(placeholder, elem) then elem.append(placeholder)
        placeholder.show()

      hidePlaceholder = -> if placeholder.length then placeholder.hide()

      if placeholder.length
        isEmpty = -> scope.list.length == 0
        scope.$watch(isEmpty, (v) ->
          if v then showPlaceholder() else hidePlaceholder()
        )

      class MvItem
        constructor: (@elem, @list, @data) ->

      getEl = (e) -> angular.element(e.target)

      stopPropagation = (e) ->
        e = e.originalEvent
        if e.stopPropagation? then e.stopPropagation()
        e

      handle = (next) ->
        (e) => next(stopPropagation(e))

      onLeaveList = (leave)->
        if scope.list.length <= 1
          if leave then showPlaceholder()
          else hidePlaceholder()

      dragstart = (e) =>
        el = getEl(e)
        item = new MvItem(el, scope.list, scope.list[el.index()])
        mvController.start(item, e, false)
        mvController.get().leaveListCb(onLeaveList)

      dragenter = (e) ->
        ctrl = mvController.get()
        if !ctrl? then return
        el = getEl(e)
        if $.contains(el, ctrl.dragged.elem) then return
        if el.is(placeholder)
          ctrl.insertInto(elem, scope.list)
          hidePlaceholder()
        else
          ctrl.switchWith(el, scope.list)

      dragleave = (e) ->
        ctrl = mvController.get()
        if !ctrl? then return
        el = getEl(e)
        if $.contains(el, ctrl.dragged.elem) then return
        ctrl.restorePosition()
        if placeholder and !el.is(placeholder)
          if scope.list.length == 0 then placeholder.show()

      dragover = (e) ->
        if _.isFunction(e.preventDefault)?
          e.preventDefault()
        e.dataTransfer.dropEffect = 'all'
        false

      dragend = (e) =>
        scope.mvSelected = null
        if mvController.get()? then mvController.stop()
        scope.$apply()


      drop = (e) =>
        apply = scope.list != mvController.get().dragged.list
        mvController.commit()
        mvController.stop()
        if apply then scope.$apply()

      events =
        "dragstart": dragstart
        "dragenter": dragenter
        "dragleave": dragleave
        "dragover": dragover
        "dragend": dragend
        "drop": drop

      for k, v of events
        elem.on("#{k}.angular-mv", "[mv-draggable]", handle(v))

      elem.on("dragenter", "[mv-placeholder]", handle(dragenter))
      elem.on("dragleave", "[mv-placeholder]", handle(dragleave))

      scope.$on("$destroy", ->
        for k, v of events
          elem.off("#{k}.angular-mv", "[mv-draggable]")
        elem.off("dragenter", "[mv-placeholder]")
        elem.off("dragleave", "[mv-placeholder]")
      )

    return {
      link: l
      restrict: "A"
      scope:
        list: "=mvContainer"
    }
])
