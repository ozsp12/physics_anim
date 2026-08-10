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

test('renderer and UI responsibilities are externalized', () => {
  assert.match(renderer, /createRenderer/);
  assert.match(canonicalHtml, /<link rel="stylesheet" href="styles\.css">/);
  assert.doesNotMatch(canonicalHtml, /<style>/);
});

test('canonical route is English-only and exposes accessible status text', () => {
  assert.match(canonicalHtml, /<html lang="en">/);
  assert.match(canonicalHtml, /rollercoaster-loop/);
  assert.match(canonicalHtml, /id="statusAnnouncer"[^>]*aria-live="polite"/);
  assert.match(canonicalHtml, /aria-describedby="simulationSummary"/);
  assert.doesNotMatch(canonicalHtml, /class="hud"[^>]*aria-live/);
  assert.match(ui, /const locale = 'en-US'/);
});
