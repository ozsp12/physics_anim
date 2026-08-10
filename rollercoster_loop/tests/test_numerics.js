'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const physics = require('../physics-model.js');
const simulation = require('../simulation-core.js');

function relativeError(actual, expected) {
  return Math.abs(actual - expected) / Math.max(Math.abs(expected), 1e-12);
}

test('semi-implicit Euler approximately conserves mechanical energy', () => {
  const result = simulation.simulateLoop({ height: 3.0, radius: 1.0, dt: 1 / 480 });
  assert.equal(result.outcome, 'complete');
  assert.ok(result.maxRelativeEnergyDrift < 0.01, `energy drift ${result.maxRelativeEnergyDrift}`);
});

test('halving the time step improves the top-speed estimate', () => {
  const radius = 1.0;
  const height = 3.0;
  const expectedTopSpeed = Math.sqrt(physics.speedSquaredFromEnergy(height, radius, Math.PI));

  function speedNearTop(dt) {
    let state = {
      radius,
      theta: 0,
      speed: Math.sqrt(physics.speedSquaredFromEnergy(height, radius, 0))
    };
    while (state.theta < Math.PI) {
      state = simulation.stepLoopState(state, dt);
    }
    return state.speed;
  }

  const coarseError = relativeError(speedNearTop(1 / 120), expectedTopSpeed);
  const fineError = relativeError(speedNearTop(1 / 240), expectedTopSpeed);
  assert.ok(fineError < coarseError, `fine=${fineError}, coarse=${coarseError}`);
});

test('numerical contact threshold brackets the analytical h/R = 2.5 limit', () => {
  const below = simulation.simulateLoop({ height: 2.49, radius: 1.0, dt: 1 / 960 });
  const above = simulation.simulateLoop({ height: 2.51, radius: 1.0, dt: 1 / 960 });

  assert.equal(below.outcome, 'detach');
  assert.equal(above.outcome, 'complete');
});
