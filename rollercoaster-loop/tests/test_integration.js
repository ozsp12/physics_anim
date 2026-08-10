'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..', '..');
const canonicalHtml = fs.readFileSync(path.join(root, 'rollercoaster-loop', 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'rollercoaster-loop', 'app.js'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'rollercoaster-loop', 'ui.js'), 'utf8');
const renderer = fs.readFileSync(path.join(root, 'rollercoaster-loop', 'renderer.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'rollercoaster-loop', 'styles.css'), 'utf8');
const notFoundHtml = fs.readFileSync(path.join(root, '404.html'), 'utf8');

test('canonical browser application loads modular scientific runtime', () => {
  assert.match(canonicalHtml, /physics-model\.js/);
  assert.match(canonicalHtml, /simulation-core\.js/);
  assert.match(canonicalHtml, /ui\.js/);
  assert.match(canonicalHtml, /renderer\.js/);
  assert.match(canonicalHtml, /app\.js/);
  assert.doesNotMatch(canonicalHtml, /<script>\s*\(\(\) =>/);
});

test('controller uses production timestep and continuous ramp speed', () => {
  assert.match(app, /simulation\.PRODUCTION_DT/);
  assert.match(app, /simulation\.stepRampState/);
  assert.match(app, /simulation\.stepLoopState/);
  assert.doesNotMatch(app, /speedSquaredFromEnergy\(state\.h/);
});

test('UI delegates regime classification and score to physics-model.js', () => {
  assert.match(ui, /physics\.classify/);
  assert.match(ui, /physics\.turningAngle/);
  assert.match(ui, /physics\.detachmentAngle/);
  assert.match(app, /physics\.score/);
  assert.doesNotMatch(app, /2\.5\s*-/);
});

test('renderer and UI responsibilities are externalized with one stylesheet', () => {
  assert.match(renderer, /createRenderer/);
  assert.match(canonicalHtml, /<link rel="stylesheet" href="styles\.css">/);
  assert.doesNotMatch(canonicalHtml, /<style>/);
  assert.doesNotMatch(styles, /@import\s+url\(['"]base\.css['"]\)/);
  assert.equal(fs.existsSync(path.join(root, 'rollercoaster-loop', 'base.css')), false);
});

test('canonical route is English-only and exposes accessible status text', () => {
  assert.match(canonicalHtml, /<html lang="en">/);
  assert.match(canonicalHtml, /rollercoaster-loop/);
  assert.match(canonicalHtml, /id="statusAnnouncer"[^>]*aria-live="polite"/);
  assert.match(canonicalHtml, /aria-describedby="simulationSummary"/);
  assert.doesNotMatch(canonicalHtml, /class="hud"[^>]*aria-live/);
  assert.match(ui, /const locale = 'en-US'/);
});

test('critical-case scientific text is consistent in static HTML and runtime UI', () => {
  const expected = 'At the top, the normal force is zero in the ideal model. In exact arithmetic, the particle completes the loop.';
  assert.match(canonicalHtml, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(ui, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(canonicalHtml, /normal force tends to zero/);
});

test('legacy simulation URLs remain mapped to the canonical route', () => {
  assert.match(notFoundHtml, /\/physics_anim\/rollercoster_loop/);
  assert.match(notFoundHtml, /\/physics_anim\/vertical-loop/);
  assert.match(notFoundHtml, /\/physics_anim\/rollercoaster-loop\//);
  assert.match(notFoundHtml, /window\.location\.replace/);
});

test('unused global simulation manifest is absent', () => {
  assert.equal(fs.existsSync(path.join(root, 'simulations.json')), false);
});
