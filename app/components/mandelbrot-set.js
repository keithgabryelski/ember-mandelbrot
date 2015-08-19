import Ember from 'ember';

export default Ember.Component.extend({
  centerX: null,
  centerY: null,
  increment: null,
  maxIterations: null,
  escapePoint: null,

  setCanvas: Ember.on('didInsertElement', function() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      this.send(
	'calculate',
	-0.5,
	0.0,
	0.0046875,
	1000,
	2.0
      );
    });
  }),
  
  actions: {
    calculate: function(centerX, centerY, increment, maxIterations, escapePoint) {
      this.setProperties({centerX, centerY, increment, maxIterations, escapePoint});
    }
  }
});
