/*!
 * jquery.fx-transition.js
 * > Extends jquery with transition tweens
 */
(function($, window) {
  
  // Constants
  var
    transitionEvents = ("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd").split(/\s+/), 
    transitionEasings = {
      'swing': [0.2, 0.1, 0.47, 1],
      'linear': [0.250, 0.250, 0.750, 0.750],
      'ease': [0.250, 0.100, 0.250, 1.000],
      //'easeIn': [0.420, 0.000, 1.000, 1.000],
      'easeIn': 'ease-in',
      'easeInQuad': [0.550, 0.085, 0.680, 0.530],
      'easeInCubic': [0.550, 0.055, 0.675, 0.190],
      'easeInQuart': [0.895, 0.030, 0.685, 0.220],
      'easeInQuint': [0.755, 0.050, 0.855, 0.060],
      'easeInSine': [0.470, 0.000, 0.745, 0.715],
      'easeInExpo': [0.950, 0.050, 0.795, 0.035],
      'easeInCirc': [0.600, 0.040, 0.980, 0.335],
      'easeInBack': [0.600, -0.280, 0.735, 0.045],
      //'easeOut': [0.000, 0.000, 0.580, 1.000],
      'easeOut': 'ease-out',
      'easeOutQuad': [0.250, 0.460, 0.450, 0.940],
      'easeOutCubic': [0.215, 0.610, 0.355, 1.000],
      'easeOutQuart': [0.165, 0.840, 0.440, 1.000],
      'easeOutQuint': [0.230, 1.000, 0.320, 1.000],
      'easeOutSine': [0.390, 0.575, 0.565, 1.000],
      'easeOutExpo': [0.190, 1.000, 0.220, 1.000],
      'easeOutCirc': [0.075, 0.820, 0.165, 1.000],
      'easeOutBack': [0.175, 0.885, 0.320, 1.275],
      'easeInOut': 'ease-in-out',
      'easeInOutQuad': [0.455, 0.030, 0.515, 0.955],
      'easeInOutCubic': [0.645, 0.045, 0.355, 1.000],
      'easeInOutQuart': [0.770, 0.000, 0.175, 1.000],
      'easeInOutQuint': [0.860, 0.000, 0.070, 1.000],
      'easeInOutSine': [0.445, 0.050, 0.550, 0.950],
      'easeInOutExpo': [1.000, 0.000, 0.000, 1.000],
      'easeInOutCirc': [0.785, 0.135, 0.150, 0.860],
      'easeInOutBack': [0.680, -0.550, 0.265, 1.550]
    },
   
    // Utility methods
    /**
     * Camelize a string
     * @param string
     */
    camelize = (function() {
      var cache = {};
      return function(string) {
        return cache[string] = cache[string] || (function() {
          return string.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
        })();
      };
    })(),

    /**
     * Hyphenate a string
     * @param string
     */ 
    hyphenate = (function() {
      var cache = {};
      return function(string) {
        return cache[string] = cache[string] || (function() {
          return string.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
        })();
      };
    })(),

    /**
     * Retrieves a vendor prefixed style name for the given property
     * @param styleName
     * @param hyphenated
     */
    getVendorStyle = (function() {
      var
        cache = {},
        vendorPrefixes = ['Webkit', 'Moz', 'O', 'Ms'], elem = document.createElement('div');
      return function (styleName, hyphenated) {
        hyphenated = typeof hyphenated === 'boolean' ? hyphenated : false;
        var
          camelized = camelize(styleName),
          result = cache[camelized] = typeof cache[camelized] !== 'undefined' ? cache[camelized] : (function(camelized) {
            var
              result = null,
              capitalized,
              prop;
            document.documentElement.appendChild(elem);
            if (typeof (elem.style[camelized]) === 'string') {
              result = camelized;
            }
            if (!result) {
              capitalized = camelized.substring(0, 1).toUpperCase() + camelized.substring(1);
              for (i = 0; i < vendorPrefixes.length; i++) {
                prop = vendorPrefixes[i] + capitalized;
                if (typeof elem.style[prop] === 'string') {
                  result = prop;
                  break;
                }
              }
            }
            elem.parentNode.removeChild(elem);
            return result;
          })(camelized);
        return result && hyphenated ? hyphenate(result) : result;
      };
    })(),

    /**
     * Detects if a certain transition is supported
     * @param property
     * @param from
     * @param to
     * @param element
     */
    isTransitionSupported = (function() {
      var cache = {};
      return function(property, from, to, element) {
        var
          fromString = from.replace(/\d+/gi, "0"),
          toString = to.replace(/\d+/gi, "1"),
          cacheKey = property + ":" + fromString + ":" + toString;
        return cache[cacheKey] = cache[cacheKey] || (function() {
          var
            doc = document.documentElement,
            camelized = getVendorStyle(property),
            hyphenated = hyphenate(camelized),
            style = doc.appendChild(document.createElement("style")),
            rule = [
                    'capTest{',
                        '0%{',   hyphenated, ':', from, '}',
                        '100%{', hyphenated, ':', to,   '}',
                    '}'
                   ].join(''),
            prefixes = ' moz ms o webkit'.split(' '),
            prefixCount = prefixes.length,
            canAnimate = false,
            i,
            prefix,
            hPrefix,
            uPrefix,
            ruleString,
            animationProp,
            before,
            after;
            
          element = doc.appendChild(element ? element.cloneNode(false) : document.createElement('div'));
          // Detect invalid start value. (Webkit tries to use default.)
          element.style[camelized] = to;
          // Iterate through supported prefixes.
          for (i = 0; i < prefixCount; i++) {
            // Variations on current prefix.
            prefix  = prefixes[i],
            hPrefix = (prefix) ? '-' + prefix + '-' : '',
            uPrefix = (prefix) ? prefix.toUpperCase() + '_' : '';
            // Test for support.
            if (CSSRule[uPrefix + 'KEYFRAMES_RULE']) {
              // Rule supported; add keyframe rule to test stylesheet.
              ruleString = '@'+ hPrefix + 'keyframes ' + rule;
              try {
                style.sheet.insertRule(ruleString, 0);
                // Apply animation.
                animationProp = camelize(hPrefix + 'animation');
                element.style[animationProp] = 'capTest 1s 0s both';
                // Get initial computed style.
                before = getComputedStyle(element)[camelized];
                // Skip to last frame of animation.
                // BUG: Firefox doesn't support reverse or update node style while attached.
                doc.removeChild(element);
                element.style[animationProp] = 'capTest 1s -1s alternate both';
                doc.appendChild(element);
                // BUG: Webkit doesn't update style when animation skipped ahead.
                element.style[animationProp] = 'capTest 1s 0 reverse both';
                // Get final computed style.
                after = getComputedStyle(element)[camelized];
                // If before and after are different, property and values can be animated.
                canAnimate = before !== after;
                //canAnimate = true;
                break;
              } catch (e) {
              }
            }
          }
          // Clean up the test elements.
          doc.removeChild(element);
          doc.removeChild(style);
          return canAnimate;
        })();
      };
    })(),

    /**
     * Split css function values, e.g. `translate(10%,10px) rotate(45deg)`
     * @param string
     */
    splitCSS = function(string) {
      var match, split = [], current = "", literal, token;
      while( match = string.match(/\s*(,|\(|\))\s*/)) {
        current+= string.substring(0, match.index);
        token = match[0];
        if (token === '(') {
          literal = true;
        } else if (token === ')') {
          current+= token;
          literal = null;
        }
        if (literal) {
          current+= token;
        } else if (current) {
          split.push(current);
          current = "";
        }
        string = string.substring(match.index + match[0].length);
      }
      return split;
    },
  
    /**
     * Parse arguments from a css-function, e.g. `cubic-bezier(p1, p2, p3, p4)`
     */
    parseCSSArgs = function(string) {
      var match, result;
      if (typeof string === 'string') {
        match = string.match(/\(\s*([^\)]*)\s*\)/);
        if (match) {
          result = $.map(match[1].split(","), $.trim);
          return result;
        }
      }
      return null;
    },

    /**
     * Parse transition properties into an array and add or remove transitions
     * @param elem
     * @param add
     * @param remove
     * @param props
     */
    getTransitionStyles = function(elem, add, remove, props) {
      props = typeof props !== 'boolean' ? false : true;
      add = add instanceof Array ? add : [];
      remove = remove instanceof Array ? remove : [];
      remove = remove.concat($.map(add, function(obj) {
        return obj.prop;
      }));
      var
        transitionStyle = getVendorStyle('transition'),
        $elem = $(elem),
        properties = $elem.css(transitionStyle + "Property").split(/[\s,]+/),
        durations = $elem.css(transitionStyle + "Duration").split(/[\s,]+/),
        delays = $elem.css(transitionStyle + "Delay").split(/[\s,]+/),
        timingFunctions = splitCSS($elem.css(transitionStyle + "TimingFunction")),
        transitions = $.map(properties, function(prop, index) {
          return {
            prop: prop,
            duration: durations[index],
            delay: delays[index],
            timingFunction: timingFunctions[index]
          };
        }),
        css;
      // remove props
      transitions = $.map(transitions, function(obj) {
        if (obj.prop === 'none' || obj.prop === 'all' || $.inArray(obj.prop, remove ) >= 0 ) {
          return null;
        }
        return obj;
      });
      // add props
      $.each(add, function(index, obj) {
        transitions.push(obj);
      });
      if (!props) {
        css = {};
        css[transitionStyle + "Property"] = $.map(transitions, function(obj) { return obj.prop; }).join(", ");
        css[transitionStyle + "Duration"] = $.map(transitions, function(obj) { return obj.duration; }).join(", ");
        css[transitionStyle + "Delay"] = $.map(transitions, function(obj) { return obj.delay; }).join(", ");
        css[transitionStyle + "TimingFunction"] = $.map(transitions, function(obj) { return obj.timingFunction; }).join(", ");
        return css;
      }
      return transitions;
    },
  
    /**
     * Convert milliseconds to time-string
     * @param {Object} duration
     */
    getTransitionDuration = function(duration) {
      return Number(duration / 1000).toFixed(2) + "s";
    },
    
    /**
     * returns a jquery-easing by specified option
     */
    getTweenEasing = function(easing) {
      if (jQuery.easing[ easing ]) {
        // Use original easing
        return easing;
      }
      if (typeof easing === 'string' && $.bez) {
        // Parse bezier points from css-function if $.bez is available
        easing = parseCSSArgs(easing) || easing;
      }
      if (typeof easing === 'string') {
        // Find bezier points from transition map
        easing = transitionEasings[camelize(easing)] || easing;
      }
      if (easing instanceof Array && $.bez) {
        // Use $.bez as Fallback
        easing = $.bez(easing);
      } else {
        easing = null;
      }
      return easing || "swing";
    },
  
    /**
     * Returns a css-timing-function value by specified option
     */
    getTransitionEasing = function(easing) {
      if (typeof easing === 'string') {
        // Translate name to bezier points
        easing = transitionEasings[camelize(easing)] || easing;
      }
      if (easing instanceof Array) {
        // Bezier easing
        easing = "cubic-bezier(" + easing.join(",") + ")";
      }
      return easing;
    },

    /**
     * Determines whether specified style is pixel-based.
     * @param prop
     */
    isPixelStyle = (function () {
      var
        cache = {},
        doc = document,
        elem = doc.createElement('div');
      return function(prop) {
        prop = getVendorStyle(camelize(prop));
        return cache[prop] = typeof cache[prop] !== 'undefined' ? cache[prop] : (function(prop) {
          doc.body.appendChild(elem);
          elem.style[prop] = "1px";
          var result = elem.style[prop].match(/^[\d\.]*px$/) !== null;
          doc.body.removeChild(elem);
          return result;
        })(prop);
      };
    })(),
  
  
    /**
     * Request animation shim
     * @param callback
     */
    requestAnimationFrame = (function() {
      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function( callback )  {
          window.setTimeout(callback, 1000 / 60);
        };
      })(),
  
    /**
     * Create tween
     * @param prop
     * @param value
     */
    createTween = (function() {
      // constants:
      var
        core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
        rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" );
      return function ( prop, value ) {
        var
          pixelStyle = !jQuery.cssNumber[ prop ] && isPixelStyle(prop),
          tween = this.createTween( prop, value ),
          target = tween.cur(),
          parts = rfxnum.exec( value ),
          unit = parts && parts[ 3 ] || ( !pixelStyle ? "" : "px" ),
          // Starting value computation is required for potential unit mismatches
          start = ( !pixelStyle || unit !== "px" && +target ) &&
            rfxnum.exec( jQuery.css( tween.elem, prop ) ),
          scale = 1,
          maxIterations = 20;
        tween.unit = !pixelStyle ? "" : "px";
        if ( start && start[ 3 ] !== unit ) {
          // Trust units reported by jQuery.css
          unit = unit || start[ 3 ];
          // Make sure we update the tween properties later on
          parts = parts || [];
          // Iteratively approximate from a nonzero starting point
          start = +target || 1;
          do {
            // If previous iteration zeroed out, double until we get *something*
            // Use a string for doubling factor so we don't accidentally see scale as unchanged below
            scale = scale || ".5";
            // Adjust and apply
            start = start / scale;
            jQuery.style( tween.elem, prop, start + unit );
          // Update scale, tolerating zero or NaN from tween.cur()
          // And breaking the loop if scale is unchanged or perfect, or if we've just had enough
          } while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
        }
        // Update tween properties
        if ( parts ) {
          start = tween.start = +start || +target || 0;
          tween.unit = unit;
          // If a +=/-= token was provided, we're doing a relative animation
          tween.end = parts[ 1 ] ?
            start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
            +parts[ 2 ];
        }
        return tween;
      };
    })(),

    /**
     * Retrieves the total duration of specified tweens including delays
     * @param {Array} tweens
     */
    getTotalDuration = function(tweens) {
      var duration = 0;
      $.each(tweens, function(index, tween) {
        duration = Math.max(duration, tween.delay + tween.duration);
      });
      return duration;
    },

    /**
     * Runs a time-based tween with support for per-prop durations and delays.
     * @param anim
     * @param percent
     */
    tweenRunner = function( anim, percent ) {
      var
        s = this.delay / anim.duration,
        e = (this.delay + this.duration) / anim.duration,
        p = Math.min(Math.max(0, percent - s) / (e - s), 1),
        easing = getTweenEasing(this.easing),
        eased,
        hooks;
      if (p >= 0) {
        hooks = jQuery.Tween.propHooks[ this.prop ];
        // apply easing
        if ( this.duration ) {
          this.pos = eased = jQuery.easing[ easing ](
            p, this.duration * p, 0, 1, this.duration
          );
        } else {
          this.pos = eased = p;
        }
        this.now = ( this.end - this.start ) * eased + this.start;
        // call step
        if ( this.options.step ) {
          this.options.step.call( this.elem, this.now, this );
        }
        // call hooks
        if ( hooks && hooks.set ) {
          hooks.set( this );
        } else {
          jQuery.Tween.propHooks._default.set( this );
        }
      }
      // detect end
      if (this.pos === 1 && !this.finished) {
        // finished
        this.finished = true;
        tweenFinished.call(anim, this);
      }
      return this;
    },

    /**
     * Runs a transition-tween
     * @param {Object} anim
     * @param {Object} percent
     */
    transitionRunner = function( anim, percent ) {
      var
        tween = this,
        elem = anim.elem,
        $elem = $(elem),
        add;
      // transition end handler
      function transitionEndHandler(event) {
        var
          vendorProp = event.originalEvent.propertyName,
          tween = $.map(anim.tweens, function(tween) {
          return getVendorStyle(tween.prop, true) === vendorProp ? tween : null;
        })[0];
        if (tween && !tween.finished) {
          stopTween( true );
          tween.finished = true;
          tween.stopped = true;
          tweenFinished.call(anim, tween);
          if (anim.finished) {
            $elem.off(transitionEvents.join(" "), transitionRunner);
          }
        }
      }
      // stop tween helper
      function stopTween( gotoEnd ) {
        if (!tween.stopped) {
          tween.stopped = true;
          var value = $elem.css(getVendorStyle(tween.prop, true));
          var css = getTransitionStyles(elem, null, [getVendorStyle(tween.prop, true)]);
          css[getVendorStyle(tween.prop)] = gotoEnd ? tween.end + tween.unit : value;
          $elem.css(css);
        }
        
      }
      // step helper
      function step() {
        if ( tween.options.step ) {
          // read only when needed for step callback
          tween.now = tween.cur();
          tween.options.step.call( anim.elem, tween.now, tween );
        }
        if (!anim.finished) {
          requestAnimationFrame(step);
        }
      }
      // stop tween when done
      $elem.promise().done(function() {
        if (!tween.finished) {
          stopTween();
        }
      });
      // stop tween when finished
      if (percent === 1) {
        stopTween( true );
      }
      // start tween
      if (percent === 0) {
        $elem.css(getVendorStyle(tween.prop), tween.start + tween.unit);
        add = [
          {
            prop: getVendorStyle(tween.prop, true),
            duration: getTransitionDuration(tween.duration),
            delay: getTransitionDuration(tween.delay),
            timingFunction: getTransitionEasing(tween.easing)
          }
        ];
        $elem.on(transitionEvents.join(" "), transitionEndHandler);
        $elem.css(getTransitionStyles(elem, add));
        // start on next frame
        requestAnimationFrame(function() {
          if (tween.finished) {
            // return if tween is already finished
            return;
          }
          $elem.css(getVendorStyle(tween.prop), tween.end + tween.unit);
          //console.log("run transition: ", elem, " ----- ", tween.prop, tween.start + tween.unit + " -> " + tween.end + tween.unit, "duration: ", tween.duration, "delay: ", tween.delay, "easing: ", tween.easing);  
          step();
        });
      }
      return this;
    };
    
    
    /**
     * Called when a tween is finished
     */
    function tweenFinished() {
      var anim = this;
      if (!anim.finished && $.map(anim.tweens, function(tween) { return !tween.finished ? tween : null; }).length === 0) {
        anim.finished = true;
        anim.stop( true );
      }
      return false;
    }
    
  
  /*
   * Register the extension
   */
  jQuery.Animation.tweener(function( prop ) {
    // setup vars
    var
      anim = this,
      tween = createTween.apply(anim, arguments),
      duration = typeof anim.opts.specialDuration === 'object' && typeof anim.opts.specialDuration[prop] !== 'undefined' ? anim.opts.specialDuration[prop] : anim.opts.duration,
      delay = typeof anim.opts.specialDelay === 'object' && typeof anim.opts.specialDelay[prop] !== 'undefined' ? anim.opts.specialDelay[prop] : anim.opts.delay,
      easing = typeof anim.opts.specialEasing === 'object' && typeof anim.opts.specialEasing[prop] !== 'undefined' ? anim.opts.specialEasing[prop] : anim.opts.easing,
      isTransition = false,
      totalDuration;
    // setup default options
    duration = typeof duration === 'number' ? duration : 0;
    delay = typeof delay === 'number' ? delay : 0;
    easing = easing || 'swing';
    // copy default options to tween
    tween.delay = delay;
    tween.duration = duration;
    // run handler
    tween.run = function( percent ) {
      if (percent === 0) {
        // detect transition-support on start
        isTransition = ( typeof anim.opts.cssTransitions !== 'boolean' || anim.opts.cssTransitions !== false ) && isTransitionSupported(getVendorStyle(prop), tween.start + tween.unit, tween.end + tween.unit);
      }
      if (isTransition) {
        // transition runner
        transitionRunner.call(this, anim, percent);
      } else {
        // tween runner
        tweenRunner.call(this, anim, percent);
      }
      return tween;
    };
    // get total duration
    totalDuration = getTotalDuration(anim.tweens);
    // set duration plus threshold
    anim.duration = totalDuration + 1000;
    // return tween
    return tween;
  });

})(jQuery, window);