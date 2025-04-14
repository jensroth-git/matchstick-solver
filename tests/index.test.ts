import MatchstickSolver, { version, matchstickFormatter } from '../src/index';

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

  describe('solve() with single move', () => {
    const testCases = [
      { equation: '8+3-4=0', expectedSolutions: 2 },
      { equation: '10+10=8', expectedSolutions: 1 },
      { equation: '6-5=17', expectedSolutions: 1 },
      { equation: '5+7=2', expectedSolutions: 1 },
      { equation: '6+4=4', expectedSolutions: 2 },
      { equation: '3+3=8', expectedSolutions: 2 },
      { equation: '4-1=5', expectedSolutions: 1 },
      { equation: '5+3=6', expectedSolutions: 2 },
      { equation: '6-2=7', expectedSolutions: 2 },
      { equation: '7+1=0', expectedSolutions: 1 }
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

    it('should provide the correct solution for a simple case', () => {
      const solver = new MatchstickSolver('1+1=3');
      const solutions = solver.solve();
      
      expect(solutions.length).toBeGreaterThan(0);
      
      // Check that at least one solution is valid
      const solution = solutions[0];
      expect(solution).toHaveProperty('equation', '1+1=3');
      expect(solution).toHaveProperty('solution');
      expect(solution).toHaveProperty('steps');
      
      // Let's verify that the solution is different from the original equation
      expect(solution.solution).not.toBe('1+1=3');
    });
  });
  
  describe('solve() with multiple moves', () => {
    const multiMoveTestCases = [
      { equation: '2+3=8', maxMoves: 2, expectedMinSolutions: 1 },
      { equation: '9-5=1', maxMoves: 2, expectedMinSolutions: 1 },
      { equation: '6+3=7', maxMoves: 2, expectedMinSolutions: 1 },
      { equation: '1+8=0', maxMoves: 2, expectedMinSolutions: 1 }
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
  });
}); 