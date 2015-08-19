import Ember from 'ember';

export default Ember.Component.extend({
  centerX: -0.5,
  centerY: 0.0,
  increment: 0.0046875,
  maxIterations: 1000,
  escapePoint: 2.0,

  actions: {
    calculate: function() {
      this.get('parentView').send(
	'calculate',
	this.get('centerX'),
	this.get('centerY'),
	this.get('increment'),
	this.get('maxIterations'),
	this.get('escapePoint')
      );
    }
  }
});
