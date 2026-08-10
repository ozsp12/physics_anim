'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const physics = require('../physics-model.js');

const {
  G,
  CRITICAL_RATIO,
  SIDE_LIMIT_RATIO,
  criticalHeight,
  speedSquaredFromEnergy,
  normalAccelerationFromState,
  classify,
  turningAngle,
  detachmentAngle,
  score,
  shouldDetach
} = physics;

test('canonical regime ratios are centralized', () => {
  assert.equal(SIDE_LIMIT_RATIO, 1);
  assert.equal(CRITICAL_RATIO, 2.5);
});

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

test('turning and detachment angles are supplied by the physics model', () => {
  assert.ok(Math.abs(turningAngle(1, 2) - Math.acos(0.5)) < 1e-12);
  assert.ok(Math.abs(detachmentAngle(1.8, 1) - Math.acos((2 - 3.6) / 3)) < 1e-12);
  assert.equal(detachmentAngle(2.5, 1), null);
});

test('score uses analytical completion regime', () => {
  assert.equal(score(2.49, 1), 0);
  assert.equal(score(2.5, 1), 1000);
  assert.ok(score(3, 1) < 1000 && score(3, 1) > 0);
});

test('zero-speed side limit is not interpreted as detachment', () => {
  assert.equal(shouldDetach({ theta: Math.PI / 2, speed: 0, normalAcceleration: -1e-4 }), false);
});

test('negative normal reaction with positive speed triggers detachment', () => {
  assert.equal(shouldDetach({ theta: Math.PI / 2, speed: 2, normalAcceleration: -0.1 }), true);
});

test('small numerical contact noise does not trigger detachment', () => {
  assert.equal(shouldDetach({ theta: Math.PI, speed: 1, normalAcceleration: -1e-4 }), false);
});
