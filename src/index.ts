/**
 * Matchstick Equation Solver
 * 
 * A package for solving matchstick equation puzzles
 */

export const version = '1.0.0';

// ASCII art representations of digits and operators
const matchstickPatterns: Record<string, string[]> = {
  '0': [
    ' _ ',
    '| |',
    '|_|'
  ],
  '1': [
    '   ',
    '  |',
    '  |'
  ],
  '2': [
    ' _ ',
    ' _|',
    '|_ '
  ],
  '3': [
    ' _ ',
    ' _|',
    ' _|'
  ],
  '4': [
    '   ',
    '|_|',
    '  |'
  ],
  '5': [
    ' _ ',
    '|_ ',
    ' _|'
  ],
  '6': [
    ' _ ',
    '|_ ',
    '|_|'
  ],
  '7': [
    ' _ ',
    '  |',
    '  |'
  ],
  '8': [
    ' _ ',
    '|_|',
    '|_|'
  ],
  '9': [
    ' _ ',
    '|_|',
    ' _|'
  ],
  '+': [
    '   ',
    ' | ',
    '-+-'
  ],
  '-': [
    '   ',
    '   ',
    '---'
  ],
  '*': [
    '   ',
    '\\|/',
    '/|\\'
  ],
  '/': [
    '   ',
    '  /',
    ' / '
  ],
  '=': [
    '   ',
    '---',
    '---'
  ],
  ' ': [
    '   ',
    '   ',
    '   '
  ]
};

// matchstick formatter for ascii art
export const matchstickFormatter = (equation: string): string => {
  const chars = equation.split('');
  const lines: string[] = ['', '', ''];
  
  for (const char of chars) {
    const pattern = matchstickPatterns[char] || ['   ', '   ', '   '];
    lines[0] += pattern[0];
    lines[1] += pattern[1];
    lines[2] += pattern[2];
  }
  
  return lines.join('\n');
}

//solution type
export type Solution = {
  equation: string;
  solution: string;
  steps: string[];
}

// Rule sets for matchstick operations
const legals = "0123456789+-*/= ".split("");

interface RuleMap {
  [key: string]: Set<string>;
}

const adds: RuleMap = {};
const subs: RuleMap = {};
const trans: RuleMap = {};

// Initialize rules
legals.forEach(c => {
  adds[c] = new Set();
  subs[c] = new Set();
  trans[c] = new Set();
});

// Helper functions for rule definition
function add(c1: string, c2: string): void {
  adds[c1].add(c2);
  subs[c2].add(c1);
}

function transform(c1: string, c2: string): void {
  trans[c1].add(c2);
  trans[c2].add(c1);
}

// Define matchstick rules
add('-', '+');
add('-', '=');
add('0', '8');
add('1', '7');
add('3', '9');
add('4', '9');
add('5', '9');
add('5', '6');
add('6', '8');
add('6', '9');
add('9', '8');

transform('3', '5');
transform('3', '2');
transform('6', '9');

add(' ', '1');

// Evaluate if an equation is valid
function evaluate(arr: string[]): boolean {
  if (arr.indexOf('=') <= -1) return false;
  try {
    return !!eval(" " + arr.join("").replace('=', '==').replace('x', '*') + " ");
  } catch (x) {
    return false;
  }
}

// Helpers for generating mutations
function replace(arr: string[], index: number, re: string): string[] {
  const res = [...arr];
  res[index] = re;
  return res;
}

function transforms(arr: string[]): string[][] {
  return arr.flatMap((c, i) => [...trans[c]].map(re => replace(arr, i, re)));
}

function moves(arr: string[]): string[][] {
  return arr.flatMap((c, i) => [...subs[c]].flatMap(re => adding(replace(arr, i, re), i)));
}

function adding(arr: string[], except: number): string[][] {
  return arr.flatMap((c, i) => i === except ? [] : [...adds[c]].map(re => replace(arr, i, re)));
}

function mutate(arr: string[]): string[][] {
  return transforms([' ', ...arr, ' ']).concat(moves(arr));
}

// This will be our main API
export default class MatchstickSolver {
  private readonly equationArr: string[];

  constructor(
    private readonly equation: string, 
    private readonly maxMovableMatches: number = 1
  ) {
    this.equationArr = equation.split('');
  }

  solve(): Solution[] {
    // Generate all solutions up to maxMovableMatches moves
    return this.findSolutions(this.equation, [], 0, this.maxMovableMatches);
  }

  private findSolutions(
    currentEquation: string, 
    currentSteps: string[], 
    movesMade: number, 
    maxMoves: number
  ): Solution[] {
    // Check if the equation is already valid
    const eqArr = currentEquation.split('');
    if (evaluate(eqArr) && movesMade > 0) {
      return [{
        equation: this.equation,
        solution: currentEquation,
        steps: currentSteps
      }];
    }

    // If we've reached the maximum number of moves, stop recursion
    if (movesMade >= maxMoves) {
      return [];
    }

    // Generate all possible mutations for the current equation
    const mutations = mutate(eqArr);
    let allSolutions: Solution[] = [];

    // For each mutation, check if it's valid or continue recursion
    for (const mutation of mutations) {
      const mutationStr = mutation.join('');
      
      // Skip if we're back at the original equation or a previous state
      if (mutationStr === this.equation || mutationStr === currentEquation) {
        continue;
      }

      // Record the step for this mutation
      const step = `Move ${movesMade + 1}: Changed "${currentEquation}" to "${mutationStr}"`;
      const updatedSteps = [...currentSteps, step];

      // If the mutation is a valid equation, add it to solutions
      if (evaluate(mutation)) {
        allSolutions.push({
          equation: this.equation,
          solution: mutationStr,
          steps: updatedSteps
        });
      }

      // If we still have moves left, recursively find more solutions
      if (movesMade + 1 < maxMoves) {
        const recursiveSolutions = this.findSolutions(
          mutationStr,
          updatedSteps,
          movesMade + 1,
          maxMoves
        );
        
        allSolutions = [...allSolutions, ...recursiveSolutions];
      }
    }

    return allSolutions;
  }
} 

