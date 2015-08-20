import Ember from 'ember';

export default Ember.Component.extend({
  centerX: null,
  centerY: null,
  increment: null,
  maxIterations: null,
  escapePoint: null,
  startCalculation: false,

  setCanvas: Ember.on('didInsertElement', function() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      this.send(
	'calculate',
	-0.5,
	0.0,
	0.0046875,
	180,
	30.1
      );
    });
  }),
  
  actions: {
    calculate: function(centerX, centerY, increment, maxIterations, escapePoint) {
      this.setProperties({centerX, centerY, increment, maxIterations, escapePoint});
      this.set('startCalculation', true);
    }
  }
});
