(function (root, factory) {
  'use strict';

  const api = factory();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.VerticalLoopPhysics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const G = 9.81;
  const CONTACT_TOLERANCE = 1e-3 * G;
  const SPEED_TOLERANCE = 1e-6;

  function requirePositiveRadius(radius) {
    if (!(radius > 0)) {
      throw new RangeError('radius must be positive');
    }
  }

  function criticalHeight(radius) {
    requirePositiveRadius(radius);
    return 2.5 * radius;
  }

  function loopHeight(radius, theta) {
    requirePositiveRadius(radius);
    return radius * (1 - Math.cos(theta));
  }

  function speedSquaredFromEnergy(height, radius, theta, gravity = G) {
    requirePositiveRadius(radius);
    return 2 * gravity * (height - loopHeight(radius, theta));
  }

  function normalAccelerationFromState(speed, radius, theta, gravity = G) {
    requirePositiveRadius(radius);
    return speed * speed / radius + gravity * Math.cos(theta);
  }

  function tangentialAcceleration(theta, gravity = G) {
    return -gravity * Math.sin(theta);
  }

  function classify(height, radius, tolerance = 1e-12) {
    requirePositiveRadius(radius);
    const q = height / radius;
    if (q < 1 - tolerance) return 'return';
    if (Math.abs(q - 1) <= tolerance) return 'side_limit';
    if (q < 2.5 - tolerance) return 'detach';
    if (Math.abs(q - 2.5) <= tolerance) return 'critical';
    return 'complete';
  }

  function shouldDetach({
    theta,
    speed,
    normalAcceleration,
    contactTolerance = CONTACT_TOLERANCE,
    speedTolerance = SPEED_TOLERANCE,
    minimumAngle = 0.02
  }) {
    return theta > minimumAngle
      && speed > speedTolerance
      && normalAcceleration < -contactTolerance;
  }

  return Object.freeze({
    G,
    CONTACT_TOLERANCE,
    SPEED_TOLERANCE,
    criticalHeight,
    loopHeight,
    speedSquaredFromEnergy,
    normalAccelerationFromState,
    tangentialAcceleration,
    classify,
    shouldDetach
  });
});
