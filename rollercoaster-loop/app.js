(function (root) {
  'use strict';

  const physics = root.VerticalLoopPhysics;
  const simulation = root.VerticalLoopSimulation;
  const ui = root.VerticalLoopUI.createUI(physics);
  const el = ui.el;
  const renderer = root.VerticalLoopRenderer.createRenderer(el.simCanvas, el.canvasWrap, ui, simulation);
  const TAU = Math.PI * 2;

  const state = {
    running: false,
    phase: 'ready',
    completed: false,
    t: 0,
    h: Number(el.heightRange.value),
    R: Number(el.radiusRange.value),
    timeScale: Number(el.timeRange.value),
    ramp: null,
    s: 0,
    speed: 0,
    theta: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    normal: 0,
    trail: [],
    showVectors: el.vectorsCheck.checked,
    showTrail: el.trailCheck.checked,
    showGrid: el.gridCheck.checked,
    g: physics.G,
    collisionArmed: false,
    accumulated: 0,
    lastTimestamp: performance.now(),
    lastAnnouncedPhase: null,
    velocityVector() {
      if (['ready','ramp','rampBack'].includes(this.phase)) {
        const p = simulation.sampleRamp(this.ramp, this.s);
        return { x: p.tx * this.speed, y: p.ty * this.speed };
      }
      if (this.phase === 'loop') return { x: Math.cos(this.theta) * this.speed, y: Math.sin(this.theta) * this.speed };
      if (this.phase === 'projectile') return { x: this.vx, y: this.vy };
      if (this.phase === 'exit') return { x: this.speed, y: 0 };
      return { x: 0, y: 0 };
    }
  };

  function setMessage(text, announce = false) {
    el.canvasMessage.textContent = text;
    if (announce) ui.announce(text);
  }

  function updateSummary() {
    const summary = `${ui.phaseLabel(state.phase, state.completed)}. h/R ${ui.format(state.h / state.R, 3)}. ${ui.t.speed}: ${ui.format(Math.abs(state.speed))} m/s.`;
    el.simulationSummary.textContent = summary;
  }

  function updatePrediction() {
    ui.prediction(state.h, state.R);
  }

  function updateHud() {
    el.heightValue.textContent = `${ui.format(state.h)} m`;
    el.radiusValue.textContent = `${ui.format(state.R)} m`;
    el.timeValue.textContent = `${ui.format(state.timeScale)}×`;
    el.stateMetric.textContent = ui.phaseLabel(state.phase, state.completed);
    el.ratioMetric.textContent = ui.format(state.h / state.R, 3);
    el.speedMetric.textContent = `${ui.format(Math.abs(state.speed))} m/s`;
    el.normalMetric.textContent = ['loop'].includes(state.phase) ? `${ui.format(Math.max(0, state.normal))} m/s²` : '—';
    el.rawNormalMetric.textContent = ['loop'].includes(state.phase) ? `${ui.format(state.normal, 4)} m/s²` : '—';
    el.scoreMetric.textContent = String(physics.score(state.h, state.R));
    const total = Math.max(physics.G * state.h, 1e-12);
    const kinetic = 0.5 * (state.phase === 'projectile' ? state.vx * state.vx + state.vy * state.vy : state.speed * state.speed);
    const potential = physics.G * Math.max(0, state.y);
    const values = [
      [el.kineticBar, el.kineticText, 100 * kinetic / total],
      [el.potentialBar, el.potentialText, 100 * potential / total],
      [el.totalBar, el.totalText, 100 * (kinetic + potential) / total]
    ];
    values.forEach(([bar,text,value]) => { const pct=Math.max(0,Math.min(120,value)); bar.style.width=`${Math.min(100,pct)}%`; text.textContent=`${Math.round(pct)}%`; });
    updateSummary();
  }

  function reset(startImmediately = false) {
    state.running = false;
    state.phase = 'ready';
    state.completed = false;
    state.t = 0;
    state.s = 0;
    state.speed = 0;
    state.theta = 0;
    state.vx = 0;
    state.vy = 0;
    state.normal = 0;
    state.trail = [];
    state.collisionArmed = false;
    state.accumulated = 0;
    state.ramp = simulation.buildRamp(state.h, state.R);
    const p = simulation.sampleRamp(state.ramp, 0);
    state.x = p.x; state.y = p.y;
    el.playButton.textContent = ui.t.start;
    setMessage(ui.t.prompt);
    updatePrediction(); updateHud(); renderer.resize(state);
    if (startImmediately) togglePlay();
  }

  function togglePlay() {
    if (state.phase === 'done') reset(false);
    state.running = !state.running;
    if (state.running) {
      if (state.phase === 'ready') state.phase = 'ramp';
      el.playButton.textContent = ui.t.pause;
      setMessage(ui.t.running, true);
      state.lastTimestamp = performance.now();
    } else {
      el.playButton.textContent = state.phase === 'ready' ? ui.t.start : ui.t.resume;
      setMessage(ui.t.paused, true);
    }
  }

  function finish(message) {
    state.running = false;
    state.phase = 'done';
    el.playButton.textContent = ui.t.replay;
    setMessage(message, true);
  }

  function enterLoop() {
    state.phase = 'loop';
    state.theta = 0;
    state.x = 0; state.y = 0;
    state.normal = physics.normalAccelerationFromState(state.speed, state.R, 0, physics.G);
  }

  function detach() {
    state.phase = 'projectile';
    state.vx = state.speed * Math.cos(state.theta);
    state.vy = state.speed * Math.sin(state.theta);
    state.normal = 0;
    state.collisionArmed = false;
    setMessage(ui.t.lost, true);
  }

  function integrateRamp(dt, backward = false) {
    let stepState = simulation.stepRampState({ s: state.s, speed: state.speed }, state.ramp, dt);
    if (backward) {
      const current = simulation.sampleRamp(state.ramp, state.s);
      const acceleration = physics.G * current.ty;
      const speed = state.speed + acceleration * dt;
      const s = Math.max(0, state.s + speed * dt);
      const p = simulation.sampleRamp(state.ramp, s);
      stepState = { s, speed, x: p.x, y: p.y };
    }
    state.s = stepState.s; state.speed = stepState.speed; state.x = stepState.x; state.y = stepState.y;
    if (!backward && state.s >= state.ramp.length - 1e-10) enterLoop();
    else if (backward && state.s <= 0) { state.speed = 0; finish(ui.t.returnStart); }
  }

  function integrateLoop(dt) {
    const next = simulation.stepLoopState({ radius: state.R, theta: state.theta, speed: state.speed }, dt);
    state.speed = next.speed; state.theta = next.theta; state.x = next.x; state.y = next.y; state.normal = next.normalAcceleration;
    if (state.theta <= 0 && state.speed < 0 && state.t > 0.15) {
      state.phase = 'rampBack'; state.s = state.ramp.length; state.speed = -Math.abs(state.speed); return;
    }
    if (physics.shouldDetach({ theta: state.theta, speed: state.speed, normalAcceleration: state.normal })) { detach(); return; }
    if (state.theta >= TAU) {
      state.theta = TAU; state.x = 0; state.y = 0; state.completed = true; state.phase = 'exit'; state.normal = 0; setMessage(ui.t.loopComplete, true);
    }
  }

  function integrateProjectile(dt) {
    state.x += state.vx * dt; state.y += state.vy * dt; state.vy -= physics.G * dt; state.speed = Math.hypot(state.vx, state.vy);
    const distance = Math.hypot(state.x, state.y - state.R);
    if (distance < state.R - 0.02) state.collisionArmed = true;
    if (state.collisionArmed && distance >= state.R) { finish(ui.t.recontact); return; }
    if (state.y <= 0 && state.vy < 0) { state.y = 0; finish(ui.t.ground); }
  }

  function integrateExit(dt) {
    state.x += state.speed * dt; state.y = 0;
    if (state.x > Math.max(2.8 * state.R, 4.2)) finish(`${ui.t.loopComplete} — ${ui.t.score} ${physics.score(state.h, state.R)}`);
  }

  function step(dt) {
    state.t += dt;
    if (state.phase === 'ramp') integrateRamp(dt, false);
    else if (state.phase === 'rampBack') integrateRamp(dt, true);
    else if (state.phase === 'loop') integrateLoop(dt);
    else if (state.phase === 'projectile') integrateProjectile(dt);
    else if (state.phase === 'exit') integrateExit(dt);
    if (state.showTrail && ['ramp','rampBack','loop','projectile','exit'].includes(state.phase)) {
      const last = state.trail[state.trail.length - 1];
      if (!last || Math.hypot(state.x-last.x,state.y-last.y) > 0.035*state.R) {
        state.trail.push({ x: state.x, y: state.y }); if (state.trail.length > 430) state.trail.shift();
      }
    }
    if (state.lastAnnouncedPhase !== state.phase) {
      state.lastAnnouncedPhase = state.phase;
      ui.announce(ui.phaseLabel(state.phase, state.completed));
    }
  }

  function parametersChanged() {
    state.h = Number(el.heightRange.value); state.R = Number(el.radiusRange.value); state.timeScale = Number(el.timeRange.value); reset(false);
  }

  function frame(timestamp) {
    const elapsed = Math.min(0.05, Math.max(0, (timestamp - state.lastTimestamp) / 1000)); state.lastTimestamp = timestamp;
    if (state.running) {
      state.accumulated += elapsed * state.timeScale; let steps = 0;
      while (state.accumulated >= simulation.PRODUCTION_DT && steps < 80) {
        step(simulation.PRODUCTION_DT); state.accumulated -= simulation.PRODUCTION_DT; steps++;
      }
    }
    updateHud(); renderer.draw(state); requestAnimationFrame(frame);
  }

  el.heightRange.addEventListener('input', parametersChanged);
  el.radiusRange.addEventListener('input', parametersChanged);
  el.timeRange.addEventListener('input', () => { state.timeScale = Number(el.timeRange.value); updateHud(); });
  el.playButton.addEventListener('click', togglePlay);
  el.resetButton.addEventListener('click', () => reset(false));
  el.criticalButton.addEventListener('click', () => { el.heightRange.value = Math.max(Number(el.heightRange.min), Math.min(Number(el.heightRange.max), physics.criticalHeight(Number(el.radiusRange.value)))).toFixed(2); parametersChanged(); });
  el.vectorsCheck.addEventListener('change', () => { state.showVectors = el.vectorsCheck.checked; renderer.draw(state); });
  el.trailCheck.addEventListener('change', () => { state.showTrail = el.trailCheck.checked; renderer.draw(state); });
  el.gridCheck.addEventListener('change', () => { state.showGrid = el.gridCheck.checked; renderer.draw(state); });
  root.addEventListener('keydown', event => {
    if (event.code === 'Space' && !['INPUT','BUTTON','A'].includes(document.activeElement.tagName)) { event.preventDefault(); togglePlay(); }
    else if (event.key.toLowerCase() === 'r' && !['INPUT'].includes(document.activeElement.tagName)) reset(false);
  });
  new ResizeObserver(() => renderer.resize(state)).observe(el.canvasWrap);

  reset(false);
  requestAnimationFrame(frame);
})(window);
