/**
 * Example usage of the Matchstick Solver
 */

import MatchstickSolver, { matchstickFormatter } from './index';

// Define single-move equations to solve
const singleMoveEquations = [
  '8+3-4=0',
  '10+10=8',
  '6-5=17',
  '5+7=2'
];

// Define multi-move equations to solve
const multiMoveEquations = [
  '2+3=8',  // Requires 2 moves to fix
  '9-5=1',  // Requires 2 moves to fix
  '6+3=7',  // Requires 2 moves to fix
  '1+8=0'   // Requires 2 moves to fix
];

// Function to print equation and its solutions
function printSolutions(equation: string, maxMoves: number) {
  console.log(`\nEquation: ${equation} (Max moves: ${maxMoves})`);
  console.log('ASCII representation:');
  console.log(matchstickFormatter(equation));
  
  const solver = new MatchstickSolver(equation, maxMoves);
  const solutions = solver.solve();
  
  if (solutions.length === 0) {
    console.log('No solutions found.');
    return;
  }
  
  console.log(`Found ${solutions.length} solution(s):`);
  
  solutions.forEach((solution, index) => {
    console.log(`\nSolution ${index + 1}: ${solution.solution}`);
    console.log('ASCII representation:');
    console.log(matchstickFormatter(solution.solution));
    console.log('Steps:');
    solution.steps.forEach(step => console.log(`- ${step}`));
  });
  
  console.log('\n' + '-'.repeat(40));
}

// Print header
console.log('MATCHSTICK EQUATION SOLVER DEMO');
console.log('===============================');

// Solve single-move equations
console.log('\nSINGLE-MOVE EQUATIONS:');
singleMoveEquations.forEach(equation => printSolutions(equation, 1));

// Solve multi-move equations
console.log('\nMULTI-MOVE EQUATIONS:');
multiMoveEquations.forEach(equation => printSolutions(equation, 2)); 