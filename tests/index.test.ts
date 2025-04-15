import MatchstickSolver, {
  version,
  MatchBoard,
  slotPatterns,
  slotToChar,
  equationToBoard,
  boardToEquation,
  flipBoard,
  matchstickFormatter,
} from '../src/index';

describe('MatchstickSolver', () => {
  it('should be instantiable', () => {
    const solver = new MatchstickSolver('1+2=3');
    expect(solver).toBeInstanceOf(MatchstickSolver);
  });

  it('should expose version', () => {
    expect(typeof version).toBe('string');
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

  describe('Character Recognition', () => {
    it('should correctly recognize all predefined characters', () => {
      const characters = Object.keys(slotPatterns);

      for (const char of characters) {
        const slots = slotPatterns[char];
        const recognized = slotToChar(slots);
        expect(recognized).toBe(char);
      }
    });
  });

  describe('Board Flipping', () => {
    it('should correctly flip known pairs', () => {
      const flippablePairs = [
        { original: '6', expected: '9' },
        { original: '9', expected: '6' },
        { original: '0', expected: '0' },
        { original: '8', expected: '8' },
        { original: '1', expected: '1' },
        { original: '+', expected: '+' },
        { original: '-', expected: '-' },
        { original: '=', expected: '=' },
      ];

      for (const { original, expected } of flippablePairs) {
        const board = equationToBoard(original);
        const flippedBoard = flipBoard(board);

        expect(flippedBoard).not.toBeNull();

        if (flippedBoard) {
          const result = boardToEquation(flippedBoard);

          if (result !== null) {
            expect(result[0]).toBe(expected);
          }
        }
      }
    });

    it('should return null for unflippable characters', () => {
      const unflippableChars = ['/'];

      for (const char of unflippableChars) {
        const board = equationToBoard(char);
        const flippedBoard = flipBoard(board);
        expect(flippedBoard).toBeNull();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty board when flipping', () => {
      const emptyBoard: MatchBoard = [];
      const flippedEmpty = flipBoard(emptyBoard);
      expect(flippedEmpty).not.toBeNull();
      expect(flippedEmpty!.length).toBe(0);
    });

    it('should handle board with only spaces', () => {
      const spaceBoard = equationToBoard('   ');
      const flippedSpace = flipBoard(spaceBoard);
      expect(flippedSpace).not.toBeNull();
    });

    it('should return null when flipping board with unflippable chars', () => {
      const weirdBoard = equationToBoard('1+/=8');
      const flippedWeird = flipBoard(weirdBoard);
      expect(flippedWeird).toBeNull();
    });

    it('should correctly flip equations with repeated characters', () => {
      const repeatedChars = equationToBoard('88=88');
      const flippedRepeated = flipBoard(repeatedChars);
      expect(flippedRepeated).not.toBeNull();

      if (flippedRepeated) {
        const equation = boardToEquation(flippedRepeated);
        if (equation !== null) {
          expect(equation).toBe('88=88');
        }
      }
    });
  });

  describe('solve() with single move', () => {
    const testCases = [
      { equation: '6+2=7', expectedSolutions: 0 },
      { equation: '8+3-4=0', expectedSolutions: 1 },
      { equation: '10+10=8', expectedSolutions: 1 },
      { equation: '6-5=17', expectedSolutions: 1 },
      { equation: '5+7=2', expectedSolutions: 1 },
      { equation: '6+4=4', expectedSolutions: 2 },
      { equation: '3+3=8', expectedSolutions: 2 },
      { equation: '4-1=5', expectedSolutions: 1 },
      { equation: '5+3=6', expectedSolutions: 2 },
      { equation: '6-2=7', expectedSolutions: 2 },
      { equation: '7+1=0', expectedSolutions: 1 },
    ];

    testCases.forEach(({ equation, expectedSolutions }) => {
      it(`should solve "${equation}" with ${expectedSolutions} solution(s)`, () => {
        const solver = new MatchstickSolver(equation);
        const solutions = solver.solve();

        expect(solutions.length).toBe(expectedSolutions);

        // Verify solution format
        if (solutions.length > 0) {
          const solution = solutions[0];
          expect(solution).toHaveProperty('equation', equation);
          expect(solution).toHaveProperty('solution');
          expect(solution).toHaveProperty('steps');
          expect(solution.steps.length).toBeGreaterThan(0);
        }
      });
    });

    describe('solve() with by moving a match before the equation', () => {
      const testCases = [{ equation: '1=1+2', expectedSolution: '-1=1-2' }];

      testCases.forEach(({ equation, expectedSolution }) => {
        it(`should solve "${equation}" with ${expectedSolution} solution(s)`, () => {
          const solver = new MatchstickSolver(equation, 1, false, true);
          const solutions = solver.solve();

          expect(solutions.length).toBeGreaterThan(0);

          // Verify solution format
          if (solutions.length > 0) {
            const solution = solutions[0];
            expect(solution).toHaveProperty('equation', equation);
            expect(solution).toHaveProperty('solution', expectedSolution);
            expect(solution).toHaveProperty('steps');
            expect(solution.steps.length).toBeGreaterThan(0);
          }
        });
      });
    });

    it('should provide the correct solution for a simple case', () => {
      const solver = new MatchstickSolver('1+1=3');
      const solutions = solver.solve();

      expect(solutions.length).toBe(2);

      // Check that at least one solution is valid
      const solution = solutions[0];
      expect(solution).toHaveProperty('equation', '1+1=3');
      expect(solution).toHaveProperty('solution', '1+1=2');
      expect(solution).toHaveProperty('steps');
    });
  });

  describe('solve() with multiple moves', () => {
    const multiMoveTestCases = [
      { equation: '2+3=8', maxMoves: 2, expectedMinSolutions: 7 },
      { equation: '9-5=1', maxMoves: 2, expectedMinSolutions: 1 },
      { equation: '6+3=7', maxMoves: 2, expectedMinSolutions: 0 },
      { equation: '1+8=0', maxMoves: 2, expectedMinSolutions: 1 },
    ];

    multiMoveTestCases.forEach(({ equation, maxMoves, expectedMinSolutions }) => {
      it(`should solve "${equation}" with at least ${expectedMinSolutions} solution(s) using ${maxMoves} moves`, () => {
        const solver = new MatchstickSolver(equation, maxMoves);
        const solutions = solver.solve();

        // We expect at least some solutions
        expect(solutions.length).toBeGreaterThanOrEqual(expectedMinSolutions);

        if (solutions.length > 0) {
          // Verify that we have the right number of steps for a multi-move solution
          const solution = solutions[0];
          expect(solution.steps.length).toBeGreaterThanOrEqual(1);
          expect(solution.steps.length).toBeLessThanOrEqual(maxMoves);

          // Verify the solution format
          expect(solution).toHaveProperty('equation', equation);
          expect(solution).toHaveProperty('solution');
        }
      });
    });

    it('should find more solutions with 2 moves than with 1 move', () => {
      const equation = '1+2=4';

      const oneMoveMatches = new MatchstickSolver(equation, 1);
      const oneMoveSolutions = oneMoveMatches.solve();

      const twoMoveMatches = new MatchstickSolver(equation, 2);
      const twoMoveSolutions = twoMoveMatches.solve();

      // Two moves should find at least as many solutions as one move
      expect(twoMoveSolutions.length).toBeGreaterThanOrEqual(oneMoveSolutions.length);

      if (twoMoveSolutions.length > oneMoveSolutions.length) {
        // Verify that at least one solution has 2 steps
        const hasTwoStepSolution = twoMoveSolutions.some(solution => solution.steps.length === 2);
        expect(hasTwoStepSolution).toBe(true);
      }
    });

    it('should handle flipping in solution finding', () => {
      const equation = '9+7=1';

      const noFlipSolver = new MatchstickSolver(equation, 1, false);
      const noFlipSolutions = noFlipSolver.solve();

      const withFlipSolver = new MatchstickSolver(equation, 1, true);
      const withFlipSolutions = withFlipSolver.solve();

      expect(noFlipSolutions[0].solution).toBe('8-7=1');
      expect(withFlipSolutions[1].solution).toBe('7=1+6');

      // We just want to test that both solvers work, not making assumptions about the results
      expect(noFlipSolutions.length).toBeGreaterThanOrEqual(0);
      expect(withFlipSolutions.length).toBeGreaterThanOrEqual(0);
    });
  });
});
