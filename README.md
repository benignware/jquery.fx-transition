# jquery.fx-transition
> Drop-in css-transitions for jQuery

Usage
-----

Use jQuery's fx-methods (e.g. animate, fadeIn, etc.) as usual.

See [jQuery API-Documentation](http://api.jquery.com/animate/) for more information.

Options
-------

<table>
  <tr>
    <th>Option</th><th>Type</th><th>Description</th>
  </tr>
  <tr>
    <td>cssTransitions</td>
    <td>Boolean</td>
    <td>
      Specify whether to use css-transitions. Defaults to `true`.
    </td>
  </tr>
  <tr>
    <td>easing</td>
    <td>String</td>
    <td>
      Specify a timing-function that should apply to the transition. Either provide an identifier name or a set of cubic-bezier control-point values as css-function, e.g. `cubic-bezier(0.2, 0.1, 0.47, 1)` or an array, e.g. `[0.2, 0.1, 0.47, 1]`.
    </td>
  </tr>
  <tr>
    <td>specialDelay</td>
    <td>Object</td>
    <td>
      Specify delay on a per-prop-basis, e.g. {left: 2000}
    </td>
  </tr>
  <tr>
    <td>specialDuration</td>
    <td>Object</td>
    <td>
      Specify duration on a per-prop-basis, e.g. {left: 2000}
    </td>
  </tr>
  <tr>
    <td>specialEasing</td>
    <td>Object</td>
    <td>
      Specify easing on a per-prop-basis, e.g. {left: 'ease-in-out'}
    </td>
  </tr>
</table>


Easings
-------

The following easing-types are supported:

* swing, linear, ease, easeIn, easeInQuad, easeInCubic, easeInQuart, easeInQuint, easeInSine, easeInExpo, easeInCirc, easeInBack, 
easeOut, easeOutQuad, easeOutCubic, easeOutQuart, easeOutQuint, easeOutSine, easeOutExpo, easeOutCirc, easeOutBack, 
easeInOut, easeInOutQuad, easeInOutCubic, easeInOutQuart, easeInOutQuint, easeInOutSine, easeInOutExpo, easeInOutCirc, easeInOutBack

For control-point-mappings, see [compass-ceaser-easing](https://github.com/jhardy/compass-ceaser-easing).

Add [bez](https://github.com/rdallasgray/bez) to your setup in order to provide fallback for cubic-bezier-easings.

