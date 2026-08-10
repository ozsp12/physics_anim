# Contents

## Interactive mechanics

### Vertical loop

Canonical path: [`vertical-loop/`](vertical-loop/)

Legacy path: [`rollercoster_loop/`](rollercoster_loop/) redirects permanently at the application level to the canonical route so published links remain usable.

A point mass starts from rest at a selectable height, descends a smooth ramp, and enters a vertical circular loop. The interface exposes the release height \(h\), loop radius \(R\), ratio \(h/R\), speed, normal force per unit mass, energy partition, predicted regime, trajectory, and force vectors. The application is available in Portuguese and English from the same scientific runtime.

The analytical regimes are:

1. \(h/R<1\): the particle reaches a turning point and returns;
2. \(h/R=1\): the particle reaches the side point with zero speed and zero normal reaction;
3. \(1<h/R<5/2\): the normal reaction becomes zero and the particle enters free flight;
4. \(h/R=5/2\): critical completion with zero normal reaction at the top;
5. \(h/R>5/2\): the particle completes the loop with positive contact force at the top.

The production numerical timestep is \(\Delta t=1/240\,\mathrm{s}\). The ramp and loop are integrated continuously; the loop-entry speed is inherited from the numerical ramp trajectory rather than reset from the analytical energy formula.

Entry point: [`vertical-loop/index.html`](vertical-loop/index.html)  
Scientific model: [`rollercoster_loop/physics-model.js`](rollercoster_loop/physics-model.js)  
Numerical core: [`rollercoster_loop/simulation-core.js`](rollercoster_loop/simulation-core.js)  
Preview: [`rollercoster_loop/assets/preview.png`](rollercoster_loop/assets/preview.png)
