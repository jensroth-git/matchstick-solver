# Matchstick Solver

A TypeScript package for solving matchstick equation puzzles.

## What are Matchstick Puzzles?

Matchstick puzzles are mathematical challenges where you need to move, add, or remove matchsticks to fix an equation. For example, turning "5+7=2" into a valid equation like "9-7=2" by moving one matchstick.

## Installation

```bash
npm install matchstick-solver
```

## Usage

```typescript
import MatchstickSolver, { matchstickFormatter } from 'matchstick-solver';

// Create a solver instance with an equation and max moves (default is 1)
const solver = new MatchstickSolver('5+3=6', 1);  // 1 move max
const multiMoveSolver = new MatchstickSolver('2+3=8', 2);  // 2 moves max

// Solve the equation
const solutions = solver.solve();
const multiMoveSolutions = multiMoveSolver.solve();

// Process the solutions
solutions.forEach(solution => {
  console.log(`Original: ${solution.equation}`);
  console.log(`Solution: ${solution.solution}`);
  console.log('Steps:');
  solution.steps.forEach(step => console.log(`- ${step}`));
});

// Display the equation in ASCII matchstick format
console.log(matchstickFormatter('5+3=6'));
```

### Solution Object

Each solution returned by the solver has the following structure:

```typescript
{
  equation: string;   // The original equation
  solution: string;   // The solved equation
  steps: string[];    // Description of steps taken to solve
}
```

### Multiple Matchstick Moves

By default, the solver will find solutions that require only a single matchstick move. You can specify a higher number to find solutions requiring multiple moves:

```typescript
// Find solutions requiring up to 2 matchstick moves
const solver = new MatchstickSolver('2+3=8', 2);
const solutions = solver.solve();
```

For multiple move solutions, the `steps` array will contain each move that was made to reach the solution.

### ASCII Matchstick Visualization

The package includes a formatter to visualize equations as ASCII matchstick art:

```typescript
import { matchstickFormatter } from 'matchstick-solver';

const asciiArt = matchstickFormatter('8+3=11');
console.log(asciiArt);
```

Output:
```
 _     _    _ _ 
|_| |  _|  | | |
|_|-+- _|  | | |
```

## How It Works

The solver works by applying matchstick rules to generate possible mutations of the equation:

1. **Adding/Removing Matchsticks**: Some digits can be transformed by adding or removing matchsticks (e.g., '5' to '9' by adding one matchstick)
2. **Transforming Digits**: Some digits can be transformed by rearranging matchsticks (e.g., '6' to '9' by flipping)
3. **Evaluating Equations**: Each generated mutation is evaluated to check if it's a valid equation

For multiple move solutions, the solver recursively applies these rules, keeping track of the changes made at each step.

## Development

### Setup

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test
```

### Available Scripts

- `npm run build` - Builds the package
- `npm run clean` - Removes the dist directory
- `npm test` - Runs all tests
- `npm run test:watch` - Runs tests in watch mode
- `npm run test:coverage` - Runs tests with coverage reporting
- `npm run lint` - Checks code formatting
- `npm run format` - Formats code using Prettier
- `npm run dev` - Runs the main file using ts-node for development

## Examples

Here are some example equations and their solutions:

### Single Move Examples
- `8+3-4=0` → `6+3-9=0` or `9+3-4=8`
- `10+10=8` → `18-10=8`
- `6-5=17` → `6+5=11`
- `5+7=2` → `9-7=2`

### Multiple Move Examples
- `2+3=8` → `2+3=5` (2 moves)
- `9-5=1` → `9-8=1` (2 moves)
- `6+3=7` → `6=3+3` (2 moves)

For more examples, see the `src/example.ts` file.

## License

ISC 