/**
 * Matchstick Equation Solver - Usage Examples (WebAssembly version)
 *
 * This file demonstrates common usage patterns for the matchstick-solver library.
 */

import { MatchstickSolver } from '../src/index';

// Basic usage - solve a simple matchstick equation with 1 move
async function basicExample() {
  console.log('Basic Example - Solving "1+1=3" with 1 move:');

  // Create a solver instance
  const solver = new MatchstickSolver();

  // Initialize the solver and load precomputed solutions
  await solver.init();
  await solver.initializeSolver('./precomputed_equations.json');

  // Find solutions
  const solutions = await solver.findSolutions('1+1=3', 1);

  console.log(`Found ${solutions.length} solutions:`);

  // Display each solution
  for (const solution of solutions) {
    console.log('\nOriginal equation: 1+1=3');

    console.log('\nSolution:');
    console.log(solution.equation);

    console.log('\nMoves:', solution.numMoves);
    console.log('Flipped:', solution.flipped ? 'Yes' : 'No');

    console.log('\nSteps:');
    for (const move of solution.moves) {
      console.log(
        `- Move matchstick from ${move.fromChar} bit ${move.fromBit} to ${move.toChar} bit ${move.toBit}`
      );
    }
    console.log('-'.repeat(40));
  }
}

// Advanced usage - solving with multiple moves and flipping
async function advancedExample() {
  console.log('Advanced Example - Solving "2+3=8" with 2 moves, with flipping:');

  // Create a solver instance
  const solver = new MatchstickSolver();

  // Initialize the solver and load precomputed solutions
  await solver.init();
  await solver.initializeSolver('./precomputed_equations.json');

  // Find solutions with flipping enabled
  const solutions = await solver.findSolutions('2+3=8', 2, true);

  console.log(`Found ${solutions.length} solutions:`);
  console.log(`First solution: ${solutions[0]?.equation}`);

  // Compare with non-flipped version
  const noFlipSolutions = await solver.findSolutions('2+3=8', 2, false);

  console.log(`Without flipping: ${noFlipSolutions.length} solutions`);
  console.log(`With flipping: ${solutions.length} solutions`);
}

// Comparing different equation variants
async function compareVariants() {
  console.log('Comparing different equation variants:');

  const equations = ['5+7=2', '8+3-4=0', '10+10=8', '7x5/3=2'];

  // Create a solver instance
  const solver = new MatchstickSolver();

  // Initialize the solver and load precomputed solutions
  await solver.init();
  await solver.initializeSolver('./precomputed_equations.json');

  for (const equation of equations) {
    const solutions = await solver.findSolutions(equation, 1);

    console.log(`\nEquation "${equation}" has ${solutions.length} solutions:`);
    if (solutions.length > 0) {
      console.log(`First solution: ${solutions[0].equation}`);
    }
  }

  // Clean up resources when done
  solver.cleanup();
}

// Execute examples
(async () => {
  console.log('=== MATCHSTICK SOLVER EXAMPLES ===');
  console.log('-'.repeat(30));

  await basicExample();
  console.log('\n');

  await advancedExample();
  console.log('\n');

  await compareVariants();
})().catch(error => {
  console.error('Error running examples:', error);
});
