/**
 * Matchstick Equation Solver - Usage Examples
 *
 * This file demonstrates common usage patterns for the matchstick-solver library.
 */

import MatchstickSolver, { matchstickFormatter } from '../src/index';

// Basic usage - solve a simple matchstick equation with 1 move
function basicExample() {
  console.log('Basic Example - Solving "1+1=3" with 1 move:');

  // Create a solver for equation "1+1=3" with max 1 move
  const solver = new MatchstickSolver('1+1=3');

  // Find solutions
  const solutions = solver.solve();

  console.log(`Found ${solutions.length} solutions:`);

  // Display each solution
  for (const solution of solutions) {
    console.log('\nOriginal equation:');
    console.log(matchstickFormatter(solution.equation));

    console.log('\nSolution:');
    console.log(matchstickFormatter(solution.solution));

    console.log('\nSteps:');
    for (const step of solution.steps) {
      console.log(`- ${step}`);
    }
    console.log('-'.repeat(40));
  }
}

// Advanced usage - solving with multiple moves and flipping
function advancedExample() {
  console.log('Advanced Example - Solving "2+3=8" with 2 moves, with flipping:');

  // Create a solver allowing 2 moves and enabling flipped solutions
  const solver = new MatchstickSolver('2+3=8', 2, true);

  // Find solutions
  const solutions = solver.solve();

  console.log(`Found ${solutions.length} solutions:`);
  console.log(`First solution: ${solutions[0]?.solution}`);

  // Compare with non-flipped version
  const noFlipSolver = new MatchstickSolver('2+3=8', 2, false);
  const noFlipSolutions = noFlipSolver.solve();

  console.log(`Without flipping: ${noFlipSolutions.length} solutions`);
  console.log(`With flipping: ${solutions.length} solutions`);
}

// Comparing different equation variants
function compareVariants() {
  console.log('Comparing different equation variants:');

  const equations = ['5+7=2', '8+3-4=0', '10+10=8', '7x5/3=2'];

  for (const equation of equations) {
    const solver = new MatchstickSolver(equation);
    const solutions = solver.solve();

    console.log(`\nEquation "${equation}" has ${solutions.length} solutions:`);
    if (solutions.length > 0) {
      console.log(`First solution: ${solutions[0].solution}`);
    }
  }
}
// Execute examples
console.log('=== MATCHSTICK SOLVER EXAMPLES ===');
console.log('-'.repeat(30));

basicExample();
console.log('\n');

advancedExample();
console.log('\n');

compareVariants();
