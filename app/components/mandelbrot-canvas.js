import Ember from 'ember';
import CanvasElement from 'mandelbrot/components/canvas-element';
import math from 'npm:mathjs';

export default CanvasElement.extend({
  centerX: null,
  centerY: null,
  increment: null,
  maxIterations: null,
  escapePoint: null,
  lastCalculation: [],
  startCalculation: false,
  
  theCalculator: Ember.observer('centerX', 'centerY', 'increment', 'maxIterations', 'escapePoint', 'startCalculation', function() {
    if (this.get('startCalculation') == true &&
        this.get('centerX') !== '' &&
	this.get('centerY') !== '' &&
	this.get('increment') !== '' &&
	this.get('maxIterations') !== '' &&
	this.get('escapePoint') !== '') {
      this.set('startCalculation', false);
      this.mandelbrotSet();
    }
  }),

  setPixel: function(imageData, x, y, r, g, b, a) {
    const index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
  },

  mandelbrotPixel: function(x, y, maxIterations) {
    const c = math.complex(x, y);
    let z = math.complex(0, 0);
    let i;
    for (i = 0; i < maxIterations && math.abs(z) < 2.0; ++i) {
      z = math.add(math.multiply(z, z), c);
    }
    return i;
  },

  logBase: 1.0 / Math.log(2.0),
  logHalfBase: Math.log(0.5) * 1.0 / Math.log(2.0),

  fastMandelbrotPixel: function(Cr, Ci, maxIterations, escapePoint) {
    let Zr = 0;
    let Zi = 0;
    let Tr = 0;
    let Ti = 0;
    let n;

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
    for (let e = 0; e < 4; ++e) {
      Zi = 2 * Zr * Zi + Ci;
      Zr = Tr - Ti + Cr;
      Tr = Zr * Zr;
      Ti = Zi * Zi;
    }

    return 5 + n - this.logHalfBase - Math.log(Math.log(Tr+Ti)) * this.logBase;
  },

  /* accepts parameters
   * h  Object = {h:x, s:y, v:z}
   * OR 
   * h, s, v
   */
  hsv_to_rgb:function(h, s, v) {
    if ( v > 1.0 ) v = 1.0;
    var hp = h/60.0;
    var c = v * s;
    var x = c*(1 - Math.abs((hp % 2) - 1));
    var rgb = [0,0,0];

    if ( 0<=hp && hp<1 ) rgb = [c, x, 0];
    if ( 1<=hp && hp<2 ) rgb = [x, c, 0];
    if ( 2<=hp && hp<3 ) rgb = [0, c, x];
    if ( 3<=hp && hp<4 ) rgb = [0, x, c];
    if ( 4<=hp && hp<5 ) rgb = [x, 0, c];
    if ( 5<=hp && hp<6 ) rgb = [c, 0, x];

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
  
  HSVtoRGB: function(h, s, v) {
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
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
  },

  mandelbrotSetLine: function(ctx, imageData, centerX, centerY, increment, maxIterations, escapePoint, iterateY, height, width) {
    const startX = centerX - (width/2 * increment);
    const startY = centerY - (height/2 * increment);
    const endX = centerX + (width/2 * increment);
    const endY = centerY + (height/2 * increment);

    for (let iterateX = 0; iterateX < width; ++iterateX) {
      const x = startX + (endX - startX) * iterateX / (width - 1);
      const y = startY + (endY - startY) * iterateY / (height - 1);

      const iterations = this.fastMandelbrotPixel(x, y, maxIterations, escapePoint);
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 255;

      if (iterations != null) {
	const color = this.hsv_to_rgb(360.0 * iterations / maxIterations, 1.0, 1.0);
	r = color['r'];
	g = color['g'];
	b = color['b'];
      } 

      this.setPixel(imageData, iterateX, iterateY, r, g, b, a);
    }

    ctx.putImageData(imageData, 0, 0); // at coords 0,0

    if (iterateY < height) {
      const self = this;
      setTimeout(function() {
	self.mandelbrotSetLine(ctx, imageData, centerX, centerY, increment, maxIterations, escapePoint, iterateY+1, height, width)
      }, 0);
    }
  },

  mandelbrotSet: function() {
    const ctx = this.get('ctx');
    const width = this.get('width');
    const height = this.get('height');
    const maxIterations = this.get('maxIterations');
    const centerX = this.get('centerX');
    const centerY = this.get('centerY');
    const increment = this.get('increment');
    const escapePoint = this.get('escapePoint');

    const imageData = ctx.createImageData(width, height);

    const self = this;
    setTimeout(function() {
      self.mandelbrotSetLine(ctx, imageData, centerX, centerY, increment, maxIterations, escapePoint, 0, height, width)
    }, 0);
  },

  setCanvas: Ember.on('didInsertElement', function() {
    const canvas = this.get('element');
    this.set('canvas', canvas);
    this.set('ctx', canvas.getContext('2d'));
  }),

  click: function(event) {
    const width = this.get('width');
    const height = this.get('height');
    const centerX = this.get('centerX');
    const centerY = this.get('centerY');
    const increment = this.get('increment');
    this.setProperties({
      centerX: centerX + ((event.offsetX - (width/2)) * increment),
      centerY: centerY + ((event.offsetY - (height/2)) * increment),
      increment: increment * 0.25
    });
    this.set('startCalculation', true);
    return false;
  },

  contextMenu: function(event) {
    const width = this.get('width');
    const height = this.get('height');
    const centerX = this.get('centerX');
    const centerY = this.get('centerY');
    const increment = this.get('increment');
    this.setProperties({
      centerX: centerX + ((event.offsetX - (width/2)) * increment),
      centerY: centerY + ((event.offsetY - (height/2)) * increment),
      increment: increment / 0.25
    });
    this.set('startCalculation', true);
    return false;
  }
});
