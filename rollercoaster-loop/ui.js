(function (root) {
  'use strict';

  const STRINGS = Object.freeze({
    title: 'Vertical Loop — Interactive Simulation',
    heading: 'Vertical loop: energy and contact challenge',
    subtitle: 'Adjust the release height h and loop radius R. Try to complete the loop with the smallest possible height.',
    target: 'Theoretical target: h = 2.5R',
    parameters: 'Parameters', height: 'Release height h', radius: 'Loop radius R', time: 'Simulation speed',
    start: 'Start', pause: 'Pause', resume: 'Resume', reset: 'Reset', replay: 'Play again',
    critical: 'Set critical h = 2.5R', vectors: 'Show force and velocity vectors', trail: 'Show trail', grid: 'Show grid and measurements',
    prediction: 'Prediction', state: 'State', speed: 'Speed', score: 'Score',
    kinetic: 'Kinetic energy', potential: 'Potential energy', mechanical: 'Mechanical energy',
    model: 'Physical model',
    modelText: 'The particle starts from rest and friction is neglected. The ramp and loop are integrated with the same timestep. In the loop, v² = 2g[h − R(1 − cos θ)] and N/m = v²/R + g cos θ. The ideal threshold for completing the loop is h ≥ 5R/2.',
    shortcuts: 'Shortcuts: Space starts or pauses; R resets. The body is treated as a sliding point particle, not a rolling sphere.',
    ready: 'Ready', ramp: 'Descending', rampBack: 'Returning', loop: 'In loop', projectile: 'Free flight', exit: 'Loop complete', done: 'Finished', completed: 'Completed',
    prompt: 'Press Start or the Space bar', running: 'Simulation running', paused: 'Simulation paused', lost: 'Contact lost: ballistic motion',
    loopComplete: 'Loop complete', returnStart: 'The particle returned to the starting point', recontact: 'The particle met the track again after losing contact', ground: 'The particle reached ground level',
    predReturn: 'Returns on the track', predSide: 'Side limit', predDetach: 'Loses contact', predCritical: 'Critical case', predComplete: 'Completes the loop',
    predReturnText: angle => `Kinetic energy vanishes at approximately θ = ${angle}°.` ,
    predSideText: 'The particle reaches the side point with zero speed.',
    predDetachText: angle => `The normal force vanishes before the top, at approximately θ = ${angle}°.` ,
    predCriticalText: 'At the top, the normal force is zero in the ideal model. In exact arithmetic, the particle completes the loop.',
    predCompleteText: margin => `There is a positive contact margin at the top. The height exceeds the minimum by ${margin} m.`
  });

  function createUI(physics) {
    const locale = 'en-US';
    const t = STRINGS;
    const el = {};
    document.querySelectorAll('[id]').forEach(node => { el[node.id] = node; });

    function format(value, digits = 2) {
      return Number(value).toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
    }

    function applyLanguage() {
      document.documentElement.lang = 'en';
      document.title = t.title;
      const map = {
        pageHeading: t.heading, pageSubtitle: t.subtitle, challengeChip: t.target, parametersTitle: t.parameters,
        heightLabel: t.height, radiusLabel: t.radius, timeLabel: t.time, playButton: t.start, resetButton: t.reset,
        criticalButton: t.critical, vectorsLabel: t.vectors, trailLabel: t.trail, gridLabel: t.grid, predictionHeading: t.prediction,
        stateLabel: t.state, speedLabel: t.speed, scoreLabel: t.score, kineticLabel: t.kinetic, potentialLabel: t.potential,
        totalLabel: t.mechanical, modelSummary: t.model, modelText: t.modelText, footerText: t.shortcuts
      };
      Object.entries(map).forEach(([id, value]) => { if (el[id]) el[id].textContent = value; });
    }

    function prediction(height, radius) {
      const regime = physics.classify(height, radius);
      const margin = format(height - physics.criticalHeight(radius), 2);
      let title; let text;
      if (regime === 'return') {
        title = t.predReturn;
        text = t.predReturnText(format(physics.turningAngle(height, radius) * 180 / Math.PI, 1));
      } else if (regime === 'side_limit') {
        title = t.predSide; text = t.predSideText;
      } else if (regime === 'detach') {
        title = t.predDetach;
        text = t.predDetachText(format(physics.detachmentAngle(height, radius) * 180 / Math.PI, 1));
      } else if (regime === 'critical') {
        title = t.predCritical; text = t.predCriticalText;
      } else {
        title = t.predComplete; text = t.predCompleteText(margin);
      }
      el.predictionTitle.textContent = title;
      el.predictionText.textContent = text;
    }

    function phaseLabel(phase, completed) {
      if (phase === 'done' && completed) return t.completed;
      return t[phase] || phase;
    }

    function announce(text) {
      if (el.statusAnnouncer && el.statusAnnouncer.textContent !== text) el.statusAnnouncer.textContent = text;
    }

    applyLanguage();
    return { locale, t, el, format, prediction, phaseLabel, announce };
  }

  root.VerticalLoopUI = Object.freeze({ createUI });
})(window);
