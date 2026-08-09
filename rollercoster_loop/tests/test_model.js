'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const physics = require('../physics-model.js');

const {
  G,
  criticalHeight,
  speedSquaredFromEnergy,
  normalAccelerationFromState,
  classify,
  shouldDetach
} = physics;

test('critical height scales as 5R/2', () => {
  assert.equal(criticalHeight(2), 5);
  assert.equal(criticalHeight(0.8), 2);
});

test('critical top speed satisfies v^2 = gR', () => {
  const R = 2;
  const h = criticalHeight(R);
  assert.ok(Math.abs(speedSquaredFromEnergy(h, R, Math.PI) - G * R) < 1e-12);
});

test('normal reaction vanishes at the critical top', () => {
  const R = 1.7;
  const h = criticalHeight(R);
  const v = Math.sqrt(speedSquaredFromEnergy(h, R, Math.PI));
  assert.ok(Math.abs(normalAccelerationFromState(v, R, Math.PI)) < 1e-12);
});

test('analytical regime classification includes both boundary cases', () => {
  const R = 2;
  assert.equal(classify(0.75 * R, R), 'return');
  assert.equal(classify(1.00 * R, R), 'side_limit');
  assert.equal(classify(1.80 * R, R), 'detach');
  assert.equal(classify(2.50 * R, R), 'critical');
  assert.equal(classify(3.00 * R, R), 'complete');
});

test('zero-speed side limit is not interpreted as detachment', () => {
  assert.equal(shouldDetach({
    theta: Math.PI / 2,
    speed: 0,
    normalAcceleration: -1e-4
  }), false);
});

test('negative normal reaction with positive speed triggers detachment', () => {
  assert.equal(shouldDetach({
    theta: Math.PI / 2,
    speed: 2,
    normalAcceleration: -0.1
  }), true);
});

test('small numerical contact noise does not trigger detachment', () => {
  assert.equal(shouldDetach({
    theta: Math.PI,
    speed: 1,
    normalAcceleration: -1e-4
  }), false);
});
