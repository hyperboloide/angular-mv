angular.module("angular-mv", []);

angular.module("angular-mv").directive("mvContainer", [
  "mvController", "$timeout", "$rootScope", function(mvController, $timeout, $rootScope) {
    var l;
    l = function(scope, elem) {
      var MvItem, dragend, dragenter, dragleave, dragover, dragstart, drop, events, getEl, handle, hidePlaceholder, isEmpty, k, onLeaveList, placeholder, showPlaceholder, stopPropagation, v;
      placeholder = $(elem.parent().find("[mv-placeholder]")[0]);
      showPlaceholder = function() {
        if (!placeholder.length) {
          return;
        }
        if (!$.contains(placeholder, elem)) {
          elem.append(placeholder);
        }
        return placeholder.show();
      };
      hidePlaceholder = function() {
        if (placeholder.length) {
          return placeholder.hide();
        }
      };
      if (placeholder.length) {
        isEmpty = function() {
          return scope.list.length === 0;
        };
        scope.$watch(isEmpty, function(v) {
          if (v) {
            return showPlaceholder();
          } else {
            return hidePlaceholder();
          }
        });
      }
      MvItem = (function() {
        function MvItem(elem1, list, data) {
          this.elem = elem1;
          this.list = list;
          this.data = data;
        }

        return MvItem;

      })();
      getEl = function(e) {
        return angular.element(e.target);
      };
      stopPropagation = function(e) {
        e = e.originalEvent;
        if (e.stopPropagation != null) {
          e.stopPropagation();
        }
        return e;
      };
      handle = function(next) {
        return (function(_this) {
          return function(e) {
            return next(stopPropagation(e));
          };
        })(this);
      };
      onLeaveList = function(leave) {
        if (scope.list.length <= 1) {
          if (leave) {
            return showPlaceholder();
          } else {
            return hidePlaceholder();
          }
        }
      };
      dragstart = (function(_this) {
        return function(e) {
          var el, item;
          el = getEl(e);
          item = new MvItem(el, scope.list, scope.list[el.index()]);
          mvController.start(item, e, false);
          return mvController.get().leaveListCb(onLeaveList);
        };
      })(this);
      dragenter = function(e) {
        var ctrl, el;
        ctrl = mvController.get();
        if (ctrl == null) {
          return;
        }
        el = getEl(e);
        if ($.contains(el, ctrl.dragged.elem)) {
          return;
        }
        if (el.is(placeholder)) {
          ctrl.insertInto(elem, scope.list);
          return hidePlaceholder();
        } else {
          return ctrl.switchWith(el, scope.list);
        }
      };
      dragleave = function(e) {
        var ctrl, el;
        ctrl = mvController.get();
        if (ctrl == null) {
          return;
        }
        el = getEl(e);
        if ($.contains(el, ctrl.dragged.elem)) {
          return;
        }
        ctrl.restorePosition();
        if (placeholder && !el.is(placeholder)) {
          if (scope.list.length === 0) {
            return placeholder.show();
          }
        }
      };
      dragover = function(e) {
        if (_.isFunction(e.preventDefault) != null) {
          e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'all';
        return false;
      };
      dragend = (function(_this) {
        return function(e) {
          scope.mvSelected = null;
          if (mvController.get() != null) {
            mvController.stop();
          }
          return scope.$apply();
        };
      })(this);
      drop = (function(_this) {
        return function(e) {
          var apply;
          apply = scope.list !== mvController.get().dragged.list;
          mvController.commit();
          mvController.stop();
          if (apply) {
            return scope.$apply();
          }
        };
      })(this);
      events = {
        "dragstart": dragstart,
        "dragenter": dragenter,
        "dragleave": dragleave,
        "dragover": dragover,
        "dragend": dragend,
        "drop": drop
      };
      for (k in events) {
        v = events[k];
        elem.on(k + ".angular-mv", "[mv-draggable]", handle(v));
      }
      elem.on("dragenter", "[mv-placeholder]", handle(dragenter));
      elem.on("dragleave", "[mv-placeholder]", handle(dragleave));
      return scope.$on("$destroy", function() {
        for (k in events) {
          v = events[k];
          elem.off(k + ".angular-mv", "[mv-draggable]");
        }
        elem.off("dragenter", "[mv-placeholder]");
        return elem.off("dragleave", "[mv-placeholder]");
      });
    };
    return {
      link: l,
      restrict: "A",
      scope: {
        list: "=mvContainer"
      }
    };
  }
]);

angular.module("angular-mv").factory("mvController", [
  "$timeout", function($timeout) {
    var MvController, _controller;
    _controller = null;
    MvController = (function() {
      function MvController(dragged1, event, mobile1) {
        var json;
        this.dragged = dragged1;
        this.mobile = mobile1;
        this.position = {
          parent: this.dragged.elem.parent(),
          index: this.dragged.elem.index()
        };
        if (this.mobile === false) {
          json = JSON.stringify(this.dragged.data);
          event.dataTransfer.setData("application/json", json);
        }
        this.createPreview(event);
      }

      MvController.prototype.previewOffset = function(event) {
        var o;
        o = this.dragged.elem.offset();
        return this.offset = [event.pageX - o.left, event.pageY - o.top];
      };

      MvController.prototype.createPreview = function(event) {
        var ref, x, y;
        this.preview = this.dragged.elem.clone();
        this.preview.width(this.dragged.elem.width());
        this.preview.appendTo("body");
        this.preview.attr("angular-mv-dragger-preview", true);
        ref = this.previewOffset(event), x = ref[0], y = ref[1];
        event.dataTransfer.setDragImage(this.preview[0], x, y);
        return $timeout((function(_this) {
          return function() {
            return _this.preview.hide();
          };
        })(this));
      };

      MvController.prototype.switchWith = function(elem, list) {
        var isLast;
        this.list = list;
        isLast = elem.index() === elem.parent().children().length - 1;
        if (isLast || elem.prev().is(this.dragged.elem)) {
          this.dragged.elem.insertAfter(elem);
        } else {
          this.dragged.elem.insertBefore(elem);
        }
        if (this.list !== this.dragged.list && (this.onLeaveList != null)) {
          this.onLeaveList(true);
        }
        return this.switching = true;
      };

      MvController.prototype.leaveListCb = function(fn) {
        return this.onLeaveList = fn;
      };

      MvController.prototype.insertInto = function(elem, list) {
        this.list = list;
        elem.prepend(this.dragged.elem);
        return this.switching = true;
      };

      MvController.prototype.restorePosition = function() {
        var childs;
        if (this.switching) {
          return this.switching = false;
        } else {
          this.list = null;
          childs = this.position.parent.children();
          if (this.position.index >= childs.length) {
            this.position.parent.append(this.dragged.elem);
          } else {
            this.dragged.elem.insertBefore(childs[this.position.index]);
          }
          if (this.list !== this.dragged.list && (this.onLeaveList != null)) {
            return this.onLeaveList(false);
          }
        }
      };

      MvController.prototype.commit = function(item) {
        var dlist, index;
        if (this.list == null) {
          return;
        }
        dlist = this.dragged.list;
        dlist.splice(_.indexOf(dlist, this.dragged.data), 1);
        index = this.dragged.elem.index();
        this.list.splice(index, 0, this.dragged.data);
        return this.restorePosition();
      };

      MvController.prototype.clean = function() {
        return this.preview.remove();
      };

      return MvController;

    })();
    return {
      start: function(dragged, event, mobile) {
        if (_controller != null) {
          this.stop();
        }
        return _controller = new MvController(dragged, event, mobile);
      },
      get: function() {
        return _controller;
      },
      commit: function() {
        if (_controller != null) {
          _controller.commit();
        }
        return this.stop();
      },
      stop: function() {
        if (_controller != null) {
          _controller.clean();
          return _controller = null;
        }
      }
    };
  }
]);

angular.module("angular-mv").directive("mvDraggable", [
  function() {
    var l;
    l = function(scope, elem) {
      var dragend, dragstart, register;
      elem.attr("draggable", true);
      dragstart = function() {
        scope.mvDragged = true;
        return scope.$apply();
      };
      dragend = function() {
        scope.mvDragged = false;
        return scope.$apply();
      };
      register = function() {
        elem.off("dragstart.angular-mv").on("dragstart.angular-mv", dragstart);
        return elem.off("dragend.angular-mv").on("dragend.angular-mv", dragend);
      };
      scope.$watch(register);
      return scope.$on("$destroy", function() {
        elem.off("dragstart.angular-mv");
        return elem.off("dragend.angular-mv");
      });
    };
    return {
      link: l,
      restrict: "A"
    };
  }
]);
