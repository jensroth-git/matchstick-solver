import { MatchstickSolver, matchstickFormatter } from '../src/index.js';

describe('MatchstickSolver', () => {
  let solver: MatchstickSolver;

  beforeAll(async () => {
    solver = new MatchstickSolver();
    await solver.init();
    const result = await solver.initializeSolver('./precomputed_equations.json');
    expect(result).toBe(true);
  });

  it('should be instantiable', () => {
    expect(solver).toBeInstanceOf(MatchstickSolver);
  });

  it('should format equations as ASCII matchstick art', () => {
    const equation = '8+3=11';
    const formatted = matchstickFormatter(equation);

    // Just check that the output contains the correct number of lines
    const lines = formatted.split('\n');
    expect(lines.length).toBe(3);

    // And each line has content for each character
    expect(lines[0].length).toBeGreaterThan(equation.length);
    expect(lines[1].length).toBeGreaterThan(equation.length);
    expect(lines[2].length).toBeGreaterThan(equation.length);
  });

  describe('solve() with single move', () => {
    const testCases = [
      { equation: '6+2=7', expectedSolutions: 0 },
      { equation: '8+3-4=0', expectedSolutions: 1 },
      { equation: '10+10=8', expectedSolutions: 1 },
      { equation: '6-5=17', expectedSolutions: 1 },
      { equation: '5+7=2', expectedSolutions: 1 },
      { equation: '6+4=4', expectedSolutions: 2 },
      { equation: '3+3=8', expectedSolutions: 3 },
      { equation: '4-1=5', expectedSolutions: 1 },
      { equation: '5+3=6', expectedSolutions: 2 },
      { equation: '6-2=7', expectedSolutions: 2 },
      { equation: '7+1=0', expectedSolutions: 2 },
    ];

    testCases.forEach(({ equation, expectedSolutions }) => {
      it(`should solve "${equation}" with ${expectedSolutions} solution(s)`, async () => {
        const solutions = await solver.findSolutions(equation);

        expect(solutions.length).toBe(expectedSolutions);

        // Verify solution format
        /*interface Solution {
          equation: string;
          numMoves: number;
          flipped: boolean;
          moves: Move[];
        } */
        if (solutions.length > 0) {
          const solution = solutions[0];
          expect(solution).toHaveProperty('equation');
          expect(solution).toHaveProperty('numMoves');
          expect(solution).toHaveProperty('flipped');
          expect(solution).toHaveProperty('moves');
          expect(solution.moves.length).toBeGreaterThan(0);
        }
      });
    });

    describe('solve() with by moving a match before the equation', () => {
      const testCases = [{ equation: '1=1+2', expectedSolution: '-1=1-2' }];

      testCases.forEach(({ equation, expectedSolution }) => {
        it(`should solve "${equation}" with ${expectedSolution} solution(s)`, async () => {
          const solutions = await solver.findSolutions(equation, 1, false);

          expect(solutions.length).toBeGreaterThan(0);
        });
      });
    });

    it('should provide the correct solution for a simple case', async () => {
      const solutions = await solver.findSolutions('1+1=3');

      expect(solutions.length).toBe(2);

      // Check that at least one solution is valid
      const solution = solutions[0];
      expect(solution.equation).toBe('1+1=2');
    });
  });

  describe('solve() with multiple moves', () => {
    const multiMoveTestCases = [
      { equation: '2+3=8', maxMoves: 2, expectedSolutions: 10 },
      { equation: '9-5=1', maxMoves: 2, expectedSolutions: 6 },
      { equation: '6+3=7', maxMoves: 2, expectedSolutions: 0 },
      { equation: '1+8=0', maxMoves: 2, expectedSolutions: 2 },
      { equation: '8+4=7', maxMoves: 2, expectedSolutions: 2 },
      { equation: '9-6=1', maxMoves: 2, expectedSolutions: 4 },
      { equation: '1+2=4', maxMoves: 2, expectedSolutions: 3 },
    ];

    multiMoveTestCases.forEach(({ equation, maxMoves, expectedSolutions }) => {
      it(`should solve "${equation}" with at least ${expectedSolutions} solution(s) using ${maxMoves} moves`, async () => {
        const solutions = await solver.findSolutions(equation, maxMoves);

        // We expect these number of solutions
        expect(solutions.length).toBe(expectedSolutions);

        if (solutions.length > 0) {
          // Verify that we have the right number of steps for a multi-move solution
          const solution = solutions[0];
          expect(solution.moves.length).toBeGreaterThanOrEqual(1);
          expect(solution.moves.length).toBeLessThanOrEqual(maxMoves);
        }
      });
    });

    it('should handle flipping in solution finding', async () => {
      const equation = '9+7=1';

      const noFlipSolutions = await solver.findSolutions(equation, 1, false);

      const withFlipSolutions = await solver.findSolutions(equation, 1, true);

      expect(noFlipSolutions[0].equation).toBe('8-7=1');
      expect(withFlipSolutions[1].equation).toBe('7=1+6');

      // We just want to test that both solvers work, not making assumptions about the results
      expect(noFlipSolutions.length).toBeGreaterThanOrEqual(0);
      expect(withFlipSolutions.length).toBeGreaterThanOrEqual(0);
    });
  });
});
