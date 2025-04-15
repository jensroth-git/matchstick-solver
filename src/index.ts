/**
 * Matchstick Equation Solver
 *
 * A package for solving matchstick equation puzzles
 */

import { slotPatterns, slotToChar } from './slotDefinitions';

export const version = '1.0.0';

//solution type
export type Solution = {
  equation: string;
  solution: string;
  steps: string[];
};

// Slot-based representation for matchstick positions
export interface MatchSlots {
  // Standard 7-segment display slots
  a: boolean; // top horizontal
  b: boolean; // top-right vertical
  c: boolean; // bottom-right vertical
  d: boolean; // bottom horizontal
  e: boolean; // bottom-left vertical
  f: boolean; // top-left vertical
  g: boolean; // middle horizontal
  altg: boolean; // middle horizontal needed for =

  //addition symbol
  addv: boolean; // vertical for addition with either g or altg

  // multiplication symbol
  mul_tl_br: boolean; // diagonal top-left to bottom-right
  mul_tr_bl: boolean; // diagonal top-right to bottom-left

  //division symbol
  divb: boolean; // bottom horizontal for division
  divt: boolean; // top horizontal for division
}

// The entire equation as a series of slot cells
export type MatchBoard = MatchSlots[];

// Re-export the slot definitions
export { slotPatterns, slotToChar };

// ASCII art representations of digits and operators
// prettier-ignore
const matchstickPatterns: Record<string, string[]> = {
  '0': [
    ' _ ',
    '| |',
    '|_|',
  ],

  '1': [
    '   ',
    '  |',
    '  |',
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
    '   ', 
    ' + '
  ],

  '-': [
    '   ', 
    '   ', 
    ' - '
  ],

  '*': [
    '   ',
    '   ',
    ' x ',
  ],

  '/': [
    '   ',
    '  /',
    ' / ',
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
};

// Function to recognize what character a slot pattern represents
export function recognizeCharacter(slots: MatchSlots): string | false {
  // Use the slotToChar function to get the character
  return slotToChar(slots);
}

// Function to convert a character to its standard slot pattern
export function characterToSlots(char: string): MatchSlots {
  return slotPatterns[char] || createEmptySlots();
}

// Count how many matchsticks are in a slot pattern
export function countMatchsticks(slots: MatchSlots): number {
  return Object.values(slots).filter(Boolean).length;
}

// Create an empty slot pattern
export function createEmptySlots(): MatchSlots {
  return {
    a: false,
    b: false,
    c: false,
    d: false,
    e: false,
    f: false,
    g: false,
    altg: false,
    addv: false,
    mul_tl_br: false,
    mul_tr_bl: false,
    divb: false,
    divt: false,
  };
}

// Convert an equation string to a board
export function equationToBoard(equation: string): MatchBoard {
  return equation.split('').map(characterToSlots);
}

// Convert a board to possible equation string
export function boardToEquation(board: MatchBoard): string | null {
  // Get all possible characters at each position
  const possibleChars = board.map(recognizeCharacter);

  // Check if there are any false values
  if (possibleChars.some(char => char === false)) {
    return null;
  }

  // Assemble the equation
  const equation = possibleChars.join('');

  return equation;
}

// Evaluate if an equation is valid
export function evaluateEquation(equation: string): boolean {
  if (equation.indexOf('=') <= -1) return false;
  try {
    return !!eval(' ' + equation.replace('=', '==').replace('x', '*') + ' ');
  } catch (x) {
    return false;
  }
}

// This will be our main API
export default class MatchstickSolver {
  private readonly board: MatchBoard;
  private readonly originalEquation: string;

  constructor(
    private readonly equation: string,
    private readonly maxMovableMatches: number = 1,
    private readonly includeFlipped: boolean = true,
    private readonly includePrepended: boolean = false
  ) {
    this.originalEquation = equation;
    this.board = equationToBoard(equation);
  }

  solve(): Solution[] {
    // Get permutations from the standard solver
    let permutations = this.findPermutations(this.board, [], 0, this.maxMovableMatches);

    // remove duplicates
    permutations = this.removeDuplicateSolutions(permutations);

    // filter for valid equations
    let solutions = permutations.filter(solution => {
      return evaluateEquation(solution.solution);
    });

    return solutions;
  }

  private removeDuplicateSolutions(solutions: Solution[]): Solution[] {
    const unique = new Map<string, Solution>();

    //sort by least steps first
    solutions = solutions.sort((a, b) => a.steps.length - b.steps.length);

    for (const solution of solutions) {
      if (!unique.has(solution.solution)) {
        unique.set(solution.solution, solution);
      }
    }

    return Array.from(unique.values());
  }

  private findPermutations(
    board: MatchBoard,
    currentSteps: string[],
    movesMade: number,
    maxMoves: number
  ): Solution[] {
    // Base case: we've made all the moves we can
    if (movesMade >= maxMoves) {
      // Convert board to equation string
      const equation = boardToEquation(board);

      // Return valid solutions
      return equation && equation !== this.originalEquation
        ? [
            {
              equation: this.originalEquation,
              solution: equation,
              steps: [...currentSteps],
            },
          ]
        : [];
    }

    // Generate all possible next moves
    const possibleMoves = this.generateAllPossibleMoves(board, movesMade);
    let allPermutations: Solution[] = [];

    // Try each possible move
    for (const { newBoard, description } of possibleMoves) {
      if (movesMade < maxMoves - 1) {
        //check if we already have a valid board without maxing out the moves
        // Convert board to equation string
        const equation = boardToEquation(newBoard);

        if (equation && equation !== this.originalEquation) {
          // add to permutations
          allPermutations.push({
            equation: this.originalEquation,
            solution: equation,
            steps: [...currentSteps, description],
          });
        }
      }

      // Recursively find solutions after this move
      const permutations = this.findPermutations(
        newBoard,
        [...currentSteps, description],
        movesMade + 1,
        maxMoves
      );

      // Add these permutations to our running list
      allPermutations = [...allPermutations, ...permutations];
    }

    return allPermutations;
  }

  private generateAllPossibleMoves(
    board: MatchBoard,
    movesMade: number
  ): { newBoard: MatchBoard; description: string }[] {
    const moves: { newBoard: MatchBoard; description: string }[] = [];

    // For each position in the board
    for (let i = 0; i < board.length; i++) {
      const currentSlots = board[i];

      // Try removing each match
      for (const [key, value] of Object.entries(currentSlots)) {
        // Skip false slots (already no match there)
        if (!value) continue;

        // Create a new board with this match removed
        const newBoard = this.cloneBoard(board);
        newBoard[i] = { ...newBoard[i], [key]: false };

        //also create a flipped board
        let flippedBoard: MatchBoard | null = null;

        if (this.includeFlipped) {
          flippedBoard = flipBoard(newBoard);
        }

        // Try adding to the flipped board and the original board
        for (const board of [newBoard, flippedBoard]) {
          if (!board) continue;

          // Try adding the match at each other possible position
          for (let j = 0; j < board.length; j++) {
            for (const [targetKey, targetValue] of Object.entries(board[j])) {
              // Skip true slots (already a match there)
              if (targetValue) continue;

              if (board !== flippedBoard) {
                //ignore moving it back to the same slot
                if (key === targetKey) continue;
              } else {
                //TODO: avoid moving it back to the same slot even if it's flipped
              }

              // Create another board with the match added in the new position
              const finalBoard = this.cloneBoard(board);
              finalBoard[j] = { ...finalBoard[j], [targetKey]: true };

              // Add this move to our list
              let description = '';

              //if the board is flipped, add the description
              if (board === flippedBoard) {
                description = `Take match from position ${i + 1} ${key}, flip the equation upside down, then move it to position ${j + 1} ${targetKey}`;
              } else {
                description = `Move match from position ${i + 1} ${key} to position ${j + 1} ${targetKey}`;
              }

              moves.push({ newBoard: finalBoard, description });
            }
          }

          if (this.includePrepended) {
            //only prepend if the allowed moves are enough to build the new character
            const movesLeft = this.maxMovableMatches - movesMade;

            if (movesLeft < 1) continue;

            const allowedKeys = {
              1: ['g'],
              2: ['g', 'addv', 'mul_tl_br', 'mul_tr_bl', 'altg', 'divb', 'divt', 'b', 'c'],
            };

            // Try prepending a new character to the equation
            const newSlot = createEmptySlots();

            // Create a board with the new character prepended
            const prependedBoard = this.cloneBoard(board);
            prependedBoard.unshift(newSlot);

            // For each slot in the potential prepended character
            for (const [targetKey, targetValue] of Object.entries(newSlot)) {
              if (
                !allowedKeys[Math.min(movesLeft, 2) as keyof typeof allowedKeys].includes(targetKey)
              ) {
                continue;
              }

              // Skip false slots - we need a slot where the match would go
              newSlot[targetKey as keyof MatchSlots] = true;

              const description = `Take match from position ${i + 1} ${key} and prepend '${targetKey}' to the equation`;

              moves.push({ newBoard: prependedBoard, description });
            }
          }
        }
      }
    }

    return moves;
  }

  private cloneBoard(board: MatchBoard): MatchBoard {
    return board.map(slots => ({ ...slots }));
  }
}

// Function to flip a matchstick board vertically
export function flipBoard(board: MatchBoard): MatchBoard | null {
  // An empty board can be flipped
  if (board.length === 0) {
    return [];
  }

  const flippedBoard: MatchBoard = [];

  for (const slots of board) {
    const flippedSlots = flipSlots(slots);

    // If any slot can't be flipped, the whole board can't be flipped
    if (flippedSlots === null) {
      return null;
    }

    flippedBoard.push(flippedSlots);
  }

  return flippedBoard.reverse();
}

// Function to flip a single slot pattern vertically
export function flipSlots(slots: MatchSlots): MatchSlots | null {
  // These are the slot mappings when flipping vertically:
  // a <-> d, b <-> e, c <-> f, g stays the same, altg stays the same, addv stays the same

  // Division are not flippable
  if (slots.divb || slots.divt) {
    return null;
  }

  //special case for 1
  //keep right aligned e.g. return the original slots
  if (slotToChar(slots) === '1') {
    return slots;
  }

  return {
    // Swap a and d
    a: slots.d,
    d: slots.a,

    // Swap b and e
    b: slots.e,
    e: slots.b,

    // Swap c and f
    c: slots.f,
    f: slots.c,

    // Keep g, altg, and addv the same
    g: slots.g,
    altg: slots.altg,
    addv: slots.addv,

    // These remain false because we checked they're false above
    mul_tl_br: slots.mul_tl_br,
    mul_tr_bl: slots.mul_tr_bl,

    // Division is not flippable
    divb: false,
    divt: false,
  };
}
