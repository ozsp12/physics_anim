'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const physics = require('../physics-model.js');
const simulation = require('../simulation-core.js');

function relativeError(actual, expected) {
  return Math.abs(actual - expected) / Math.max(Math.abs(expected), 1e-12);
}

test('production timestep is explicit and stable', () => {
  assert.equal(simulation.PRODUCTION_DT, 1 / 240);
  const result = simulation.simulateLoop({ height: 3.0, radius: 1.0 });
  assert.equal(result.outcome, 'complete');
  assert.ok(result.maxRelativeEnergyDrift < simulation.ENERGY_DRIFT_LIMIT,
    `energy drift ${result.maxRelativeEnergyDrift}`);
});

test('production timestep resolves 2.49, 2.50, and 2.51 regimes correctly', () => {
  assert.equal(simulation.simulateLoop({ height: 2.49, radius: 1.0 }).outcome, 'detach');
  assert.equal(simulation.simulateLoop({ height: 2.50, radius: 1.0 }).outcome, 'complete');
  assert.equal(simulation.simulateLoop({ height: 2.51, radius: 1.0 }).outcome, 'complete');
});

test('timestep refinement improves the top-speed estimate', () => {
  const radius = 1.0;
  const height = 3.0;
  const expected = Math.sqrt(physics.speedSquaredFromEnergy(height, radius, Math.PI));
  function speedNearTop(dt) {
    let state = { radius, theta: 0, speed: Math.sqrt(physics.speedSquaredFromEnergy(height, radius, 0)) };
    while (state.theta < Math.PI) state = simulation.stepLoopState(state, dt);
    return state.speed;
  }
  const e120 = relativeError(speedNearTop(1 / 120), expected);
  const e240 = relativeError(speedNearTop(1 / 240), expected);
  const e480 = relativeError(speedNearTop(1 / 480), expected);
  assert.ok(e240 < e120, `e120=${e120}, e240=${e240}`);
  assert.ok(e480 < e240, `e240=${e240}, e480=${e480}`);
});

test('ramp integration reaches the loop continuously at production timestep', () => {
  const result = simulation.simulateRampToLoop({ height: 2.5, radius: 1.0 });
  assert.equal(result.reachedLoop, true);
  assert.ok(result.maxRelativeEnergyDrift < simulation.ENERGY_DRIFT_LIMIT,
    `ramp energy drift ${result.maxRelativeEnergyDrift}`);
  assert.ok(relativeError(result.state.speed, result.analyticalEntrySpeed) < 0.005,
    `entry speed numerical=${result.state.speed}, analytical=${result.analyticalEntrySpeed}`);
});

test('continuous ramp exit still reproduces the critical loop at production timestep', () => {
  const ramp = simulation.simulateRampToLoop({ height: 2.5, radius: 1.0 });
  const loop = simulation.simulateLoop({ height: 2.5, radius: 1.0, initialSpeed: ramp.state.speed });
  assert.equal(loop.outcome, 'complete');
});
