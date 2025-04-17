// ESM usage example
import MatchstickSolver, { matchstickFormatter } from '../dist/index.js';

// Create a solver for the equation 1+2=4
const solver = new MatchstickSolver('1+2=4', 1);

// Solve the puzzle
const solutions = solver.solve();

// Display the results
console.log('Original equation:');
console.log(matchstickFormatter('1+2=4'));
console.log('\nFound', solutions.length, 'solutions:');

for (const solution of solutions) {
  console.log('\nSolution:', solution.solution);
  console.log(matchstickFormatter(solution.solution));
  console.log('Steps:');
  for (const step of solution.steps) {
    console.log(`- ${step}`);
  }
}
