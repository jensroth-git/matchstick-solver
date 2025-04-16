# Matchstick Equation Solver

A TypeScript library for solving matchstick equation puzzles.

## What are Matchstick Equations?

Matchstick equations are puzzles where you have an equation represented by matchsticks, and you need to move a certain number of matchsticks to make the equation valid.

For example, given the incorrect equation `1+1=3`, you could move one matchstick from the `3` to make `1+1=2`, which is correct.

## Installation

```bash
npm install matchstick-solver
```

## Basic Usage

```typescript
import MatchstickSolver from 'matchstick-solver';

// Create a solver for a specific equation
const solver = new MatchstickSolver('1+1=3');

// Find solutions (by default, moves 1 matchstick)
const solutions = solver.solve();

// Display solutions
for (const solution of solutions) {
  console.log(`Original equation: ${solution.equation}`);
  console.log(`Solution: ${solution.solution}`);
  console.log('Steps:');
  for (const step of solution.steps) {
    console.log(`- ${step}`);
  }
}
```

## Advanced Usage

```typescript
// Create a solver with more options
const solver = new MatchstickSolver(
  '2+3=8', // The equation to solve
  2, // Maximum number of matchsticks to move (default: 1)
  true, // Consider flipped solutions (default: true)
  true // allow prepending to the solution e.g. 1=1+2 to -1=1-2
);

const solutions = solver.solve();
```

## Features

- Solve matchstick equations by moving 1 or more matchsticks
- Support for digits 0-9 and operators +, -, \*, /, =
- Option to consider flipped solutions 180 degrees (e.g., 6 and 9 can be valid when flipped over etc.)
- ASCII art visualization of matchstick patterns
- Comprehensive solution steps

## Examples

Check the `examples/usage.ts` file for more usage examples.

## API

### `MatchstickSolver`

The main class for solving matchstick equations.

#### Constructor

```typescript
constructor(
  equation: string,
  maxMovableMatches: number = 1,
  includeFlipped: boolean = true,
  fincludePrepended: boolean = false
)
```

#### Methods

- `solve()`: Returns an array of solutions

### Solution Object

Each solution has the following properties:

- `equation`: The original equation
- `solution`: The solved equation
- `steps`: Array of steps taken to reach the solution

## Development

```bash
# Run tests
npm test

# Build the library
npm run build

# Run examples
npm run examples
```

## License

MIT
