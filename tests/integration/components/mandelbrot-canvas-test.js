import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mandelbrot-canvas', 'Integration | Component | mandelbrot canvas', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{mandelbrot-canvas}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#mandelbrot-canvas}}
      template block text
    {{/mandelbrot-canvas}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
