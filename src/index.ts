/**
 * Matchstick Equation Solver
 *
 * A package for solving matchstick equation puzzles
 */

import { BitBoard, BitSearch } from './bitsearch.js';
import { slotPatterns, slotToChar } from './slotDefinitions.js';
import { MatchSlots, MatchBoard, Solution, MatchstickMove } from './types.js';

export { type MatchSlots, type MatchBoard, type Solution };
export * from './formatter.js';

// Re-export the slot definitions
export { slotPatterns, slotToChar };

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

/**
 * Preprocess an equation string to normalize it
 * - Removes whitespace
 * - Converts '*', '×' to 'x' for multiplication
 */
export function preprocessEquation(equation: string): string {
  // Remove all whitespace
  let processed = equation.replace(/\s+/g, '');

  // Replace all variations of multiplication symbol with '*'
  processed = processed.replace(/[*×]/g, 'x');

  return processed;
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
    // Normalize the equation before evaluation
    const normalized = preprocessEquation(equation);
    return !!eval(' ' + normalized.replace('=', '==').replace('x', '*') + ' ');
  } catch (x) {
    return false;
  }
}

// This will be our main API
export default class MatchstickSolver {
  private readonly board: MatchBoard;
  private readonly originalEquation: string;
  private readonly normalizedEquation: string;

  constructor(
    private readonly equation: string,
    private readonly maxMovableMatches: number = 1,
    private readonly allowFlipping: boolean = true,
    private readonly allowPrepending: boolean = false,
    private readonly allowAppending: boolean = false
  ) {
    this.originalEquation = equation;

    // Normalize the equation first
    this.normalizedEquation = preprocessEquation(equation);
    this.board = equationToBoard(this.normalizedEquation);
  }

  solve(): Solution[] {
    //check if the equation is already solved
    if (evaluateEquation(this.originalEquation)) {
      return []; // return empty array if the equation is already solved
    }

    const bitSearch = new BitSearch();

    const startingBitBoard = bitSearch.boardToBits(this.board);
    const solutions = bitSearch.searchBoard(startingBitBoard, {
      maxDepth: this.maxMovableMatches,
      allowPrepend: this.allowPrepending,
      allowAppend: this.allowAppending,
    });

    const solutionEquations = new Set<string>();

    const validSolutions: {
      bitboard: BitBoard;
      board: MatchBoard;
      equation: string;
      moves: MatchstickMove[];
      flipped: boolean;
    }[] = [];

    for (const solution of solutions) {
      //solutions is a raw mess of bits, we need to convert them back to boards
      const board = bitSearch.bitsToBoard(solution);

      let moves: MatchstickMove[] = [];

      const checkVariation = (board: MatchBoard, flipped: boolean = false) => {
        //check if the board is valid
        const equation = boardToEquation(board);
        if (equation === null) {
          return;
        }

        if (equation == '3+5=8') {
          debugger;
          console.log(equation);
        }

        if (solutionEquations.has(equation)) {
          //check if the equation is already in the set
          return;
        }

        //check if the equation is valid
        if (evaluateEquation(equation)) {
          //only calculate moves once per solution
          if (moves.length === 0) {
            moves = bitSearch.diffBoards(startingBitBoard, solution);
          }

          //add the equation to the set
          solutionEquations.add(equation);

          validSolutions.push({
            bitboard: solution,
            board,
            equation,
            moves,
            flipped,
          });
        }
      };

      //check the original board
      checkVariation(board, false);

      //if we should allow flipping, check if the board is valid even if it's flipped
      if (this.allowFlipping) {
        const flippedBoard = flipBoard(board);
        if (flippedBoard === null) {
          continue;
        }

        //check the flipped board
        checkVariation(flippedBoard, true);
      }
    }

    //sort the solutions by the number of moves (least to most)
    //and flips (least to most)
    validSolutions.sort(
      (a, b) => (a.flipped ? 1 : 0) - (b.flipped ? 1 : 0) || a.moves.length - b.moves.length
    );

    //return the solutions
    return validSolutions.map(solution => ({
      solution: solution.equation,
      steps: solution.moves,
      flipped: solution.flipped,
    }));
  }
}

// Function to flip a matchstick board 180 degrees
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
