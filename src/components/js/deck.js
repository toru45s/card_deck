'use strict';

var Deck = (function () {
  'use strict';

  var ticking;
  var animations = [];

  document.oncontextmenu = (e) => {e.preventDefault(); return false;}; // disable browser context menu on right click

  function animationFrames(delay, duration) {
    var now = Date.now();

    // calculate animation start/end times
    var start = now + delay;
    var end = start + duration;

    var animation = {
      start: start,
      end: end
    };

    // add animation
    animations.push(animation);

    if (!ticking) {
      // start ticking
      ticking = true;
      requestAnimationFrame(tick);
    }
    var self = {
      start: function start(cb) {
        // add start callback (just one)
        animation.startcb = cb;
        return self;
      },
      progress: function progress(cb) {
        // add progress callback (just one)
        animation.progresscb = cb;
        return self;
      },
      end: function end(cb) {
        // add end callback (just one)
        animation.endcb = cb;
        return self;
      }
    };
    return self;
  }

  function tick() {
    var now = Date.now();

    if (!animations.length) {
      // stop ticking
      ticking = false;
      return;
    }

    for (var i = 0, animation; i < animations.length; i++) {
      animation = animations[i];
      if (now < animation.start) {
        // animation not yet started..
        continue;
      }
      if (!animation.started) {
        // animation starts
        animation.started = true;
        animation.startcb && animation.startcb();
      }
      // animation progress
      var t = (now - animation.start) / (animation.end - animation.start);
      animation.progresscb && animation.progresscb(t < 1 ? t : 1);
      if (now > animation.end) {
        // animation ended
        animation.endcb && animation.endcb();
        animations.splice(i--, 1);
        continue;
      }
    }
    requestAnimationFrame(tick);
  }

  // fallback
  window.requestAnimationFrame || (window.requestAnimationFrame = function (cb) {
    setTimeout(cb, 0);
  });

  var style = document.createElement('p').style;
  var memoized = {};

  function prefix(param) {
    if (typeof memoized[param] !== 'undefined') {
      return memoized[param];
    }

    if (typeof style[param] !== 'undefined') {
      memoized[param] = param;
      return param;
    }

    var camelCase = param[0].toUpperCase() + param.slice(1);
    var prefixes = ['webkit', 'moz', 'Moz', 'ms', 'o'];
    var test;

    for (var i = 0, len = prefixes.length; i < len; i++) {
      test = prefixes[i] + camelCase;
      if (typeof style[test] !== 'undefined') {
        memoized[param] = test;
        return test;
      }
    }
  }

  var has3d;

  function translate(a, b, c) {
    typeof has3d !== 'undefined' || (has3d = check3d());

    c = c || 0;

    if (has3d) {
      return 'translate3d(' + a + ', ' + b + ', ' + c + ')';
    } else {
      return 'translate(' + a + ', ' + b + ')';
    }
  }

  function check3d() {
    // I admit, this line is stolen from the great Velocity.js!
    // http://julian.com/research/velocity/
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) {
      return false;
    }

    var transform = prefix('transform');
    var $p = document.createElement('p');

    document.body.appendChild($p);
    $p.style[transform] = 'translate3d(1px,1px,1px)';

    has3d = $p.style[transform];
    has3d = has3d != null && has3d.length && has3d !== 'none';

    document.body.removeChild($p);

    return has3d;
  }

  function createElement(type) {
    return document.createElement(type);
  }

  var maxZ = 52;

  function _card(i, card) {
    var transform = prefix('transform');

    // calculate rank/suit, etc..
    var rank = i % 13 + 1;
    var suit = i / 13 | 0;
    var z = (32 - i) / 6;

    // create elements
    var $el = createElement('div');
    var wrapper = createElement('div');
    wrapper.className = 'card_wrapper';
    $el.appendChild(wrapper);
    $el.setAttribute('data-id', card._id || card.id);
    var $face = createElement('div');
    var $back = createElement('div');
    const $backimg = createElement('img');
    $backimg.className = 'card_image';
    $backimg.setAttribute('src', card.back);

    $back.appendChild($backimg);

    // states
    var isDraggable = false;
    var isFlippable = false;

    // self = card
    var self = {
        id: (typeof card._id !== "undefined") ? card._id : card.id,
        i: i,
        rank: rank,
        suit: suit,
        pos: i,
        $el: $el,
        image: card.image,
        holding: (typeof card.holding !== "undefined") ? card.holding : false,
        mount: mount,
        unmount: unmount,
        setSide: setSide,
        flipper: flipper,
        syncZoom: syncZoom,
        move: move,
        hold: hold,
        form: card.form || "",
        deck_id: card.deck_id
    };

    var modules = Deck.modules;
    var module;

    // add classes
    $face.classList.add('face');
    $back.classList.add('back');

    // add default transform
      if (typeof card.x !== "undefined" && typeof card.y !== "undefined") {
          $el.style[transform] = translate(card.x + 'px', card.y + 'px');
      } else {
          $el.style[transform] = translate(-z + 'px', -z + 'px');
      }

    // add default values
    self.x = (typeof card.x !== "undefined") ? card.x : -z;
    self.y = (typeof card.y !== "undefined") ? card.y : -z;
    self.z = z;
    self.rot = 0;

    // set default side to back
    (typeof card.side !== "undefined") ? self.setSide(card.side) : self.setSide('back');

    // add drag/click listeners
    addListener($el, 'mousedown', onMousedown);
    addListener($el, 'touchstart', onMousedown);

    // load modules
    for (module in modules) {
      addModule(modules[module]);
    }

    self.animateTo = function (params) {
      var delay = params.delay;
      var duration = params.duration;
      var _params$x = params.x;
      var x = _params$x === undefined ? self.x : _params$x;
      var _params$y = params.y;
      var y = _params$y === undefined ? self.y : _params$y;
      var _params$rot = params.rot;
      var rot = _params$rot === undefined ? self.rot : _params$rot;
      var ease$$ = params.ease;
      var onStart = params.onStart;
      var onProgress = params.onProgress;
      var onComplete = params.onComplete;

      var startX, startY, startRot;
      var diffX, diffY, diffRot;

      animationFrames(delay, duration).start(function () {
        startX = self.x || 0;
        startY = self.y || 0;
        startRot = self.rot || 0;
        onStart && onStart();
      }).progress(function (t) {
        var et = ease[ease$$ || 'cubicInOut'](t);

        diffX = x - startX;
        diffY = y - startY;
        diffRot = rot - startRot;

        onProgress && onProgress(t, et);

        self.x = startX + diffX * et;
        self.y = startY + diffY * et;
        self.rot = startRot + diffRot * et;

        $el.style[transform] = translate(self.x + 'px', self.y + 'px') + (diffRot ? 'rotate(' + self.rot + 'deg)' : '');
      }).end(function () {
        onComplete && onComplete();
      });
    };

    // set rank & suit
    self.setRankSuit = function (rank, suit) {
      var suitName = SuitName(suit);
      $el.setAttribute('class', 'card ' + suitName + ' rank' + rank);
    };

    self.setRankSuit(rank, suit);
    $el.setAttribute('class', 'card');
    const image = document.createElement('img');
    image.className = 'card_image';
    image.setAttribute('src', card.image);
    wrapper.appendChild(image);

    self.enableDragging = function () {
      // this activates dragging
      if (isDraggable) {
        // already is draggable, do nothing
        return;
      }
      isDraggable = true;
      $el.style.cursor = 'move';
    };

    self.enableFlipping = function () {
      if (isFlippable) {
        // already is flippable, do nothing
        return;
      }
      isFlippable = true;
    };

    self.disableFlipping = function () {
      if (!isFlippable) {
        // already disabled flipping, do nothing
        return;
      }
      isFlippable = false;
    };

    self.disableDragging = function () {
      if (!isDraggable) {
        // already disabled dragging, do nothing
        return;
      }
      isDraggable = false;
      $el.style.cursor = '';
    };

    return self;

    function addModule(module) {
      // add card module
      module.card && module.card(self);
    }

    function zoom() {
        const stage = document.getElementById('deck-container');
        var zoom = 0;
        if ($el.classList.contains('zoom1')) {
            $el.classList.remove("zoom1");
            $el.classList.add("zoom2");
            zoom = 2;
        } else if ($el.classList.contains('zoom2')) {
            $el.classList.remove("zoom2");
        } else {
            $el.classList.add("zoom1");
            zoom = 1;
        }
        $el.style.zIndex = maxZ++;
        stage.dispatchEvent(new CustomEvent('cardZoomed', {detail: {element: self, zoom: zoom}}));
    }

    function syncZoom(zoom) {
      if (zoom) {
        $el.classList.add("zoom" + zoom);
      } else {
        $el.classList.remove("zoom1", "zoom2");
      }
      $el.style.zIndex = maxZ++;
    }

    function onMousedown(e) {
      var startPos = {};
      var pos = {};
      var starttime = Date.now();
      const stage = document.getElementById('deck-container');
      const scale = stage.getBoundingClientRect().width / stage.offsetWidth;
      if (e.target.closest('.card_wrapper')) {
        e.preventDefault();

        if (e.which === 3 || e.button === 2 || (e.which === 1 && (e.ctrlKey || e.metaKey))) {
          zoom();

          return false;
        }
        // get start coordinates and start listening window events
        if (e.type === 'mousedown') {
          startPos.x = pos.x = e.clientX / scale;
          startPos.y = pos.y = e.clientY / scale;
          addListener(window, 'mousemove', onMousemove);
          addListener(window, 'mouseup', onMouseup);
        } else {
          startPos.x = pos.x = e.touches[0].clientX / scale;
          startPos.y = pos.y = e.touches[0].clientY / scale;
          addListener(window, 'touchmove', onMousemove);
          addListener(window, 'touchend', onMouseup);
        }

        if (!isDraggable) {
          // is not draggable, do nothing
          return;
        }

        if (e.target.className === 'card_image') {
          stage.dispatchEvent(new CustomEvent('cardMoved', {
            detail: {
              element: self,
              startPosition: {x: self.x, y: self.y}
            }
          }));
        }

        // move card
        $el.style[transform] = translate(self.x + 'px', self.y + 'px') + (self.rot ? ' rotate(' + self.rot + 'deg)' : '');
        $el.style.zIndex = maxZ++;
      }
      function onMousemove(e) {
        const stage = document.getElementById('deck-container');
        const scale = stage.getBoundingClientRect().width / stage.offsetWidth;
        if (!isDraggable) {
          // is not draggable, do nothing
          return;
        }
        if (e.type === 'mousemove') {
          pos.x = e.clientX / scale;
          pos.y = e.clientY / scale;
        } else {
          pos.x = e.touches[0].clientX / scale;
          pos.y = e.touches[0].clientY / scale;
        }

        let newposX = Math.round(self.x + pos.x - startPos.x);
        let newposY = Math.round(self.y + pos.y - startPos.y);

        // move card
        $el.style[transform] = translate(newposX + 'px', newposY + 'px') + (self.rot ? ' rotate(' + self.rot + 'deg)' : '');
      }

      function onMouseup(e) {
        const stage = document.getElementById('deck-container');
        const scale = stage.getBoundingClientRect().width / stage.offsetWidth;
        if (e.target.className === 'card_image') {
          if (isFlippable && Date.now() - starttime < 200) {
            // flip sides
            self.setSide(self.side === 'front' ? 'back' : 'front');
          }
        } else if (e.type !== "mouseup") {
          self.hold(!self.holding);
        }
        if (e.type === 'mouseup') {
          removeListener(window, 'mousemove', onMousemove);
          removeListener(window, 'mouseup', onMouseup);
        } else {
          removeListener(window, 'touchmove', onMousemove);
          removeListener(window, 'touchend', onMouseup);
        }
        if (!isDraggable || e.target.className === "hold") {
          // is not draggable, do nothing
          return;
        }

        // get the position on stage
        const stageRect = stage.getBoundingClientRect();
        const newX = (e.clientX - stageRect.left) / scale;
        const newY = (e.clientY - stageRect.top) / scale;

        if (newX < 0 || newY < 0 || newX > stageRect.width / scale || newY > stageRect.height / scale) {
          self.x = card.x || -z;
          self.y = card.y || -z;
          $el.style[transform] = translate((card.x || -z) + 'px', (card.y || -z) + 'px') + (self.rot ? ' rotate(' + self.rot + 'deg)' : '');
          const targetDeck = document.querySelector(`.deck[data-id="${card.deck_id}"]`);
          targetDeck.prepend($el);
          return;
        }

        if ((Date.now() - starttime > 400) && self.x === newX && self.y === newY) {
          zoom();
        }

        self.x = newX;
        self.y = newY;
        $el.style[transform] = translate(newX + 'px', newY + 'px') + (self.rot ? ' rotate(' + self.rot + 'deg)' : '');

        if (e.target.className === 'card_image') {
            if ($el.parentNode.id !== "deck-container") stage.append($el);
            stage.dispatchEvent(new CustomEvent('cardPlaced', {detail: {element: self, position: {x: self.x, y: self.y}}}));
        }
      }
    }

    function mount(target) {
      // mount card to target (deck)
      target.appendChild($el);

      self.$root = target;
    }

    function unmount() {
      // unmount from root (deck)
      self.$root && self.$root.removeChild($el);
      self.$root = null;
    }

    function flipper(newSide) {
        // flip sides
        if (newSide === 'front') {
            if (self.side === 'back') {
                wrapper.removeChild($back);
            }
            self.side = 'front';
            wrapper.appendChild($face);
            var suitName = SuitName(self.suit);
            $el.setAttribute('class', 'card ' + suitName + ' rank' + self.rank);
        } else {
            if (self.side === 'front') {
                wrapper.removeChild($face);
            }
            self.side = 'back';
            wrapper.appendChild($back);
            $el.setAttribute('class', 'card');
        }
        self.hold(self.holding);
    }
    function hold(bool) {
        self.holding = bool;
        if (bool) {
            $el.classList.add('holding');
        } else {
            $el.classList.remove('holding');
        }
    }
    function setSide(newSide) {
      self.flipper(newSide);
        const stage = document.getElementById('deck-container');
        stage.dispatchEvent(new CustomEvent('cardFlipped', {detail: {element: self, side: self.side}}));
    }

    function move(pos) {
        self.x = pos.x;
        self.y = pos.y;
        $el.style[transform] = translate(pos.x + 'px', pos.y + 'px');
    }
  }

  function SuitName(suit) {
    // return suit name from suit value
    return suit === 0 ? 'spades' : suit === 1 ? 'hearts' : suit === 2 ? 'clubs' : suit === 3 ? 'diamonds' : 'joker';
  }

  function addListener(target, name, listener) {
    target.addEventListener(name, listener);
  }

  function removeListener(target, name, listener) {
    target.removeEventListener(name, listener);
  }

  var ease = {
    linear: function linear(t) {
      return t;
    },
    quadIn: function quadIn(t) {
      return t * t;
    },
    quadOut: function quadOut(t) {
      return t * (2 - t);
    },
    quadInOut: function quadInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    cubicIn: function cubicIn(t) {
      return t * t * t;
    },
    cubicOut: function cubicOut(t) {
      return --t * t * t + 1;
    },
    cubicInOut: function cubicInOut(t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },
    quartIn: function quartIn(t) {
      return t * t * t * t;
    },
    quartOut: function quartOut(t) {
      return 1 - --t * t * t * t;
    },
    quartInOut: function quartInOut(t) {
      return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
    },
    quintIn: function quintIn(t) {
      return t * t * t * t * t;
    },
    quintOut: function quintOut(t) {
      return 1 + --t * t * t * t * t;
    },
    quintInOut: function quintInOut(t) {
      return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
    }
  };

  var flip = {
    deck: function deck(_deck) {
      _deck.flip = _deck.queued(flip);

      function flip(next, side) {
        var flipped = _deck.cards.filter(function (card) {
          return card.side === 'front';
        }).length / _deck.cards.length;

        _deck.cards.forEach(function (card, i) {
          if (!card.$el.classList.contains('holding')) {
              card.setSide(side ? side : flipped > 0.5 ? 'back' : 'front');
          }
        });
        next();
      }
    }
  };

  var sort = {
    deck: function deck(_deck2) {
      _deck2.sort = _deck2.queued(sort);

      function sort(next, reverse) {
        var cards = _deck2.cards;

        cards.sort(function (a, b) {
          if (reverse) {
            return a.i - b.i;
          } else {
            return b.i - a.i;
          }
        });

        cards.forEach(function (card, i) {
          card.sort(i, cards.length, function (i) {
            if (i === cards.length - 1) {
              next();
            }
          }, reverse);
        });
      }
    },
    card: function card(_card2) {
      var $el = _card2.$el;

      _card2.sort = function (i, len, cb, reverse) {
        var z = i / 4;
        var delay = i * 10;

        _card2.animateTo({
          delay: delay,
          duration: 400,

          x: -z,
          y: -150,
          rot: 0,

          onComplete: function onComplete() {
            $el.style.zIndex = i;
          }
        });

        _card2.animateTo({
          delay: delay + 500,
          duration: 400,

          x: -z,
          y: -z,
          rot: 0,

          onComplete: function onComplete() {
            cb(i);
          }
        });
      };
    }
  };

  function plusminus(value) {
    var plusminus = Math.round(Math.random()) ? -1 : 1;

    return plusminus * value;
  }

  function fisherYates(array) {
    var rnd, temp;

    for (var i = array.length - 1; i; i--) {
      rnd = Math.random() * i | 0;
      temp = array[i];
      array[i] = array[rnd];
      array[rnd] = temp;
    }

    return array;
  }

  function fontSize() {
    return window.getComputedStyle(document.body).getPropertyValue('font-size').slice(0, -2);
  }

  var ____fontSize;

  var shuffle = {
    deck: function deck(_deck3) {
      _deck3.shuffle = _deck3.queued(shuffle);

      function shuffle(next) {
        var cards = _deck3.cards;

        ____fontSize = fontSize();

        fisherYates(cards);

        cards.forEach(function (card, i) {
          if (card.$el.classList.contains('holding')) {
            next();
          } else {
              const targetDeck = document.querySelector(`.deck[data-id="${card.deck_id}"]`);
              !card.holding && targetDeck.prepend(card.$el);

              card.$el.classList.remove("zoom1");
              card.$el.classList.remove("zoom2");
              card.$el.querySelectorAll('.card_form').forEach(e => e.remove());
              card.pos = i;
              card.setSide('back');

              card.shuffle(function (i) {
                  if (i === cards.length - 1) {
                      next();
                  }
              });
          }
        });
        return;
      }
    },

    card: function card(_card3) {
      var $el = _card3.$el;

      _card3.shuffle = function (cb) {
        var i = _card3.pos;
        var z = i / 4;
        var delay = i * 2;

        _card3.animateTo({
          delay: delay,
          duration: 200,

          x: plusminus(Math.random() * 40 + 20) * ____fontSize / 16,
          y: -z,
          rot: 0
        });
        _card3.animateTo({
          delay: 200 + delay,
          duration: 200,

          x: -z,
          y: -z,
          rot: 0,

          onStart: function onStart() {
            $el.style.zIndex = i;
          },

          onComplete: function onComplete() {
            cb(i);
          }
        });
      };
    }
  };

  var __fontSize;

  var poker = {
    deck: function deck(_deck4) {
      _deck4.poker = _deck4.queued(poker);

      function poker(next) {
        var cards = _deck4.cards;
        var len = cards.length;

        __fontSize = fontSize();

        cards.slice(-5).reverse().forEach(function (card, i) {
          card.poker(i, len, function (i) {
            card.setSide('front');
            if (i === 4) {
              next();
            }
          });
        });
      }
    },
    card: function card(_card4) {
      var $el = _card4.$el;

      _card4.poker = function (i, len, cb) {
        var delay = i * 250;

        _card4.animateTo({
          delay: delay,
          duration: 250,

          x: Math.round((i - 2.05) * 70 * __fontSize / 16),
          y: Math.round(-110 * __fontSize / 16),
          rot: 0,

          onStart: function onStart() {
            $el.style.zIndex = len - 1 + i;
          },
          onComplete: function onComplete() {
            cb(i);
          }
        });
      };
    }
  };

  var intro = {
    deck: function deck(_deck5) {
      _deck5.intro = _deck5.queued(intro);

      function intro(next) {
        var cards = _deck5.cards;

        cards.forEach(function (card, i) {
          card.setSide('front');
          card.intro(i, function (i) {
            animationFrames(250, 0).start(function () {
              card.setSide('back');
            });
            if (i === cards.length - 1) {
              next();
            }
          });
        });
      }
    },
    card: function card(_card5) {
      var transform = prefix('transform');

      var $el = _card5.$el;

      _card5.intro = function (i, cb) {
        var delay = 500 + i * 10;
        var z = i / 4;

        $el.style[transform] = translate(-z + 'px', '-250px');
        $el.style.opacity = 0;

        _card5.x = -z;
        _card5.y = -250 - z;
        _card5.rot = 0;

        _card5.animateTo({
          delay: delay,
          duration: 1000,

          x: -z,
          y: -z,

          onStart: function onStart() {
            $el.style.zIndex = i;
          },
          onProgress: function onProgress(t) {
            $el.style.opacity = t;
          },
          onComplete: function onComplete() {
            $el.style.opacity = '';
            cb && cb(i);
          }
        });
      };
    }
  };

  var _fontSize;

  var fan = {
    deck: function deck(_deck6) {
      _deck6.fan = _deck6.queued(fan);

      function fan(next) {
        var cards = _deck6.cards;
        var len = cards.length;

        _fontSize = fontSize();

        cards.forEach(function (card, i) {
          card.fan(i, len, function (i) {
            if (i === cards.length - 1) {
              next();
            }
          });
        });
      }
    },
    card: function card(_card6) {
      var $el = _card6.$el;

      _card6.fan = function (i, len, cb) {
        var z = i / 4;
        var delay = i * 10;
        var rot = i / (len - 1) * 260 - 130;

        _card6.animateTo({
          delay: delay,
          duration: 300,

          x: -z,
          y: -z,
          rot: 0
        });
        _card6.animateTo({
          delay: 300 + delay,
          duration: 300,

          x: Math.cos(deg2rad(rot - 90)) * 55 * _fontSize / 16,
          y: Math.sin(deg2rad(rot - 90)) * 55 * _fontSize / 16,
          rot: rot,

          onStart: function onStart() {
            $el.style.zIndex = i;
          },

          onComplete: function onComplete() {
            cb(i);
          }
        });
      };
    }
  };

  function deg2rad(degrees) {
    return degrees * Math.PI / 180;
  }

  var ___fontSize;

  var bysuit = {
    deck: function deck(_deck7) {
      _deck7.bysuit = _deck7.queued(bysuit);

      function bysuit(next) {
        var cards = _deck7.cards;

        ___fontSize = fontSize();

        cards.forEach(function (card) {
          if (card.$el.classList.contains('holding')) {
            next();
          } else {
              const stage = document.getElementById('deck-container');
              stage.append(card.$el);
              card.bysuit(function (i) {
                  if (i === cards.length - 1) {
                      next();
                  }
              });
              card.setSide('front');
          }
        });
      }
    },
    card: function card(_card7) {
      var rank = _card7.rank;
      var suit = _card7.suit;

      _card7.bysuit = function (cb) {
        var i = _card7.i;
        var delay = i * 10;

        _card7.animateTo({
          delay: delay,
          duration: 400,

          x: 1200 + -Math.round((6.75 - rank) * 102 * ___fontSize / 16),
          y: -Math.round((1.5 - suit) * 140 * ___fontSize / 16) + 470,
          rot: 0,

          onComplete: function onComplete() {
            cb(i);
          }
        });
      };
    }
  };

  function queue(target) {
    var array = Array.prototype;

    var queueing = [];

    target.queue = queue;
    target.queued = queued;

    return target;

    function queued(action) {
      return function () {
        var self = this;
        var args = arguments;

        queue(function (next) {
          action.apply(self, array.concat.apply(next, args));
        });
      };
    }

    function queue(action) {
      if (!action) {
        return;
      }

      queueing.push(action);

      if (queueing.length === 1) {
        next();
      }
    }
    function next() {
      queueing[0](function (err) {
        if (err) {
          throw err;
        }

        queueing = queueing.slice(1);

        if (queueing.length) {
          next();
        }
      });
    }
  }

  function observable(target) {
    target || (target = {});
    var listeners = {};

    target.on = on;
    target.one = one;
    target.off = off;
    target.trigger = trigger;

    return target;

    function on(name, cb, ctx) {
      listeners[name] || (listeners[name] = []);
      listeners[name].push({ cb: cb, ctx: ctx });
    }

    function one(name, cb, ctx) {
      listeners[name] || (listeners[name] = []);
      listeners[name].push({
        cb: cb, ctx: ctx, once: true
      });
    }

    function trigger(name) {
      var self = this;
      var args = Array.prototype.slice(arguments, 1);

      var currentListeners = listeners[name] || [];

      currentListeners.filter(function (listener) {
        listener.cb.apply(self, args);

        return !listener.once;
      });
    }

    function off(name, cb) {
      if (!name) {
        listeners = {};
        return;
      }

      if (!cb) {
        listeners[name] = [];
        return;
      }

      listeners[name] = listeners[name].filter(function (listener) {
        return listener.cb !== cb;
      });
    }
  }

  function Deck(newdeck) {
    let id;
    if (typeof newdeck._id !== "undefined") {
        id = newdeck._id;
    } else if (typeof newdeck.id !== "undefined") {
        id = newdeck.id;
    } else {
        return false;
    }
    // init cards array
    var cards = newdeck.cards;

    var $el = createElement('div');

    var self = observable({
      id: id,
      mount: mount,
      unmount: unmount,
      name: newdeck.name,
      image: newdeck.image,
      cards: cards,
      backgrounds: newdeck.backgrounds,
      description_en: newdeck.description_en,
      description_il: newdeck.description_il,
      description_spa: newdeck.description_spa,
      description_zh: newdeck.description_zh,
      description_ukr: newdeck.description_ukr,
      description_pl: newdeck.description_pl,
      description_cz: newdeck.description_cz,
      played: newdeck.played || false,
      forms: newdeck.forms || false,
      $el: $el
    });
    var $root;

    var modules = Deck.modules;
    var module;

    // make queueable
    queue(self);

    // load modules
    for (module in modules) {
      addModule(modules[module]);
    }

    // add class
    $el.classList.add('deck');
    $el.setAttribute('data-id', id);

    var card;

    const placeholder = document.createElement('div');
    placeholder.classList.add('deck_placeholder');
    $el.appendChild(placeholder);
    // create cards
    for (var i = cards.length; i; i--) {
      cards[i - 1].back = newdeck.image;
      card = cards[i - 1] = _card(i - 1, cards[i - 1]);
      card.setSide((typeof newdeck.cards[i - 1].side !== "undefined") ? newdeck.cards[i - 1].side : 'back');
      card.mount($el);
    }

    return self;

    function mount(root) {
      // mount deck to root
      $root = root;
      $root.appendChild($el);
    }

    function unmount() {
      // unmount deck from root
      $root.removeChild($el);
    }

    function addModule(module) {
      module.deck && module.deck(self);
    }
  }
  Deck.animationFrames = animationFrames;
  Deck.ease = ease;
  Deck.modules = { bysuit: bysuit, fan: fan, intro: intro, poker: poker, shuffle: shuffle, sort: sort, flip: flip };
  Deck.Card = _card;
  Deck.prefix = prefix;
  Deck.translate = translate;

  return Deck;
})();
export default Deck;
