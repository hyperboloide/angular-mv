angular.module("angular-mv", []);

angular.module("angular-mv").directive("mvContainer", [
  "mvController", "$timeout", "$rootScope", function(mvController, $timeout, $rootScope) {
    var l;
    l = function(scope, elem) {
      var dragend, dragenter, dragleave, dragover, dragstart, drop, events, getEl, handle, k, leave, move, stopPropagation, touchend, touchmove, touchstart, v;
      getEl = function(e) {
        return angular.element(e.target);
      };
      stopPropagation = function(e) {
        e = e.originalEvent != null ? e.originalEvent : e;
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
      dragstart = (function(_this) {
        return function(e) {
          var el, item;
          el = getEl(e);
          item = {
            elem: el,
            list: scope.list,
            data: scope.list[el.index()]
          };
          return mvController.start(item, e, false);
        };
      })(this);
      touchstart = (function(_this) {
        return function(e) {
          var el, item;
          el = getEl(e);
          item = {
            elem: el,
            list: scope.list,
            data: scope.list[el.index()]
          };
          return mvController.start(item, e, true);
        };
      })(this);
      touchmove = (function(_this) {
        return function(e) {
          var ctrl, offset, touch;
          if (_.isFunction(e.preventDefault) != null) {
            e.preventDefault();
          }
          touch = e.targetTouches[0];
          ctrl = mvController.get();
          offset = ctrl.offset;
          ctrl.preview.offset({
            top: touch.pageY - offset.y,
            left: touch.pageX - offset.x
          });
          return ctrl.setLastTouchmove(touch);
        };
      })(this);
      dragenter = (function(_this) {
        return function(e) {
          var ctrl, el;
          ctrl = mvController.get();
          if (ctrl == null) {
            return;
          }
          el = getEl(e);
          if ($.contains(el, ctrl.preview)) {
            return;
          }
          if (el.hasClass("mvPlaceholder")) {
            return ctrl.insertInto(elem, scope.list);
          } else {
            return ctrl.switchWith(el, scope.list, e);
          }
        };
      })(this);
      dragleave = function(e) {
        return getEl(e).trigger("leave.angular-mv");
      };
      leave = (function(_this) {
        return function(e) {
          var ctrl, el;
          ctrl = mvController.get();
          if (ctrl == null) {
            return;
          }
          el = getEl(e);
          if ($.contains(el, ctrl.preview)) {
            return;
          }
          return ctrl.restorePosition(ctrl.preview);
        };
      })(this);
      dragover = (function(_this) {
        return function(e) {
          var ctrl, el;
          if (_.isFunction(e.preventDefault) != null) {
            e.preventDefault();
          }
          e.dataTransfer.dropEffect = 'move';
          ctrl = mvController.get();
          el = getEl(e);
          if (!el.is(ctrl.preview)) {
            ctrl.switchWith(el, scope.list, e);
          }
          return false;
        };
      })(this);
      move = (function(_this) {
        return function(e) {
          var ctrl, el;
          ctrl = mvController.get();
          if (ctrl == null) {
            return;
          }
          el = getEl(e);
          if ($.contains(el, ctrl.preview)) {
            return;
          }
          if (el.hasClass("mvPlaceholder")) {
            return ctrl.insertInto(elem, scope.list);
          } else {
            return ctrl.switchWith(el, scope.list, ctrl.lastTouchMove);
          }
        };
      })(this);
      dragend = (function(_this) {
        return function(e) {
          var ctrl;
          console.log("dragend");
          ctrl = mvController.get();
          if (ctrl != null) {
            console.log("restore");
            mvController.stop();
          }
          return scope.$apply();
        };
      })(this);
      touchend = function(e) {
        mvController.commit();
        return $timeout(function() {
          return scope.$apply();
        });
      };
      drop = (function(_this) {
        return function(e) {
          console.log("drop");
          mvController.commit();
          return scope.$apply();
        };
      })(this);
      events = {
        "dragstart": dragstart,
        "touchstart": touchstart,
        "touchmove": touchmove,
        "dragenter": dragenter,
        "move": move,
        "dragleave": dragleave,
        "leave": leave,
        "dragover": dragover,
        "dragend": dragend,
        "touchend": touchend,
        "drop": drop
      };
      for (k in events) {
        v = events[k];
        elem.on(k + ".angular-mv", "[mv-draggable]", handle(v));
      }
      elem.on("dragenter.angular-mv", ".mvPlaceholder", handle(dragenter));
      elem.on("move.angular-mv", ".mvPlaceholder", handle(move));
      elem.on("dragleave.angular-mv", ".mvPlaceholder", handle(dragleave));
      elem.on("leave.angular-mv", ".mvPlaceholder", handle(leave));
      return scope.$on("$destroy", function() {
        console.log("destroy container");
        for (k in events) {
          v = events[k];
          elem.off(k + ".angular-mv", "[mv-draggable]");
        }
        elem.off("dragenter.angular-mv", ".mvPlaceholder");
        elem.off("leave.angular-mv", ".mvPlaceholder");
        elem.off("dragleave.angular-mv", ".mvPlaceholder");
        return elem.off("leave.angular-mv", ".mvPlaceholder");
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
  "$timeout", "$rootScope", function($timeout, $rootScope) {
    var MvController, _controller;
    _controller = null;
    MvController = (function() {
      function MvController(dragged1, event, mobile1, vertical) {
        var json;
        this.dragged = dragged1;
        this.mobile = mobile1 != null ? mobile1 : false;
        this.vertical = vertical != null ? vertical : true;
        this.original = {
          container: this.dragged.container,
          index: _.indexOf(this.dragged.container.list, this.dragged.data),
          height: this.dragged.elem.outerHeight(),
          whidth: this.dragged.elem.outerWidth()
        };
        if (this.mobile === false) {
          json = JSON.stringify(this.dragged.data);
          event.dataTransfer.setData("application/json", json);
          this.setDragPreview(event);
        }
        this.registerBody();
        this.original.container.updated();
      }

      MvController.prototype.registerBody = function() {
        if (this.mobile === false) {
          $("body").on("dragover.angular-mv", (function(_this) {
            return function(e) {
              e = e.originalEvent;
              if (_.isFunction(e.preventDefault) != null) {
                e.preventDefault();
              }
              e.dataTransfer.dropEffect = 'move';
              _this.restorePosition();
              return false;
            };
          })(this));
          return $("body").on("drop.angular-mv", (function(_this) {
            return function() {
              return _this.clean();
            };
          })(this));
        }
      };

      MvController.prototype.unregisterBody = function() {
        if (this.mobile === false) {
          $("body").off("dragover.angular-mv");
          return $("body").off("drop.angular-mv");
        }
      };

      MvController.prototype.restorePosition = function() {
        var idx;
        if (this.dragged.container !== this.original.container) {
          idx = _.indexOf(this.dragged.container.list, this.dragged.data);
          this.dragged.container.list.splice(idx, 1);
          this.dragged.container.updated();
        }
        idx = _.indexOf(this.original.container.list, this.dragged.data);
        if (idx !== this.original.index) {
          if (idx >= 0) {
            this.original.container.list.splice(idx, 1);
          }
          this.original.container.list.splice(this.original.index, 0, this.dragged.data);
          this.dragged.container = this.original.container;
          return this.original.container.updated();
        }
      };

      MvController.prototype.previewOffset = function(event) {
        var o;
        o = this.dragged.elem.offset();
        return this.offset = {
          x: event.pageX - o.left,
          y: event.pageY - o.top
        };
      };

      MvController.prototype.createPreview = function(event) {
        this.preview = this.dragged.elem.clone();
        this.preview.width(this.dragged.elem.width());
        this.preview.appendTo("body");
        this.preview.attr("angular-mv-dragger-preview", true);
        return this.previewOffset(event);
      };

      MvController.prototype.setDragPreview = function(event) {
        this.createPreview(event);
        event.dataTransfer.setDragImage(this.preview[0], this.offset.x, this.offset.y);
        return $timeout((function(_this) {
          return function() {
            return _this.preview.hide();
          };
        })(this));
      };

      MvController.prototype.canSwitch = function(elem, event) {
        if (this.vertical) {
          if (elem.outerHeight() <= this.original.height) {
            return true;
          }
          return event.pageY - elem.offset().top <= this.original.height;
        } else {
          if (elem.outerWidth() <= this.original.width) {
            return true;
          }
          return event.pageX - elem.offset().left <= this.original.width;
        }
        return false;
      };

      MvController.prototype.moveAfter = function(list, data) {
        var idx;
        idx = _.indexOf(list, this.dragged.data);
        if (idx !== -1) {
          list.splice(idx, 1);
        }
        idx = _.indexOf(list, data);
        return list.splice(idx + 1, 0, this.dragged.data);
      };

      MvController.prototype.moveBefore = function(list, data) {
        var idx;
        idx = _.indexOf(list, this.dragged.data);
        if (idx !== -1) {
          list.splice(idx, 1);
        }
        idx = _.indexOf(list, data);
        return list.splice(idx, 0, this.dragged.data);
      };

      MvController.prototype.removeFrom = function() {
        var idx;
        idx = _.indexOf(this.dragged.container.list, this.dragged.data);
        this.dragged.container.list.splice(idx, 1);
        return this.dragged.container.updated();
      };

      MvController.prototype.switchWith = function(data, container, elem, event) {
        var idxDrag, idxElem;
        if (container !== this.dragged.container) {
          this.removeFrom();
        }
        idxElem = _.indexOf(container.list, data);
        idxDrag = _.indexOf(container.list, this.dragged.data);
        switch (false) {
          case idxDrag !== -1:
            this.moveBefore(container.list, data);
            break;
          case idxElem !== container.list.length - 1:
            this.moveAfter(container.list, data);
            break;
          case idxElem !== idxDrag + 1:
            this.moveAfter(container.list, data);
            break;
          case !this.canSwitch(elem, event):
            this.moveBefore(container.list, data);
        }
        this.dragged.container = container;
        return container.updated();
      };

      MvController.prototype.insertInto = function(container) {
        if (_.includes(container.list, this.dragged.data)) {
          return;
        }
        this.removeFrom();
        container.list.push(this.dragged.data);
        this.dragged.container = container;
        return container.updated();
      };

      MvController.prototype.clean = function() {
        this.unregisterBody();
        _controller = null;
        return this.dragged.container.updated();
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
      stop: function() {
        if (_controller != null) {
          return _controller.clean();
        }
      }
    };
  }
]);

angular.module("angular-mv").directive("mvDraggable", [
  "$timeout", "mvController", function($timeout, mvController) {
    var l;
    l = function(scope, elem) {
      return elem.attr("draggable", true);
    };
    return {
      link: l,
      restrict: "A"
    };
  }
]);

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

angular.module("angular-mv").factory("mvList", [
  "mvController", function(mvController) {
    var MvList;
    return MvList = (function() {
      var getEl, stopPropagation;

      function MvList(list1, elem, vertical) {
        this.list = list1;
        this.elem = elem;
        this.vertical = vertical != null ? vertical : true;
        this.drop = bind(this.drop, this);
        this.dragover = bind(this.dragover, this);
        this.dragenter = bind(this.dragenter, this);
        this.dragstart = bind(this.dragstart, this);
        this.destroy = bind(this.destroy, this);
        this.setup();
      }

      getEl = function(e) {
        return angular.element(e.target);
      };

      stopPropagation = function(e) {
        e = e.originalEvent != null ? e.originalEvent : e;
        if (e.stopPropagation != null) {
          e.stopPropagation();
        }
        return e;
      };

      MvList.prototype.handle = function(next) {
        return (function(_this) {
          return function(e) {
            var ctrl;
            ctrl = mvController.get();
            if ((ctrl == null) || !_this.accepts(ctrl.dragged.data, _this.list)) {
              return;
            }
            return next(stopPropagation(e));
          };
        })(this);
      };

      MvList.prototype.setup = function() {
        this.elem.on("dragstart.angular-mv", "[mv-draggable]", this.dragstart);
        this.elem.on("dragenter.angular-mv", "[mv-draggable]", this.handle(this.dragenter));
        this.elem.on("dragenter.angular-mv", ".mvPlaceholder", this.handle(this.dragenter));
        this.elem.on("dragover.angular-mv", this.handle(function() {}));
        this.elem.on("dragover.angular-mv", "[mv-draggable]", this.handle(this.dragover));
        return this.elem.on("drop.angular-mv", "[mv-draggable]", this.handle(this.drop));
      };

      MvList.prototype.destroy = function() {
        this.elem.off("dragstart.angular-mv", "[mv-draggable]");
        this.elem.off("dragenter.angular-mv", "[mv-draggable]");
        this.elem.on("dragenter.angular-mv", ".mvPlaceholder");
        this.elem.off("dragover.angular-mv", "[mv-draggable]");
        return this.elem.off("drop.angular-mv", "[mv-draggable]");
      };

      MvList.prototype.draggedData = function() {
        if (mvController.get() != null) {
          return mvController.get().dragged.data;
        }
      };

      MvList.prototype.dragstart = function(e) {
        var dg, el;
        e = stopPropagation(e);
        el = getEl(e);
        dg = {
          data: this.list[el.index()],
          elem: el,
          container: this
        };
        return mvController.start(dg, e, false, this.vertical);
      };

      MvList.prototype.dragenter = function(e) {
        var ctrl, data, el;
        ctrl = mvController.get();
        if (ctrl == null) {
          return;
        }
        el = getEl(e).closest(".mvPlaceholder, [mv-draggable]", this.elem);
        if (el.hasClass("mvPlaceholder")) {
          return ctrl.insertInto(this);
        } else if ((el.attr("mv-draggable") != null) && el.parent().is(this.elem)) {
          data = this.list[el.index()];
          if (ctrl.dragged.data === data) {
            return;
          }
          return ctrl.switchWith(data, this, el, e);
        }
      };

      MvList.prototype.dragover = function(e) {
        var ctrl, el;
        if (_.isFunction(e.preventDefault) != null) {
          e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        ctrl = mvController.get();
        el = getEl(e);
        el = el.closest("[mv-draggable], .mvSelector", this.elem);
        if (el.parent().is(this.elem)) {
          if (el.hasClass("mvPlaceholder")) {
            ctrl.insertInto(this);
          } else if (el.index() !== _.indexOf(this.list, ctrl.dragged.data)) {
            ctrl.switchWith(this.list[el.index()], this, el, e);
          }
        }
        return false;
      };

      MvList.prototype.drop = function(e) {
        return mvController.stop();
      };

      MvList.prototype.accepts = function(data, list) {
        return true;
      };

      MvList.prototype.updated = function() {};

      return MvList;

    })();
  }
]);
