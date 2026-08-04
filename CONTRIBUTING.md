# Contributing

This repository is organized as a collection of independent academic simulations. Contributions should preserve the inspectability of each model and avoid replacing explicit physics with opaque visual effects.

## Project structure

New simulations should normally use a descriptive directory containing:

```text
project_name/
├── index.html
├── README.md
├── assets/
└── tests/
```

A project may use additional source files when this materially improves maintainability. A standalone HTML version should be retained when practical.

## Required documentation

Every project README should state:

- the physical assumptions and idealizations;
- the coordinate system and parameter definitions;
- the governing equations and equality or threshold conditions;
- the numerical method and time-step policy;
- the meaning of each control and displayed quantity;
- known limitations and physically excluded effects;
- the references used to justify the model.

## Numerical standards

Analytical identities and numerical approximations must be distinguished explicitly. Fixed-step integrators should state the step size. Event conditions such as impact, loss of contact, or turning points should be tested against analytical limits whenever possible. Visual plausibility is not validation.

## Editorial standards

Use direct technical prose. Avoid promotional slogans, unsupported claims of realism, and decorative complexity that obscures the physical model. Symbols, units, and terminology should remain consistent across the interface and documentation.

## Validation

Before committing a project:

```bash
python -m unittest discover -s project_name/tests -v
python -m http.server 8000 --directory project_name
```

Test the interface at desktop and mobile widths and verify that it runs without external network access.
