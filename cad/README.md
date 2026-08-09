# CAD automation

This directory will hold the parametric generators and exports for GP-TARS V2.

`parameters.py` is the current master configuration. The intended later entry point is `export.py`, which will generate STEP assemblies and STL panel outputs under `output/` without overwriting source GPTARS files.

The mechanical layout is not yet mature enough to generate production parts. Torque, mass, joint sweep, bearing life, shaft deflection, and stability calculations must precede actuator-bracket release.

