# Physics Animations

Physics Animations is a collection of browser-based scientific simulations designed to expose assumptions, equations, numerical procedures, and validity limits rather than treating animation as evidence of physical correctness. The implementation uses standards-based HTML, CSS, JavaScript, Canvas, and automated analytical, numerical, and browser validation.

## Repository map

| Project | Description | Live artifact |
|---|---|---|
| [`vertical-loop/`](vertical-loop/) | Bilingual interactive vertical-loop simulation with adjustable release height and loop radius | [Canonical simulation](https://ozsp12.github.io/physics_anim/vertical-loop/) |
| [`rollercoster_loop/`](rollercoster_loop/) | Legacy path retained for backward compatibility | Redirects to the canonical simulation |

See [`simulations.json`](simulations.json) for machine-readable simulation metadata, [`CONTENTS.md`](CONTENTS.md) for the human-readable catalogue, and [`REFERENCES.md`](REFERENCES.md) for the academic bibliography.

## Vertical-loop architecture

The vertical-loop project separates scientific and presentation responsibilities:

```text
rollercoster_loop/physics-model.js      analytical physics
rollercoster_loop/simulation-core.js    numerical integration and production timestep
vertical-loop/app.js                    simulation controller and state transitions
vertical-loop/renderer.js               Canvas rendering
vertical-loop/ui.js                     PT-BR/EN text and accessibility
vertical-loop/styles.css                presentation
rollercoster_loop/tests/                analytical, numerical, integration, and browser tests
```

The production timestep is `1/240 s`. The same numerical ramp state is carried continuously into the loop; the browser no longer resets the loop-entry speed from the analytical energy expression. Analytical regime classification, detachment/turning angles, the critical ratio, and scoring are centralized in `physics-model.js`.

## Running locally

Serve the repository root so that the canonical application can load its shared scientific modules:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/vertical-loop/
http://localhost:8000/vertical-loop/?lang=en
```

## Validation

JavaScript analytical, integration, and numerical tests:

```bash
node --test rollercoster_loop/tests/test_model.js rollercoster_loop/tests/test_integration.js rollercoster_loop/tests/test_numerics.js
```

Independent Python analytical reference tests:

```bash
python -m unittest discover -s rollercoster_loop/tests -p 'test_model.py' -v
```

Real-browser smoke tests use Playwright:

```bash
npm install
npx playwright install chromium
npm run test:browser
```

The browser suite verifies canonical loading, PT/EN localization, the critical-height control, the legacy redirect, accessible status text, and absence of runtime JavaScript errors.

## Deployment

GitHub Pages publishes the repository root from `main:/`. The CI workflow validates the simulation but does not deploy Pages. The canonical public route is:

```text
https://ozsp12.github.io/physics_anim/vertical-loop/
```

The historical `/rollercoster_loop/` route is intentionally preserved as a redirect so existing links remain valid.

## Academic use

Each simulation should provide a precise physical model, coordinate conventions, analytical equations, numerical integration method and timestep, exact-versus-discrete distinctions, references, a stable entry point, accessibility text, and automated scientific tests.

## Limitations

These applications prioritize conceptual exposition and interactive exploration. They are not substitutes for experimental data, validated engineering software, or high-precision numerical solvers. Finite timesteps, collision heuristics, and simplified geometries remain explicit model limitations.

## Author

**Dr. Osvaldo L. Santos-Pereira** — [Academic webpage](https://ozsp12.github.io/) · [Lattes](http://lattes.cnpq.br/6730251976463283) · [ORCID](https://orcid.org/0000-0003-2231-517X) · [Google Scholar](https://scholar.google.com/citations?user=HIZp0X8AAAAJ&hl=en) · [GitHub](https://github.com/ozsp12)

## Repository policy

Published URLs remain stable through redirects when canonical paths change. No reuse license is asserted unless a license file is explicitly added by the owner.
