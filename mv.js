angular.module("angular-mv", []);

angular.module("angular-mv").directive("mvContainer", [
  "mvList", "mvController", "$timeout", "$rootScope", function(MvList, mvController, $timeout, $rootScope) {
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

angular.module("angular-mv").factory("mvDragger", [
  "$timeout", "$rootScope", function($timeout, $rootScope) {
    var MvDragger, _dragger;
    _dragger = null;
    MvDragger = (function() {
      function MvDragger(dragged, event, mobile1) {
        var json;
        this.dragged = dragged;
        this.mobile = mobile1 != null ? mobile1 : false;
        console.log(event);
        this.switching = false;
        this.originalPosition = {
          index: _.indexOf(this.dragged.list, this.dragged.data),
          list: this.dragged.list
        };
        this.dragged.status = "dragged";
        this.assignBodyEvents();
        if (this.mobile === false) {
          json = JSON.stringify(this.dragged.data);
          event.dataTransfer.setData("application/json", json);
          this.createPreview(event);
        }
      }

      MvDragger.prototype.assignBodyEvents = function() {
        if (this.mobile === false) {
          console.log("set body");
          return $("body").on({
            "dragend": function() {
              return console.log("++++++++ dragend +++++++");
            },
            "dragstop": function() {
              return console.log("++++++++ dragstop +++++++");
            },
            "drop": function() {
              return console.log("++++++++ drop +++++++");
            },
            "mouseup": function() {
              return console.log("++++++++mouse up+++++++");
            },
            "mousedown": function() {
              return console.log("++++++++mouse down+++++++");
            }
          });
        }
      };

      MvDragger.prototype.restorePosition = function() {
        if (_.indexOf(this.originalPosition.list, this.dragged.data) === -1) {
          return this.originalPosition.list.splice(this.originalPosition.index, 0, this.dragged.data);
        }
      };

      MvDragger.prototype.previewOffset = function(event) {
        var o;
        o = this.dragged.elem.offset();
        return this.offset = [event.pageX - o.left, event.pageY - o.top];
      };

      MvDragger.prototype.createPreview = function(event) {
        var preview, ref, x, y;
        preview = this.dragged.elem.clone();
        preview.width(this.dragged.elem.width());
        preview.appendTo('body');
        preview.attr("angular-mv-dragger-preview", true);
        ref = this.previewOffset(event, this.dragged.elem), x = ref[0], y = ref[1];
        event.dataTransfer.setDragImage(preview[0], x, y);
        return $timeout(function() {
          preview.hide();
          return $rootScope.$apply();
        });
      };

      MvDragger.prototype.clean = function() {
        this.dragged.status = "standby";
        return this.body().find("[angular-mv-dragger-preview]").remove();
      };

      MvDragger.prototype.body = function() {
        return angular.element(document).find("body");
      };

      MvDragger.prototype.switchWith = function(item) {
        var draggedIdx, itemIdx;
        this.switching = true;
        if (this.dragged.list !== item.list) {
          this.remove();
          itemIdx = _.indexOf(item.list, item.data);
          if (itemIdx === 0) {
            item.list.splice(itemIdx, 0, this.dragged.data);
          } else {
            item.list.splice(itemIdx, 0, this.dragged.data);
          }
        } else {
          draggedIdx = _.indexOf(item.list, this.dragged.data);
          itemIdx = _.indexOf(item.list, item.data);
          this.remove();
          if (itemIdx <= draggedIdx) {
            item.list.splice(_.indexOf(item.list, item.data), 0, this.dragged.data);
          } else {
            item.list.splice(_.indexOf(item.list, item.data) + 1, 0, this.dragged.data);
          }
        }
        return this.dragged.list = item.list;
      };

      MvDragger.prototype.remove = function() {
        var idx;
        if (this.dragged.list != null) {
          idx = _.indexOf(this.dragged.list, this.dragged.data);
          if (idx !== -1) {
            this.dragged.list.splice(idx, 1);
          }
          return this.dragged.list = null;
        }
      };

      MvDragger.prototype.insert = function(list) {
        this.remove();
        list.push(this.dragged.data);
        return this.dragged.list = list;
      };

      return MvDragger;

    })();
    return {
      started: function() {
        return _dragger != null;
      },
      start: function(item, event, mobile) {
        console.log("start");
        if (_dragger != null) {
          _dragger.clean();
        }
        _dragger = new MvDragger(item, event, mobile);
        return $rootScope.$broadcast("angular-mv.dragstart");
      },
      restart: function(item) {
        if (_dragger) {
          return _dragger.item = item;
        }
      },
      dragged: function() {
        if (_dragger != null) {
          return _dragger.dragged;
        }
      },
      cursorOffset: function() {
        if (_dragger != null) {
          return _dragger.offset;
        }
      },
      switchWith: function(item) {
        if (_dragger != null) {
          _dragger.switchWith(item);
          return $rootScope.$apply();
        }
      },
      switching: function(v) {
        if (_dragger != null) {
          if (v != null) {
            return _dragger.switching = v;
          } else {
            return _dragger.switching;
          }
        }
      },
      remove: function() {
        if (_dragger != null) {
          _dragger.remove();
          return $rootScope.$apply();
        }
      },
      insert: function(list) {
        if (_dragger != null) {
          _dragger.insert(list);
          return $rootScope.$apply();
        }
      },
      restorePosition: function() {
        if (_dragger != null) {
          _dragger.restorePosition();
        }
        return $rootScope.$apply();
      },
      finish: function() {
        if (_dragger != null) {
          _dragger.clean();
        }
        _dragger = null;
        $rootScope.$broadcast("angular-mv.dragend");
        $rootScope.$apply();
        console.log("finish");
        return console.log(this.started());
      }
    };
  }
]);

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

angular.module("angular-mv").factory("mvElem", [
  "mvController", function(mvController) {
    var MvElem;
    return MvElem = (function() {
      function MvElem(data, elem1, orientation) {
        this.data = data;
        this.elem = elem1;
        this.orientation = orientation != null ? orientation : "vertical";
        this.drop = bind(this.drop, this);
        this.dragover = bind(this.dragover, this);
        this.dragleave = bind(this.dragleave, this);
        this.dragenter = bind(this.dragenter, this);
        this.dragend = bind(this.dragend, this);
        this.touchstart = bind(this.touchstart, this);
        this.dragstart = bind(this.dragstart, this);
        this.cleanup = bind(this.cleanup, this);
        this.setup = bind(this.setup, this);
        this.status = "standby";
      }

      MvElem.prototype.setup = function() {
        this.deep = 0;
        if ((this.elem.attr("draggable") == null) || this.elem.attr("draggable")) {
          this.elem.attr("draggable", true);
        }
        this.cleanup();
        return this.elem.on({
          "dragstart.angular-mv": this.handle(this.dragstart),
          "touchstart.angular-mv": this.handle(this.touchstart),
          "dragend.angular-mv": this.handle(this.dragend),
          "dragover.angular-mv": this.filter(this.dragover),
          "dragenter.angular-mv": this.filter(this.dragenter),
          "dragleave.angular-mv": this.filter(this.dragleave),
          "drop.angular-mv": this.filter(this.drop),
          "$destroy.angular-mv": (function(_this) {
            return function() {
              return _this.handle(_this.cleanup);
            };
          })(this)
        });
      };

      MvElem.prototype.cleanup = function() {
        this.elem.off("dragstart.angular-mv");
        this.elem.off("touchstart.angular-mv");
        this.elem.off("dragend.angular-mv");
        this.elem.off("dragover.angular-mv");
        this.elem.off("dragenter.angular-mv");
        this.elem.off("dragleave.angular-mv");
        return this.elem.off("drop.angular-mv");
      };

      MvElem.prototype.dragstart = function(e) {
        this.dropped = false;
        return mvController.start(this, e, false);
      };

      MvElem.prototype.touchstart = function(e) {
        return mvController.start(this, e, true);
      };

      MvElem.prototype.dragend = function(e) {
        if (this.dropped) {
          return;
        }
        console.log("end start");
        if (mvController.get() != null) {
          mvController.stop();
        }
        return console.log("end end");
      };

      MvElem.prototype.dragenter = function(e) {
        var ctrl;
        this.deep += 1;
        ctrl = mvController.get();
        if (ctrl == null) {
          return;
        }
        return mvController.get().switchWith(this);
      };

      MvElem.prototype.dragleave = function(e) {
        var ctrl;
        this.deep -= 1;
        ctrl = mvController.get();
        if (this.deep <= 0 && this === ctrl.dragged) {
          return ctrl.restorePosition();
        }
      };

      MvElem.prototype.dragover = function(e) {
        if (_.isFunction(e.preventDefault) != null) {
          e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'all';
        return false;
      };

      MvElem.prototype.drop = function(e) {
        this.dropped = true;
        console.log("drop start");
        mvController.commit();
        return console.log("drop end");
      };

      MvElem.prototype.accepts = function(elem) {
        return true;
      };

      MvElem.prototype.filter = function(next) {
        return (function(_this) {
          return function(e) {
            if ((mvController.get() == null) || !_this.accepts()) {
              return;
            }
            return next(_this.stopPropagation(e));
          };
        })(this);
      };

      MvElem.prototype.handle = function(next) {
        return (function(_this) {
          return function(e) {
            return next(_this.stopPropagation(e));
          };
        })(this);
      };

      MvElem.prototype.stopPropagation = function(e) {
        e = e.originalEvent;
        if (e.stopPropagation != null) {
          e.stopPropagation();
        }
        return e;
      };

      return MvElem;

    })();
  }
]);

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

angular.module("angular-mv").factory("mvItem", [
  "mvDragger", function(mvDragger) {
    var MvItem;
    return MvItem = (function() {
      function MvItem(data, elem1, orientation) {
        this.data = data;
        this.elem = elem1;
        this.orientation = orientation != null ? orientation : "vertical";
        this.drop = bind(this.drop, this);
        this.dragover = bind(this.dragover, this);
        this.dragleave = bind(this.dragleave, this);
        this.dragenter = bind(this.dragenter, this);
        this.dragend = bind(this.dragend, this);
        this.touchstart = bind(this.touchstart, this);
        this.dragstart = bind(this.dragstart, this);
        this.cleanup = bind(this.cleanup, this);
        this.setup = bind(this.setup, this);
        this.status = "standby";
        this.setup();
      }

      MvItem.prototype.setup = function() {
        this.deep = 0;
        if ((this.elem.attr("draggable") == null) || this.elem.attr("draggable")) {
          this.elem.attr("draggable", true);
        }
        return this.elem.on({
          "dragstart.angular-mv": this.handle(this.dragstart),
          "touchstart.angular-mv": this.handle(this.touchstart),
          "dragover.angular-mv": this.filter(this.dragover),
          "dragenter.angular-mv": this.filter(this.dragenter),
          "dragleave.angular-mv": this.filter(this.dragleave),
          "drop.angular-mv": this.filter(this.drop),
          "$destroy.angular-mv": (function(_this) {
            return function() {
              console.log("destroy");
              return _this.cleanup();
            };
          })(this)
        });
      };

      MvItem.prototype.cleanup = function() {
        console.log("cleanup");
        this.elem.off("dragstart.angular-mv");
        this.elem.off("touchstart.angular-mv");
        this.elem.off("dragover.angular-mv");
        this.elem.off("dragenter.angular-mv");
        this.elem.off("dragleave.angular-mv");
        return this.elem.off("drop.angular-mv");
      };

      MvItem.prototype.dragstart = function(e) {
        return mvDragger.start(this, e, false);
      };

      MvItem.prototype.touchstart = function(e) {
        return mvDragger.start(this, e, true);
      };

      MvItem.prototype.dragend = function(e) {
        console.log("dragend");
        this.status = "standby";
        if (mvDragger.started()) {
          console.log("restore");
          mvDragger.restorePosition();
          return mvDragger.finish();
        }
      };

      MvItem.prototype.isOnSwitchPosition = function(e) {
        var height;
        switch (this.orientation) {
          case "vertical":
            height = mvDragger.dragged().elem.height();
            if (height >= this.elem.height()) {
              return true;
            }
            return e.pageY - this.elem.offset().top <= height;
        }
        return false;
      };

      MvItem.prototype.dragenter = function(e) {
        var dragged;
        this.deep += 1;
        dragged = mvDragger.dragged();
        if (mvDragger.switching()) {
          return mvDragger.switching(false);
        } else if ((dragged == null) || dragged !== this) {
          return mvDragger.switchWith(this);
        }
      };

      MvItem.prototype.dragleave = function(e) {
        this.deep -= 1;
        if (this.deep <= 0 && this === mvDragger.dragged()) {
          if (!mvDragger.switching()) {
            mvDragger.remove();
            return mvDragger.restorePosition();
          }
        }
      };

      MvItem.prototype.dragover = function(e) {
        if (_.isFunction(e.preventDefault) != null) {
          e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'all';
        return false;
      };

      MvItem.prototype.drop = function(e) {
        console.log("drop");
        return mvDragger.finish();
      };

      MvItem.prototype.restoreOriginalPosition = function() {
        var childs, currentIndex, next;
        childs = this.originalPosition.parent.children();
        switch (false) {
          case childs.length !== 0:
            return this.originalPosition.parent.append(this.elem);
          case !(childs.length <= this.originalPosition.index):
            return $(_.last(childs)).after(this.elem);
          case this.originalPosition.index !== 0:
            return $(childs[0]).before(this.elem);
          default:
            currentIndex = this.elem.index();
            next = $(childs[this.originalPosition.index]);
            if (currentIndex > this.originalPosition.index) {
              next = $(childs[this.originalPosition.index - 1]);
            }
            return next.after(this.elem);
        }
      };

      MvItem.prototype.accepts = function(elem) {
        return true;
      };

      MvItem.prototype.filter = function(next) {
        return (function(_this) {
          return function(e) {
            if ((mvDragger.started() == null) || !_this.accepts()) {
              return;
            }
            return next(_this.stopPropagation(e));
          };
        })(this);
      };

      MvItem.prototype.handle = function(next) {
        return (function(_this) {
          return function(e) {
            return next(_this.stopPropagation(e));
          };
        })(this);
      };

      MvItem.prototype.stopPropagation = function(e) {
        e = e.originalEvent;
        if (e.stopPropagation != null) {
          e.stopPropagation();
        }
        return e;
      };

      return MvItem;

    })();
  }
]);

angular.module("angular-mv").factory("mvList", [
  "mvDragger", function(mvDragger) {
    var MvList;
    return MvList = (function() {
      function MvList(list) {
        this.list = list;
      }

      MvList.prototype.accepts = function() {
        return true;
      };

      MvList.prototype.transform = function(elem) {
        return elem;
      };

      return MvList;

    })();
  }
]);
