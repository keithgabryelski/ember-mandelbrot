"use strict";
/* jshint ignore:start */

/* jshint ignore:end */

define('mandelbrot/acceptance-tests/main', ['exports', 'ember-cli-sri/acceptance-tests/main'], function (exports, main) {

	'use strict';



	exports['default'] = main['default'];

});
define('mandelbrot/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'mandelbrot/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  var App;

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('mandelbrot/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'mandelbrot/config/environment'], function (exports, AppVersionComponent, config) {

  'use strict';

  var _config$APP = config['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;

  exports['default'] = AppVersionComponent['default'].extend({
    version: version,
    name: name
  });

});
define('mandelbrot/components/canvas-element', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'canvas',
    attributeBindings: ['height', 'width'],
    width: 640,
    height: 480,
    canvas: null,
    ctx: null
  });

});
define('mandelbrot/components/mandelbrot-canvas', ['exports', 'ember', 'mandelbrot/components/canvas-element', 'npm:mathjs'], function (exports, Ember, CanvasElement, math) {

  'use strict';

  exports['default'] = CanvasElement['default'].extend({
    centerX: null,
    centerY: null,
    increment: null,
    maxIterations: null,
    escapePoint: null,
    lastCalculation: [],
    startCalculation: false,

    theCalculator: Ember['default'].observer('centerX', 'centerY', 'increment', 'maxIterations', 'escapePoint', 'startCalculation', function () {
      if (this.get('startCalculation') == true && this.get('centerX') !== '' && this.get('centerY') !== '' && this.get('increment') !== '' && this.get('maxIterations') !== '' && this.get('escapePoint') !== '') {
        this.set('startCalculation', false);
        this.mandelbrotSet();
      }
    }),

    setPixel: function setPixel(imageData, x, y, r, g, b, a) {
      var index = (x + y * imageData.width) * 4;
      imageData.data[index + 0] = r;
      imageData.data[index + 1] = g;
      imageData.data[index + 2] = b;
      imageData.data[index + 3] = a;
    },

    mandelbrotPixel: function mandelbrotPixel(x, y, maxIterations) {
      var c = math['default'].complex(x, y);
      var z = math['default'].complex(0, 0);
      var i = undefined;
      for (i = 0; i < maxIterations && math['default'].abs(z) < 2.0; ++i) {
        z = math['default'].add(math['default'].multiply(z, z), c);
      }
      return i;
    },

    logBase: 1.0 / Math.log(2.0),
    logHalfBase: Math.log(0.5) * 1.0 / Math.log(2.0),

    fastMandelbrotPixel: function fastMandelbrotPixel(Cr, Ci, maxIterations, escapePoint) {
      var Zr = 0;
      var Zi = 0;
      var Tr = 0;
      var Ti = 0;
      var n = undefined;

      for (n = 0; n < maxIterations && Tr + Ti <= escapePoint; ++n) {
        Zi = 2 * Zr * Zi + Ci;
        Zr = Tr - Ti + Cr;
        Tr = Zr * Zr;
        Ti = Zi * Zi;
      }

      if (n == maxIterations) {
        return null;
      }

      /*
       * Four more iterations to decrease error term;
       * see http://linas.org/art-gallery/escape/escape.html
       */
      for (var e = 0; e < 4; ++e) {
        Zi = 2 * Zr * Zi + Ci;
        Zr = Tr - Ti + Cr;
        Tr = Zr * Zr;
        Ti = Zi * Zi;
      }

      return 5 + n - this.logHalfBase - Math.log(Math.log(Tr + Ti)) * this.logBase;
    },

    /* accepts parameters
     * h  Object = {h:x, s:y, v:z}
     * OR 
     * h, s, v
     */
    hsv_to_rgb: function hsv_to_rgb(h, s, v) {
      if (v > 1.0) v = 1.0;
      var hp = h / 60.0;
      var c = v * s;
      var x = c * (1 - Math.abs(hp % 2 - 1));
      var rgb = [0, 0, 0];

      if (0 <= hp && hp < 1) rgb = [c, x, 0];
      if (1 <= hp && hp < 2) rgb = [x, c, 0];
      if (2 <= hp && hp < 3) rgb = [0, c, x];
      if (3 <= hp && hp < 4) rgb = [0, x, c];
      if (4 <= hp && hp < 5) rgb = [x, 0, c];
      if (5 <= hp && hp < 6) rgb = [c, 0, x];

      var m = v - c;
      rgb[0] += m;
      rgb[1] += m;
      rgb[2] += m;

      return {
        r: Math.round(rgb[0] * 255),
        g: Math.round(rgb[1] * 255),
        b: Math.round(rgb[2] * 255)
      };
    },

    HSVtoRGB: function HSVtoRGB(h, s, v) {
      var r, g, b, i, f, p, q, t;
      if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
      }
      i = Math.floor(h * 6);
      f = h * 6 - i;
      p = v * (1 - s);
      q = v * (1 - f * s);
      t = v * (1 - (1 - f) * s);
      switch (i % 6) {
        case 0:
          r = v, g = t, b = p;break;
        case 1:
          r = q, g = v, b = p;break;
        case 2:
          r = p, g = v, b = t;break;
        case 3:
          r = p, g = q, b = v;break;
        case 4:
          r = t, g = p, b = v;break;
        case 5:
          r = v, g = p, b = q;break;
      }
      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      };
    },

    mandelbrotSetLine: function mandelbrotSetLine(ctx, imageData, centerX, centerY, increment, maxIterations, escapePoint, iterateY, height, width) {
      var _this = this;

      var startX = centerX - width / 2 * increment;
      var startY = centerY - height / 2 * increment;
      var endX = centerX + width / 2 * increment;
      var endY = centerY + height / 2 * increment;

      for (var iterateX = 0; iterateX < width; ++iterateX) {
        var x = startX + (endX - startX) * iterateX / (width - 1);
        var y = startY + (endY - startY) * iterateY / (height - 1);

        var iterations = this.fastMandelbrotPixel(x, y, maxIterations, escapePoint);
        var r = 0;
        var g = 0;
        var b = 0;
        var a = 255;

        if (iterations != null) {
          var color = this.hsv_to_rgb(360.0 * iterations / maxIterations, 1.0, 1.0);
          r = color['r'];
          g = color['g'];
          b = color['b'];
        }

        this.setPixel(imageData, iterateX, iterateY, r, g, b, a);
      }

      ctx.putImageData(imageData, 0, 0); // at coords 0,0

      if (iterateY < height) {
        (function () {
          var self = _this;
          setTimeout(function () {
            self.mandelbrotSetLine(ctx, imageData, centerX, centerY, increment, maxIterations, escapePoint, iterateY + 1, height, width);
          }, 0);
        })();
      }
    },

    mandelbrotSet: function mandelbrotSet() {
      var ctx = this.get('ctx');
      var width = this.get('width');
      var height = this.get('height');
      var maxIterations = this.get('maxIterations');
      var centerX = this.get('centerX');
      var centerY = this.get('centerY');
      var increment = this.get('increment');
      var escapePoint = this.get('escapePoint');

      var imageData = ctx.createImageData(width, height);

      var self = this;
      setTimeout(function () {
        self.mandelbrotSetLine(ctx, imageData, centerX, centerY, increment, maxIterations, escapePoint, 0, height, width);
      }, 0);
    },

    setCanvas: Ember['default'].on('didInsertElement', function () {
      var canvas = this.get('element');
      this.set('canvas', canvas);
      this.set('ctx', canvas.getContext('2d'));
    }),

    click: function click(event) {
      var width = this.get('width');
      var height = this.get('height');
      var centerX = this.get('centerX');
      var centerY = this.get('centerY');
      var increment = this.get('increment');
      this.setProperties({
        centerX: centerX + (event.offsetX - width / 2) * increment,
        centerY: centerY + (event.offsetY - height / 2) * increment,
        increment: increment * 0.25
      });
      this.set('startCalculation', true);
      return false;
    },

    contextMenu: function contextMenu(event) {
      var width = this.get('width');
      var height = this.get('height');
      var centerX = this.get('centerX');
      var centerY = this.get('centerY');
      var increment = this.get('increment');
      this.setProperties({
        centerX: centerX + (event.offsetX - width / 2) * increment,
        centerY: centerY + (event.offsetY - height / 2) * increment,
        increment: increment / 0.25
      });
      this.set('startCalculation', true);
      return false;
    }
  });

});
define('mandelbrot/components/mandelbrot-interface', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    centerX: -0.5,
    centerY: 0.0,
    increment: 0.0046875,
    maxIterations: 1000,
    escapePoint: 2.0,

    actions: {
      calculate: function calculate() {
        this.get('parentView').send('calculate', this.get('centerX'), this.get('centerY'), this.get('increment'), this.get('maxIterations'), this.get('escapePoint'));
      }
    }
  });

});
define('mandelbrot/components/mandelbrot-set', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    centerX: null,
    centerY: null,
    increment: null,
    maxIterations: null,
    escapePoint: null,
    startCalculation: false,

    setCanvas: Ember['default'].on('didInsertElement', function () {
      Ember['default'].run.scheduleOnce('afterRender', this, function () {
        this.send('calculate', -0.5, 0.0, 0.0046875, 180, 30.1);
      });
    }),

    actions: {
      calculate: function calculate(centerX, centerY, increment, maxIterations, escapePoint) {
        this.setProperties({ centerX: centerX, centerY: centerY, increment: increment, maxIterations: maxIterations, escapePoint: escapePoint });
        this.set('startCalculation', true);
      }
    }
  });

});
define('mandelbrot/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('mandelbrot/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('mandelbrot/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'mandelbrot/config/environment'], function (exports, initializerFactory, config) {

  'use strict';

  var _config$APP = config['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;

  exports['default'] = {
    name: 'App Version',
    initialize: initializerFactory['default'](name, version)
  };

});
define('mandelbrot/initializers/export-application-global', ['exports', 'ember', 'mandelbrot/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    if (config['default'].exportApplicationGlobal !== false) {
      var value = config['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember['default'].String.classify(config['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  ;

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('mandelbrot/router', ['exports', 'ember', 'mandelbrot/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {});

  exports['default'] = Router;

});
define('mandelbrot/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 3,
            "column": 0
          }
        },
        "moduleName": "mandelbrot/templates/application.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        morphs[1] = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [
        ["content","mandelbrot-set",["loc",[null,[1,0],[1,18]]]],
        ["content","outlet",["loc",[null,[2,0],[2,10]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('mandelbrot/templates/components/canvas-element', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "mandelbrot/templates/components/canvas-element.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [
        ["content","yield",["loc",[null,[1,0],[1,9]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('mandelbrot/templates/components/mandelbrot-canvas', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 4,
            "column": 0
          }
        },
        "moduleName": "mandelbrot/templates/components/mandelbrot-canvas.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        morphs[1] = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [
        ["content","yield",["loc",[null,[1,0],[1,9]]]],
        ["content","canvas-element",["loc",[null,[3,0],[3,18]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('mandelbrot/templates/components/mandelbrot-interface', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 11,
            "column": 0
          }
        },
        "moduleName": "mandelbrot/templates/components/mandelbrot-interface.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\nCenter X: ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\nCenter Y: ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\nIncrement: ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\nMax Iterations: ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\nEscape Point: ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        var el3 = dom.createTextNode("Calculate");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [2]);
        var element1 = dom.childAt(element0, [21]);
        var morphs = new Array(7);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        morphs[1] = dom.createMorphAt(element0,1,1);
        morphs[2] = dom.createMorphAt(element0,5,5);
        morphs[3] = dom.createMorphAt(element0,9,9);
        morphs[4] = dom.createMorphAt(element0,13,13);
        morphs[5] = dom.createMorphAt(element0,17,17);
        morphs[6] = dom.createElementMorph(element1);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [
        ["content","yield",["loc",[null,[1,0],[1,9]]]],
        ["inline","input",[["get","centerX",["loc",[null,[4,18],[4,25]]]]],["value",["subexpr","@mut",[["get","centerX",["loc",[null,[4,32],[4,39]]]]],[],[]]],["loc",[null,[4,10],[4,41]]]],
        ["inline","input",[["get","centerY",["loc",[null,[5,18],[5,25]]]]],["value",["subexpr","@mut",[["get","centerY",["loc",[null,[5,32],[5,39]]]]],[],[]]],["loc",[null,[5,10],[5,41]]]],
        ["inline","input",[["get","increment",["loc",[null,[6,19],[6,28]]]]],["value",["subexpr","@mut",[["get","increment",["loc",[null,[6,35],[6,44]]]]],[],[]]],["loc",[null,[6,11],[6,46]]]],
        ["inline","input",[["get","maxIterations",["loc",[null,[7,24],[7,37]]]]],["value",["subexpr","@mut",[["get","maxIterations",["loc",[null,[7,44],[7,57]]]]],[],[]]],["loc",[null,[7,16],[7,59]]]],
        ["inline","input",[["get","escapePoint",["loc",[null,[8,22],[8,33]]]]],["value",["subexpr","@mut",[["get","escapePoint",["loc",[null,[8,40],[8,51]]]]],[],[]]],["loc",[null,[8,14],[8,53]]]],
        ["element","action",["calculate"],[],["loc",[null,[9,8],[9,30]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('mandelbrot/templates/components/mandelbrot-set', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 5,
            "column": 0
          }
        },
        "moduleName": "mandelbrot/templates/components/mandelbrot-set.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        morphs[1] = dom.createMorphAt(fragment,2,2,contextualElement);
        morphs[2] = dom.createMorphAt(fragment,4,4,contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [
        ["content","yield",["loc",[null,[1,0],[1,9]]]],
        ["inline","mandelbrot-canvas",[],["centerX",["subexpr","@mut",[["get","centerX",["loc",[null,[3,28],[3,35]]]]],[],[]],"centerY",["subexpr","@mut",[["get","centerY",["loc",[null,[3,44],[3,51]]]]],[],[]],"increment",["subexpr","@mut",[["get","increment",["loc",[null,[3,62],[3,71]]]]],[],[]],"maxIterations",["subexpr","@mut",[["get","maxIterations",["loc",[null,[3,86],[3,99]]]]],[],[]],"escapePoint",["subexpr","@mut",[["get","escapePoint",["loc",[null,[3,112],[3,123]]]]],[],[]],"startCalculation",["subexpr","@mut",[["get","startCalculation",["loc",[null,[3,141],[3,157]]]]],[],[]]],["loc",[null,[3,0],[3,159]]]],
        ["inline","mandelbrot-interface",[],["centerX",["subexpr","@mut",[["get","centerX",["loc",[null,[4,31],[4,38]]]]],[],[]],"centerY",["subexpr","@mut",[["get","centerY",["loc",[null,[4,47],[4,54]]]]],[],[]],"increment",["subexpr","@mut",[["get","increment",["loc",[null,[4,65],[4,74]]]]],[],[]],"maxIterations",["subexpr","@mut",[["get","maxIterations",["loc",[null,[4,89],[4,102]]]]],[],[]],"escapePoint",["subexpr","@mut",[["get","escapePoint",["loc",[null,[4,115],[4,126]]]]],[],[]]],["loc",[null,[4,0],[4,128]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('mandelbrot/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('mandelbrot/tests/components/canvas-element.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/canvas-element.js should pass jshint', function() { 
    ok(true, 'components/canvas-element.js should pass jshint.'); 
  });

});
define('mandelbrot/tests/components/mandelbrot-canvas.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/mandelbrot-canvas.js should pass jshint', function() { 
    ok(false, 'components/mandelbrot-canvas.js should pass jshint.\ncomponents/mandelbrot-canvas.js: line 15, col 40, Expected \'===\' and instead saw \'==\'.\ncomponents/mandelbrot-canvas.js: line 61, col 13, Expected \'===\' and instead saw \'==\'.\ncomponents/mandelbrot-canvas.js: line 85, col 20, Expected \'{\' and instead saw \'v\'.\ncomponents/mandelbrot-canvas.js: line 91, col 26, Expected \'{\' and instead saw \'rgb\'.\ncomponents/mandelbrot-canvas.js: line 92, col 26, Expected \'{\' and instead saw \'rgb\'.\ncomponents/mandelbrot-canvas.js: line 93, col 26, Expected \'{\' and instead saw \'rgb\'.\ncomponents/mandelbrot-canvas.js: line 94, col 26, Expected \'{\' and instead saw \'rgb\'.\ncomponents/mandelbrot-canvas.js: line 95, col 26, Expected \'{\' and instead saw \'rgb\'.\ncomponents/mandelbrot-canvas.js: line 96, col 26, Expected \'{\' and instead saw \'rgb\'.\ncomponents/mandelbrot-canvas.js: line 113, col 33, Expected an assignment or function call and instead saw an expression.\ncomponents/mandelbrot-canvas.js: line 121, col 35, Expected an assignment or function call and instead saw an expression.\ncomponents/mandelbrot-canvas.js: line 122, col 35, Expected an assignment or function call and instead saw an expression.\ncomponents/mandelbrot-canvas.js: line 123, col 35, Expected an assignment or function call and instead saw an expression.\ncomponents/mandelbrot-canvas.js: line 124, col 35, Expected an assignment or function call and instead saw an expression.\ncomponents/mandelbrot-canvas.js: line 125, col 35, Expected an assignment or function call and instead saw an expression.\ncomponents/mandelbrot-canvas.js: line 126, col 35, Expected an assignment or function call and instead saw an expression.\ncomponents/mandelbrot-canvas.js: line 166, col 127, Missing semicolon.\ncomponents/mandelbrot-canvas.js: line 185, col 120, Missing semicolon.\n\n18 errors'); 
  });

});
define('mandelbrot/tests/components/mandelbrot-interface.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/mandelbrot-interface.js should pass jshint', function() { 
    ok(true, 'components/mandelbrot-interface.js should pass jshint.'); 
  });

});
define('mandelbrot/tests/components/mandelbrot-set.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/mandelbrot-set.js should pass jshint', function() { 
    ok(true, 'components/mandelbrot-set.js should pass jshint.'); 
  });

});
define('mandelbrot/tests/helpers/resolver', ['exports', 'ember/resolver', 'mandelbrot/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('mandelbrot/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('mandelbrot/tests/helpers/start-app', ['exports', 'ember', 'mandelbrot/app', 'mandelbrot/config/environment'], function (exports, Ember, Application, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('mandelbrot/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('mandelbrot/tests/integration/components/canvas-element-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('canvas-element', 'Integration | Component | canvas element', {
    integration: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'revision': 'Ember@1.13.7',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 18
            }
          }
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'canvas-element', ['loc', [null, [1, 0], [1, 18]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template((function () {
      var child0 = (function () {
        return {
          meta: {
            'revision': 'Ember@1.13.7',
            'loc': {
              'source': null,
              'start': {
                'line': 2,
                'column': 4
              },
              'end': {
                'line': 4,
                'column': 4
              }
            }
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode('      template block text\n');
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();

      return {
        meta: {
          'revision': 'Ember@1.13.7',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['block', 'canvas-element', [], [], 0, null, ['loc', [null, [2, 4], [4, 23]]]]],
        locals: [],
        templates: [child0]
      };
    })()));

    assert.equal(this.$().text().trim(), 'template block text');
  });

});
define('mandelbrot/tests/integration/components/canvas-element-test.jshint', function () {

  'use strict';

  module('JSHint - integration/components');
  test('integration/components/canvas-element-test.js should pass jshint', function() { 
    ok(true, 'integration/components/canvas-element-test.js should pass jshint.'); 
  });

});
define('mandelbrot/tests/integration/components/mandelbrot-canvas-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('mandelbrot-canvas', 'Integration | Component | mandelbrot canvas', {
    integration: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'revision': 'Ember@1.13.7',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 21
            }
          }
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'mandelbrot-canvas', ['loc', [null, [1, 0], [1, 21]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template((function () {
      var child0 = (function () {
        return {
          meta: {
            'revision': 'Ember@1.13.7',
            'loc': {
              'source': null,
              'start': {
                'line': 2,
                'column': 4
              },
              'end': {
                'line': 4,
                'column': 4
              }
            }
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode('      template block text\n');
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();

      return {
        meta: {
          'revision': 'Ember@1.13.7',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['block', 'mandelbrot-canvas', [], [], 0, null, ['loc', [null, [2, 4], [4, 26]]]]],
        locals: [],
        templates: [child0]
      };
    })()));

    assert.equal(this.$().text().trim(), 'template block text');
  });

});
define('mandelbrot/tests/integration/components/mandelbrot-canvas-test.jshint', function () {

  'use strict';

  module('JSHint - integration/components');
  test('integration/components/mandelbrot-canvas-test.js should pass jshint', function() { 
    ok(true, 'integration/components/mandelbrot-canvas-test.js should pass jshint.'); 
  });

});
define('mandelbrot/tests/integration/components/mandelbrot-interface-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('mandelbrot-interface', 'Integration | Component | mandelbrot interface', {
    integration: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'revision': 'Ember@1.13.7',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 24
            }
          }
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'mandelbrot-interface', ['loc', [null, [1, 0], [1, 24]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template((function () {
      var child0 = (function () {
        return {
          meta: {
            'revision': 'Ember@1.13.7',
            'loc': {
              'source': null,
              'start': {
                'line': 2,
                'column': 4
              },
              'end': {
                'line': 4,
                'column': 4
              }
            }
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode('      template block text\n');
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();

      return {
        meta: {
          'revision': 'Ember@1.13.7',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['block', 'mandelbrot-interface', [], [], 0, null, ['loc', [null, [2, 4], [4, 29]]]]],
        locals: [],
        templates: [child0]
      };
    })()));

    assert.equal(this.$().text().trim(), 'template block text');
  });

});
define('mandelbrot/tests/integration/components/mandelbrot-interface-test.jshint', function () {

  'use strict';

  module('JSHint - integration/components');
  test('integration/components/mandelbrot-interface-test.js should pass jshint', function() { 
    ok(true, 'integration/components/mandelbrot-interface-test.js should pass jshint.'); 
  });

});
define('mandelbrot/tests/integration/components/mandelbrot-set-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('mandelbrot-set', 'Integration | Component | mandelbrot set', {
    integration: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'revision': 'Ember@1.13.7',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 18
            }
          }
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'mandelbrot-set', ['loc', [null, [1, 0], [1, 18]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template((function () {
      var child0 = (function () {
        return {
          meta: {
            'revision': 'Ember@1.13.7',
            'loc': {
              'source': null,
              'start': {
                'line': 2,
                'column': 4
              },
              'end': {
                'line': 4,
                'column': 4
              }
            }
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode('      template block text\n');
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();

      return {
        meta: {
          'revision': 'Ember@1.13.7',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['block', 'mandelbrot-set', [], [], 0, null, ['loc', [null, [2, 4], [4, 23]]]]],
        locals: [],
        templates: [child0]
      };
    })()));

    assert.equal(this.$().text().trim(), 'template block text');
  });

});
define('mandelbrot/tests/integration/components/mandelbrot-set-test.jshint', function () {

  'use strict';

  module('JSHint - integration/components');
  test('integration/components/mandelbrot-set-test.js should pass jshint', function() { 
    ok(true, 'integration/components/mandelbrot-set-test.js should pass jshint.'); 
  });

});
define('mandelbrot/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('mandelbrot/tests/test-helper', ['mandelbrot/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('mandelbrot/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('mandelbrot/config/environment', ['ember'], function(Ember) {
  var prefix = 'mandelbrot';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("mandelbrot/tests/test-helper");
} else {
  require("mandelbrot/app")["default"].create({"name":"mandelbrot","version":"0.0.0+67437f5e"});
}

/* jshint ignore:end */
//# sourceMappingURL=mandelbrot.map