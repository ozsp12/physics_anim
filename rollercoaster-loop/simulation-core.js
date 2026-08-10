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

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function cubic(p0, p1, p2, p3, t) {
    const u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
    };
  }

  function buildRamp(height, radius, samples = 700) {
    if (!(height >= 0)) throw new RangeError('height must be nonnegative');
    if (!(radius > 0)) throw new RangeError('radius must be positive');
    const lengthScale = Math.max(3.2 * radius, 4.2);
    const p0 = { x: -lengthScale, y: height };
    const p1 = { x: -0.83 * lengthScale, y: 0.55 * height };
    const p2 = { x: -0.42 * lengthScale, y: 0 };
    const p3 = { x: 0, y: 0 };
    const points = [];
    let total = 0;
    let previous = cubic(p0, p1, p2, p3, 0);
    points.push({ ...previous, s: 0 });
    for (let i = 1; i <= samples; i++) {
      const point = cubic(p0, p1, p2, p3, i / samples);
      total += Math.hypot(point.x - previous.x, point.y - previous.y);
      points.push({ ...point, s: total });
      previous = point;
    }
    return { points, length: total };
  }

  function sampleRamp(ramp, s) {
    const target = clamp(s, 0, ramp.length);
    let lo = 0;
    let hi = ramp.points.length - 1;
    while (lo + 1 < hi) {
      const mid = (lo + hi) >> 1;
      if (ramp.points[mid].s < target) lo = mid;
      else hi = mid;
    }
    const a = ramp.points[lo];
    const b = ramp.points[hi];
    const span = Math.max(1e-12, b.s - a.s);
    const t = (target - a.s) / span;
    return {
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      tx: (b.x - a.x) / span,
      ty: (b.y - a.y) / span
    };
  }

  function stepRampState(state, ramp, dt = PRODUCTION_DT, gravity = physics.G) {
    if (!(dt > 0)) throw new RangeError('dt must be positive');
    const current = sampleRamp(ramp, state.s);
    const acceleration = -gravity * current.ty;
    const speed = state.speed + acceleration * dt;
    const s = clamp(state.s + speed * dt, 0, ramp.length);
    const point = sampleRamp(ramp, s);
    return { s, speed, x: point.x, y: point.y, tx: point.tx, ty: point.ty, acceleration };
  }

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

  function simulateLoop({ height, radius, dt = PRODUCTION_DT, gravity = physics.G, maxTime = 20, initialSpeed = null }) {
    const analyticalSpeedSquared = physics.speedSquaredFromEnergy(height, radius, 0, gravity);
    let state = {
      radius,
      theta: 0,
      speed: initialSpeed === null ? Math.sqrt(Math.max(0, analyticalSpeedSquared)) : Math.max(0, initialSpeed),
      x: 0,
      y: 0,
      normalAcceleration: 0
    };
    state.normalAcceleration = physics.normalAccelerationFromState(state.speed, radius, 0, gravity);
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

  function simulateRampToLoop({ height, radius, dt = PRODUCTION_DT, gravity = physics.G, maxTime = 20 }) {
    const ramp = buildRamp(height, radius);
    let state = { s: 0, speed: 0, ...sampleRamp(ramp, 0) };
    let time = 0;
    let maxRelativeEnergyDrift = 0;
    const referenceEnergy = gravity * height;
    while (time < maxTime && state.s < ramp.length) {
      state = stepRampState(state, ramp, dt, gravity);
      time += dt;
      const energy = 0.5 * state.speed * state.speed + gravity * state.y;
      maxRelativeEnergyDrift = Math.max(
        maxRelativeEnergyDrift,
        Math.abs(energy - referenceEnergy) / Math.max(Math.abs(referenceEnergy), 1e-12)
      );
    }
    return {
      ramp,
      state,
      time,
      reachedLoop: state.s >= ramp.length - 1e-10,
      maxRelativeEnergyDrift,
      analyticalEntrySpeed: Math.sqrt(Math.max(0, 2 * gravity * height))
    };
  }

  return Object.freeze({
    PRODUCTION_DT,
    ENERGY_DRIFT_LIMIT,
    buildRamp,
    sampleRamp,
    stepRampState,
    mechanicalEnergyPerMass,
    stepLoopState,
    simulateLoop,
    simulateRampToLoop
  });
});
