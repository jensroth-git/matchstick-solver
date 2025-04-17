import MatchstickSolver from '../src/index.js';

/**
 * Tests based on real matchstick puzzles from https://www.mindyourlogic.com/matchstick-puzzles
 * and other popular matchstick equation puzzles
 */
describe('Real Matchstick Puzzles', () => {
  describe('One-Move Puzzles', () => {
    const oneMoveTestCases = [
      {
        puzzle: '5+7=2',
        expectedSolution: '9-7=2',
        description: 'Move one stick from + to 5 to make 9-7=2',
      },
      {
        puzzle: '6+4=4',
        expectedSolutions: ['0+4=4', '8-4=4'],
        description:
          'Either remove vertical stick from 6 to make 0+4=4, or move stick from + to 6 to make 8-4=4',
      },
      {
        puzzle: '7+7=0',
        expectedSolution: '7+1=8',
        description: 'Move one stick from 7 to 0 to make 7+1=8',
      },
      {
        puzzle: '3x9=5',
        expectedSolution: '3x3=9',
        description: 'Move one matchstick from 9 to 5 to make 3x3=9',
      },
    ];

    oneMoveTestCases.forEach(({ puzzle, expectedSolution, expectedSolutions, description }) => {
      it(`should solve "${puzzle}" ${expectedSolution ? `→ ${expectedSolution}` : expectedSolutions ? `→ ${expectedSolutions?.join(' or ')}` : ''} (${description})`, () => {
        const solver = new MatchstickSolver(puzzle, 1);
        const solutions = solver.solve();

        // if (solutions.length > 0) {
        //   console.log(
        //     `Solutions for ${puzzle}:`,
        //     solutions.map(s => s.solution)
        //   );
        // } else {
        //   console.log(`No solutions found for ${puzzle}`);
        // }

        expect(solutions.length).toBeGreaterThan(0);

        if (expectedSolution) {
          const foundExpectedSolution = solutions.some(sol => sol.solution === expectedSolution);
          expect(foundExpectedSolution).toBe(true);
        } else if (expectedSolutions) {
          const foundAnyExpectedSolution = expectedSolutions.some((expected: string) =>
            solutions.some(sol => sol.solution === expected)
          );
          expect(foundAnyExpectedSolution).toBe(true);
        }
      });
    });
  });

  describe('Unsolvable Puzzles', () => {
    const unsolvableTestCases = [
      {
        puzzle: '9-5=0',
        description: 'No valid one-move solution exists for this equation',
      },
    ];

    unsolvableTestCases.forEach(({ puzzle, description }) => {
      it(`should verify "${puzzle}" has no solutions (${description})`, () => {
        const solver = new MatchstickSolver(puzzle, 1);
        const solutions = solver.solve();

        // console.log(`Checking unsolvable puzzle ${puzzle}...`);
        // if (solutions.length > 0) {
        //   console.log(
        //     `Unexpected solutions found for ${puzzle}:`,
        //     solutions.map(s => s.solution)
        //   );
        // } else {
        //   console.log(`Correctly found no solutions for ${puzzle}`);
        // }

        expect(solutions.length).toBe(0);
      });
    });
  });

  describe('Two-Move Puzzles', () => {
    type TestCase = {
      puzzle: string;
      maxMoves: number;
      description: string;
      expectedSolution?: string;
      expectedSolutions?: string[];
    };

    const twoMoveTestCases: TestCase[] = [
      {
        puzzle: '3-5=0',
        maxMoves: 2,
        description: 'Find a valid equation with two moves',
      },
      {
        puzzle: '5+3=5',
        maxMoves: 2,
        expectedSolution: '6-3=3',
        description:
          'Move one stick from + to 5 (making 6), move another to change + to - (making 6-3=3)',
      },
      {
        puzzle: '3+3=8',
        maxMoves: 2,
        description: 'Change 3+3=8 to a valid equation with two moves',
      },
      {
        puzzle: '6-2=7',
        maxMoves: 2,
        description: 'Change 6-2=7 to a valid equation with two moves',
      },
    ];

    twoMoveTestCases.forEach(
      ({ puzzle, maxMoves, expectedSolution, expectedSolutions, description }) => {
        it(`should solve "${puzzle}" with ${maxMoves} moves ${expectedSolution ? `→ ${expectedSolution}` : expectedSolutions ? `→ ${expectedSolutions.join(' or ')}` : ''} (${description})`, () => {
          const solver = new MatchstickSolver(puzzle, maxMoves);
          const solutions = solver.solve();

          // if (solutions.length > 0) {
          //   console.log(
          //     `Solutions for ${puzzle} with ${maxMoves} moves:`,
          //     solutions.map(s => s.solution)
          //   );
          // } else {
          //   console.log(`No solutions found for ${puzzle} with ${maxMoves} moves`);
          // }

          expect(solutions.length).toBeGreaterThan(0);

          if (expectedSolution) {
            const foundExpectedSolution = solutions.some(sol => sol.solution === expectedSolution);
            expect(foundExpectedSolution).toBe(true);
          } else if (expectedSolutions) {
            const foundAnyExpectedSolution = expectedSolutions.some((expected: string) =>
              solutions.some(sol => sol.solution === expected)
            );
            expect(foundAnyExpectedSolution).toBe(true);
          }
        });
      }
    );
  });
});
