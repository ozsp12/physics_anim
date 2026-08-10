'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..', '..');
const canonicalHtml = fs.readFileSync(path.join(root, 'vertical-loop', 'index.html'), 'utf8');
const legacyHtml = fs.readFileSync(path.join(root, 'rollercoster_loop', 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'vertical-loop', 'app.js'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'vertical-loop', 'ui.js'), 'utf8');
const renderer = fs.readFileSync(path.join(root, 'vertical-loop', 'renderer.js'), 'utf8');

test('canonical browser application loads modular scientific runtime', () => {
  assert.match(canonicalHtml, /rollercoster_loop\/physics-model\.js/);
  assert.match(canonicalHtml, /rollercoster_loop\/simulation-core\.js/);
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

test('canonical route exposes bilingual metadata and accessible status text', () => {
  assert.match(canonicalHtml, /hreflang="pt-BR"/);
  assert.match(canonicalHtml, /hreflang="en"/);
  assert.match(canonicalHtml, /id="statusAnnouncer"[^>]*aria-live="polite"/);
  assert.match(canonicalHtml, /aria-describedby="simulationSummary"/);
  assert.doesNotMatch(canonicalHtml, /class="hud"[^>]*aria-live/);
});

test('legacy misspelled URL redirects to canonical vertical-loop route', () => {
  assert.match(legacyHtml, /url=\.\.\/vertical-loop\//);
  assert.match(legacyHtml, /canonical[^>]+vertical-loop/);
});
