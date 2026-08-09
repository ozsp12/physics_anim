# Roller-Coaster Vertical Loop

This project is an interactive browser simulation of a point mass moving along a smooth ramp and a vertical circular loop. The user controls the release height \(h\) and loop radius \(R\), observes the resulting motion, and compares the numerical animation with the analytical threshold for maintaining contact throughout the loop.

[Open the published simulation](https://ozsp12.github.io/physics_anim/)

![Preview of the vertical-loop simulation](assets/preview.png)

## Physical model

The body is treated as a particle of mass \(m\). It starts from rest at height \(h\), measured from the lowest point of the loop. The track is frictionless, gravitational acceleration is constant, air resistance is neglected, and the body does not roll. The loop is a circle of radius \(R\).

Let \(\theta\) be measured from the lowest point of the loop. The vertical coordinate is

\[
y(\theta)=R(1-\cos\theta).
\]

Conservation of mechanical energy gives

\[
mgh=\frac{1}{2}mv^2+mgR(1-\cos\theta),
\]

and therefore

\[
v^2(\theta)=2g\left[h-R(1-\cos\theta)\right].
\]

Taking the inward radial direction toward the loop center, the radial force balance is

\[
N-mg\cos\theta=\frac{mv^2}{R},
\]

and therefore

\[
\frac{N}{m}=\frac{v^2}{R}+g\cos\theta.
\]

At the top, \(\theta=\pi\), the limiting case for contact is \(N=0\), so

\[
v_{\mathrm{top}}^2=gR.
\]

Energy conservation between the release point and the top gives

\[
v_{\mathrm{top}}^2=2g(h-2R).
\]

Combining these equations yields the minimum release height

\[
\boxed{h_{\min}=\frac{5R}{2}}.
\]

## Regimes

Writing \(q=h/R\):

| Range | Predicted behavior |
|---|---|
| \(q<1\) | The particle reaches a turning point while the normal reaction remains nonnegative, then returns. |
| \(q=1\) | The particle reaches the side point with zero speed and zero normal reaction. |
| \(1<q<5/2\) | The normal reaction becomes zero before the top; the particle leaves the track and follows a ballistic trajectory. |
| \(q=5/2\) | Critical completion: the normal reaction is zero at the top. |
| \(q>5/2\) | The particle completes the loop with a positive normal reaction at the top. |

For \(1<q<5/2\), the analytical detachment angle satisfies

\[
\cos\theta_{\mathrm{d}}=\frac{2-2q}{3}.
\]

## Numerical implementation

The ramp is represented by a sampled cubic Bézier curve used only to connect the release point smoothly to the loop entrance. Motion along the ramp and loop is integrated with a fixed-step semi-implicit Euler method. The browser animation uses a physics step of

\[
\Delta t=\frac{1}{240}\ \mathrm{s},
\]

independent of the screen refresh rate. After contact is lost, the position and velocity are advanced under uniform gravity. Track re-entry and ground contact are handled by geometric event tests.

The analytical expressions shown in the prediction panel are not inferred from the numerical trajectory; they are calculated directly from \(h/R\). The reusable analytical and event-level physics functions are defined in [`physics-model.js`](physics-model.js), which is exercised directly by the JavaScript regression tests.

## Interface

The application provides:

- sliders for \(h\), \(R\), and simulation speed;
- automatic classification of the expected regime;
- real-time speed, normal force per unit mass, and \(h/R\);
- kinetic, potential, and total-energy indicators;
- velocity, weight, and normal-force vectors;
- optional grid, dimensions, and trajectory trace;
- a control that sets the critical height \(h=5R/2\);
- keyboard shortcuts: Space to play or pause, and `R` to reset.

## Running locally

Open [`index.html`](index.html) directly, or serve the directory:

```bash
python -m http.server 8000 --directory rollercoster_loop
```

No external package or network connection is required.

## Validation

From the repository root:

```bash
node --test rollercoster_loop/tests/test_model.js
python -m unittest discover -s rollercoster_loop/tests -p 'test_model.py' -v
```

The JavaScript suite tests the reusable physics implementation used for browser-side refactoring, including the critical height, contact condition, boundary regimes, and numerical contact tolerances. The Python suite remains as an independent analytical reference.

## Limitations

The model describes a sliding point mass, not a rolling sphere, car with finite wheelbase, flexible track, motorized vehicle, or real roller coaster. Rotational kinetic energy, friction, aerodynamic drag, structural deformation, passenger constraints, and safety engineering are excluded. The collision tests after detachment are illustrative and should not be used for engineering analysis.

## References

See the repository-level [`REFERENCES.md`](../REFERENCES.md).
