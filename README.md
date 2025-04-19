# Matchstick Solver

A high-performance package for solving matchstick equation puzzles.

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

// Create a solver instance
const solver = new MatchstickSolver();

// Initialize the solver (async)
await solver.init();

// Load precomputed solutions for O(1) lookups
await solver.initializeSolver('./precomputed_equations.json');

// Solve a matchstick equation
const solutions = await solver.findSolutions('1+2=4', 1);
console.log(solutions);
```

## Features

- **High Performance**: Built on WebAssembly for lightning-fast solutions
- **O(1) Solution Lookups**: Transforms the problem from a tree search to constant-time Hamming distance calculations
- **Consistent Performance**: Solution time remains constant regardless of search depth
- Solve matchstick equation puzzles with any number of moves
- Supports various mathematical operators (+, -, ×, /, =)
- Configurable number of matchsticks to move
- Includes flipped solutions
- Detailed step-by-step solutions
- Dual ESM/CommonJS module support

## Performance

The package uses a WebAssembly implementation that transforms the traditional tree-search approach into a constant-time lookup. This means:

- Solutions are found in microseconds instead of seconds or minutes
- Performance is consistent regardless of the number of moves required
- Even complex puzzles requiring multiple moves resolve instantly

## License

MIT
