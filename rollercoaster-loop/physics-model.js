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
  const CRITICAL_RATIO = 2.5;
  const SIDE_LIMIT_RATIO = 1.0;
  const CONTACT_TOLERANCE = 1e-3 * G;
  const SPEED_TOLERANCE = 1e-6;
  const CLASSIFICATION_TOLERANCE = 1e-9;

  function requirePositiveRadius(radius) {
    if (!(radius > 0)) throw new RangeError('radius must be positive');
  }

  function ratio(height, radius) {
    requirePositiveRadius(radius);
    return height / radius;
  }

  function criticalHeight(radius) {
    requirePositiveRadius(radius);
    return CRITICAL_RATIO * radius;
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

  function classify(height, radius, tolerance = CLASSIFICATION_TOLERANCE) {
    const q = ratio(height, radius);
    if (q < SIDE_LIMIT_RATIO - tolerance) return 'return';
    if (Math.abs(q - SIDE_LIMIT_RATIO) <= tolerance) return 'side_limit';
    if (q < CRITICAL_RATIO - tolerance) return 'detach';
    if (Math.abs(q - CRITICAL_RATIO) <= tolerance) return 'critical';
    return 'complete';
  }

  function turningAngle(height, radius) {
    const q = ratio(height, radius);
    if (q < 0 || q > SIDE_LIMIT_RATIO) return null;
    return Math.acos(Math.max(-1, Math.min(1, 1 - q)));
  }

  function detachmentAngle(height, radius) {
    const q = ratio(height, radius);
    if (!(q > SIDE_LIMIT_RATIO && q < CRITICAL_RATIO)) return null;
    return Math.acos(Math.max(-1, Math.min(1, (2 - 2 * q) / 3)));
  }

  function score(height, radius) {
    const regime = classify(height, radius);
    if (!['critical', 'complete'].includes(regime)) return 0;
    return Math.max(0, Math.min(1000, Math.round(1000 * CRITICAL_RATIO / ratio(height, radius))));
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
    CRITICAL_RATIO,
    SIDE_LIMIT_RATIO,
    CONTACT_TOLERANCE,
    SPEED_TOLERANCE,
    CLASSIFICATION_TOLERANCE,
    ratio,
    criticalHeight,
    loopHeight,
    speedSquaredFromEnergy,
    normalAccelerationFromState,
    tangentialAcceleration,
    classify,
    turningAngle,
    detachmentAngle,
    score,
    shouldDetach
  });
});
