# Matchstick Solver

A package for solving matchstick equation puzzles.

## What are Matchstick Equations?

Matchstick equations are puzzles where you have an equation represented by matchsticks, and you need to move a certain number of matchsticks to make the equation valid.

For example, given the incorrect equation `1+1=3`, you could move one matchstick from the `3` to make `1+1=2`, which is correct.

## Installation

```bash
npm install matchstick-solver
```

## Usage

This package supports both ESM (ECMAScript Modules) and CommonJS formats.

```javascript
// ESM import
import MatchstickSolver from 'matchstick-solver';

// CommonJS require
const MatchstickSolver = require('matchstick-solver');

// Solve a matchstick equation
const solver = new MatchstickSolver('1+2=4', 1);
const solutions = solver.solve();
console.log(solutions);
```

## Features

- Solve matchstick equation puzzles
- Supports various mathematical operators (+, -, ×, /, =)
- Configurable number of matchsticks to move
- Includes flipped solutions
- Detailed step-by-step solutions
- Dual ESM/CommonJS module support

## API

See the [API documentation](docs/api.md) for detailed information.

## License

MIT
