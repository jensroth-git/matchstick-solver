// ESM usage example
import { MatchstickSolver } from '../dist/index.js';

// Async function to run the example
async function runExample() {
  console.log('Matchstick Solver - ESM Example');
  console.log('-'.repeat(40));

  // Create a solver instance
  const solver = new MatchstickSolver();

  // Initialize the solver
  await solver.init();

  // Load precomputed solutions for O(1) lookups
  await solver.initializeSolver('./precomputed_equations.json');

  const equation = '1+2=4';

  // Find solutions
  const solutions = await solver.findSolutions(equation, 1);

  // Display the results
  console.log(`Original equation: ${equation}`);
  console.log(`\nFound ${solutions.length} solutions:`);

  for (const solution of solutions) {
    console.log('\nSolution:', solution.equation);
    console.log('Moves required:', solution.numMoves);
    console.log('Flipped solution:', solution.flipped ? 'Yes' : 'No');

    console.log('Steps:');
    for (const move of solution.moves) {
      console.log(
        `- Move matchstick from ${move.fromChar} bit ${move.fromBit} to ${move.toChar} bit ${move.toBit}`
      );
    }
  }

  // Clean up resources when done
  solver.cleanup();
}

// Run the example
runExample().catch(err => {
  console.error('Error:', err);
});
