'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const indexPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

test('browser application loads the tested physics core', () => {
  assert.match(html, /<script src="physics-model\.js"><\/script>/);
  assert.match(html, /window\.VerticalLoopPhysics/);
});

test('loop integration delegates physical calculations to physics-model.js', () => {
  assert.match(html, /tangentialAcceleration\(sim\.theta, G\)/);
  assert.match(html, /normalAccelerationFromState\(sim\.v, sim\.R, sim\.theta, G\)/);
  assert.match(html, /shouldDetach\(\{/);
  assert.doesNotMatch(html, /q < 2\.5 - 1e-7 && sim\.normal <= 0/);
});

test('critical-height control uses the shared analytical model', () => {
  assert.match(html, /criticalHeight\(Number\(el\.r\.value\)\)/);
});
