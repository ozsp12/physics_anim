# Physics Animations

Physics is often taught through static diagrams even when the underlying subject is motion. This repository collects browser-based animations and interactive simulations designed to make the governing assumptions, equations, parameters, and numerical procedures visible. Each project is treated as an independent academic unit that can be read, executed, cited, and extended without requiring a proprietary platform.

The repository distinguishes physical models from their visual representations. An animation is not evidence that a model is correct; it is a computational rendering of stated assumptions. Each project therefore documents its idealizations, equations of motion, numerical method, validity domain, and known limitations. The current implementation uses standards-based HTML, CSS, JavaScript, and Canvas so that the published artifact remains inspectable and reproducible in an ordinary web browser.

## Repository map

| Project | Description | Live artifact |
|---|---|---|
| [`rollercoster_loop/`](rollercoster_loop/) | Interactive vertical-loop simulation with adjustable release height and loop radius | [Open the simulation](https://ozsp12.github.io/physics_anim/) |

See [`CONTENTS.md`](CONTENTS.md) for the project catalogue and [`REFERENCES.md`](REFERENCES.md) for the academic bibliography.

## Running locally

The first project is a standalone static application. It may be opened directly as a file or served locally:

```bash
python -m http.server 8000 --directory rollercoster_loop
```

Then open `http://localhost:8000` in a browser. No package installation, compilation, or external JavaScript dependency is required.

## Deployment

The workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publishes the contents of `rollercoster_loop/` to GitHub Pages whenever the `main` branch is updated. The deployed site is expected at:

```text
https://ozsp12.github.io/physics_anim/
```

The helper scripts [`publish_repository.ps1`](publish_repository.ps1) and [`publish_repository.sh`](publish_repository.sh) create the public GitHub repository, push the project, enable Pages with the workflow publishing source, and dispatch the deployment workflow. They require an authenticated GitHub CLI session.

## Academic use

Each simulation should provide:

- a precise statement of the physical system and coordinate conventions;
- the analytical equations used by the interface;
- the numerical integration procedure, including the time step;
- a distinction between exact predictions and discretization-dependent output;
- references to standard textbooks or primary literature;
- a standalone entry point and a representative preview image.

## Limitations

These applications prioritize conceptual exposition and interactive exploration. They are not substitutes for experimental data, validated engineering software, or high-precision numerical solvers. Browser rendering, finite time steps, collision heuristics, and simplified geometries may introduce small deviations from ideal analytical results.

## Author

**Dr. Osvaldo L. Santos-Pereira** — [Academic webpage](https://ozsp12.github.io/) · [Lattes](http://lattes.cnpq.br/6730251976463283) · [ORCID](https://orcid.org/0000-0003-2231-517X) · [Google Scholar](https://scholar.google.com/citations?user=HIZp0X8AAAAJ&hl=en) · [ResearchGate](https://www.researchgate.net/profile/Osvaldo-Santos-Pereira) · [GitHub](https://github.com/ozsp12) · [LinkedIn](https://www.linkedin.com/in/ozsp12) · [Substack](https://substack.com/@olsp1982) · [Medium](https://medium.com/@ozsp12) · [YouTube](https://www.youtube.com/@ozlsp12) · [X](https://x.com/ozsp12)

## Repository policy

Project directories should remain stable after publication so that external links continue to work. No reuse license is asserted by this repository unless a license file is added explicitly by the owner.
