import Ember from 'ember';
import CanvasElement from 'mandelbrot/components/canvas-element';
import math from 'npm:mathjs';

export default CanvasElement.extend({
  centerX: null,
  centerY: null,
  increment: null,
  maxIterations: null,
  escapePoint: null,
  
  theCalculator: Ember.observer('centerX', 'centerY', 'increment', 'maxIterations', 'escapePoint', function() {
    if (this.get('centerX') !== '' &&
	this.get('centerY') !== '' &&
	this.get('increment') !== '' &&
	this.get('maxIterations') !== '' &&
	this.get('escapePoint') !== '') {
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

  fastMandelbrotPixel: function(Cr, Ci, maxIterations, escapePoint) {
    let Zr = 0;
    let Zi = 0;
    let Tr = 0;
    let Ti = 0;
    let n;

    for (n = 1; n < maxIterations && (Tr + Ti) <= escapePoint; ++n) {
      Zi = 2 * Zr * Zi + Ci;
      Zr = Tr - Ti + Cr;
      Tr = Zr * Zr;
      Ti = Zi * Zi;
    }

    return n;
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

    const startX = centerX - (width/2 * increment);
    const startY = centerY - (height/2 * increment);
    const endX = centerX + (width/2 * increment);
    const endY = centerY + (height/2 * increment);

    const data = Array(width*height);

    // Z = Z^2 + C

    let leastValue = maxIterations;

    for (let iterateY = 0; iterateY < height; ++iterateY) {
      for (let iterateX = 0; iterateX < width; ++iterateX) {
	const x = startX + (endX - startX) * iterateX / (width - 1);
	const y = startY + (endY - startY) * iterateY / (height - 1);

	const iterations = this.fastMandelbrotPixel(x, y, maxIterations, escapePoint);
	data[iterateY * width + iterateX] = iterations;
	if (iterations < leastValue) {
	  leastValue = iterations;
	}
      }
    }

    const imageData = ctx.createImageData(width, height);
    // scale the color values

    for (let iterateY = 0; iterateY < height; ++iterateY) {
      for (let iterateX = 0; iterateX < width; ++iterateX) {
	let r = 0;
	let g = 0;
	let b = 0;
	let a = 255;
	const iterations = data[iterateY * width + iterateX];

	if (iterations < maxIterations) {
	  const adjustedValue = iterations - leastValue + 2;
          const color = 5 * math.log(adjustedValue) / math.log((maxIterations - leastValue + 2) - 1.0);
          if (color < 1) {
            r = 255 * color;
            g = 0;
            b = 0;
          } else if (color < 2) {
            r = 255;
            g = 255 * (color - 1);
            b = 0;
          } else if (color < 3) {
            r = 255;
            g = 255;
            b = 255 * (color - 2);
          } else if (color < 4) {
            r = 255;
            g = 255 - (255 * (color - 3));
            b = 255;
          } else {
            r = 255;
            g = 255 * (color - 4);
            b = 0;
          }
	}

	this.setPixel(imageData, iterateX, iterateY, r, g, b, a);
      }
    }

    ctx.putImageData(imageData, 0, 0); // at coords 0,0
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
    return false;
  }
});
