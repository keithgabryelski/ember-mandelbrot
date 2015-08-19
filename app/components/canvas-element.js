import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'canvas',
  attributeBindings: ['height', 'width'],
  width: 640,
  height: 480,
  canvas: null,
  ctx: null,
});
