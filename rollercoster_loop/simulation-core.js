(function (root, factory) {
  'use strict';

  const physics = typeof module !== 'undefined' && module.exports
    ? require('./physics-model.js')
    : root.VerticalLoopPhysics;
  const api = factory(physics);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.VerticalLoopSimulation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (physics) {
  'use strict';

  if (!physics) throw new Error('VerticalLoopPhysics is required');

  const PRODUCTION_DT = 1 / 240;
  const ENERGY_DRIFT_LIMIT = 0.02;

  function mechanicalEnergyPerMass(state, gravity = physics.G) {
    return 0.5 * state.speed * state.speed + gravity * physics.loopHeight(state.radius, state.theta);
  }

  function stepLoopState(state, dt = PRODUCTION_DT, gravity = physics.G) {
    if (!(dt > 0)) throw new RangeError('dt must be positive');
    if (!(state.radius > 0)) throw new RangeError('radius must be positive');
    const speed = state.speed + physics.tangentialAcceleration(state.theta, gravity) * dt;
    const theta = state.theta + (speed / state.radius) * dt;
    const normalAcceleration = physics.normalAccelerationFromState(speed, state.radius, theta, gravity);
    return {
      radius: state.radius,
      theta,
      speed,
      x: state.radius * Math.sin(theta),
      y: state.radius * (1 - Math.cos(theta)),
      normalAcceleration
    };
  }

  function simulateLoop({ height, radius, dt = PRODUCTION_DT, gravity = physics.G, maxTime = 20 }) {
    const initialSpeedSquared = physics.speedSquaredFromEnergy(height, radius, 0, gravity);
    let state = {
      radius,
      theta: 0,
      speed: Math.sqrt(Math.max(0, initialSpeedSquared)),
      x: 0,
      y: 0,
      normalAcceleration: initialSpeedSquared / radius + gravity
    };
    const initialEnergy = mechanicalEnergyPerMass(state, gravity);
    let maxRelativeEnergyDrift = 0;
    let minNormalAcceleration = state.normalAcceleration;
    let time = 0;

    while (time < maxTime && state.theta < 2 * Math.PI) {
      state = stepLoopState(state, dt, gravity);
      time += dt;
      minNormalAcceleration = Math.min(minNormalAcceleration, state.normalAcceleration);
      const energy = mechanicalEnergyPerMass(state, gravity);
      maxRelativeEnergyDrift = Math.max(
        maxRelativeEnergyDrift,
        Math.abs(energy - initialEnergy) / Math.max(Math.abs(initialEnergy), 1e-12)
      );
      if (state.theta <= 0 && state.speed < 0) {
        return { outcome: 'return', state, time, maxRelativeEnergyDrift, minNormalAcceleration };
      }
      if (physics.shouldDetach({ theta: state.theta, speed: state.speed, normalAcceleration: state.normalAcceleration })) {
        return { outcome: 'detach', state, time, maxRelativeEnergyDrift, minNormalAcceleration };
      }
    }

    return {
      outcome: state.theta >= 2 * Math.PI ? 'complete' : 'timeout',
      state,
      time,
      maxRelativeEnergyDrift,
      minNormalAcceleration
    };
  }

  return Object.freeze({ PRODUCTION_DT, ENERGY_DRIFT_LIMIT, mechanicalEnergyPerMass, stepLoopState, simulateLoop });
});
