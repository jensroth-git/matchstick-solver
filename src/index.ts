/**
 * Matchstick Equation Solver
 *
 * A package for solving matchstick equation puzzles
 */

import { slotPatterns, slotToChar } from './slotDefinitions.js';
import { MatchSlots } from './types.js';

export const version = '1.0.0';

//solution type
export type Solution = {
  equation: string;
  solution: string;
  steps: string[];
};

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

  'x': [
    '   ',
    '   ',
    ' x ',
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
    private readonly includeFlipped: boolean = true,
    private readonly includePrepended: boolean = false
  ) {
    // Normalize the equation first
    this.normalizedEquation = preprocessEquation(equation);
    this.originalEquation = equation;
    this.board = equationToBoard(this.normalizedEquation);
  }

  // Helper function to convert a MatchSlots object to a binary number
  private slotsToBinary(slots: MatchSlots): number {
    let bitmask = 0;

    // Map each slot to a bit position
    const slotBits: Record<keyof MatchSlots, number> = {
      a: 1,
      b: 2,
      c: 4,
      d: 8,
      e: 16,
      f: 32,
      g: 64,
      altg: 128,
      addv: 256,
      mul_tl_br: 512,
      mul_tr_bl: 1024,
      divb: 2048,
      divt: 4096,
    };

    // Set bits for each active slot
    for (const [key, value] of Object.entries(slots)) {
      if (value) {
        bitmask |= slotBits[key as keyof MatchSlots];
      }
    }

    return bitmask;
  }

  // Helper function to create a compact board key using number arrays
  private createBoardKey(board: MatchBoard): number[] {
    // Convert each slot in the board to a binary number
    return board.map(slots => this.slotsToBinary(slots));
  }

  // Helper methods to work with visited states using nested Maps for array keys
  private addToVisitedStates(visitedStates: Map<number, any>, boardKey: number[]): void {
    let currentMap = visitedStates;

    // Navigate through the array, creating maps as needed
    for (let i = 0; i < boardKey.length; i++) {
      const value = boardKey[i];

      if (i === boardKey.length - 1) {
        // Last element, mark as visited
        currentMap.set(value, true);
      } else {
        // Create next level map if it doesn't exist
        if (!currentMap.has(value)) {
          currentMap.set(value, new Map<number, any>());
        }
        currentMap = currentMap.get(value);
      }
    }
  }

  private hasVisitedState(visitedStates: Map<number, any>, boardKey: number[]): boolean {
    let currentMap = visitedStates;

    // Navigate through the array
    for (let i = 0; i < boardKey.length; i++) {
      const value = boardKey[i];

      if (!currentMap.has(value)) {
        return false;
      }

      if (i === boardKey.length - 1) {
        // Last element, check if visited
        return true;
      }

      currentMap = currentMap.get(value);
    }

    return false;
  }

  // Helper methods to work with memoization cache using nested Maps for array keys
  private setInMemoCache(
    memoCache: Map<number, any>,
    boardKey: number[],
    movesMade: number,
    value: Solution[]
  ): void {
    let currentMap = memoCache;

    // Navigate through the array, creating maps as needed
    for (let i = 0; i < boardKey.length; i++) {
      const keyValue = boardKey[i];

      if (i === boardKey.length - 1) {
        // Last element, create/get the moves map
        if (!currentMap.has(keyValue)) {
          currentMap.set(keyValue, new Map<number, Solution[]>());
        }
        const movesMap = currentMap.get(keyValue);
        movesMap.set(movesMade, value);
      } else {
        // Create next level map if it doesn't exist
        if (!currentMap.has(keyValue)) {
          currentMap.set(keyValue, new Map<number, any>());
        }
        currentMap = currentMap.get(keyValue);
      }
    }
  }

  private getFromMemoCache(
    memoCache: Map<number, any>,
    boardKey: number[],
    movesMade: number
  ): Solution[] | undefined {
    let currentMap = memoCache;

    // Navigate through the array
    for (let i = 0; i < boardKey.length; i++) {
      const keyValue = boardKey[i];

      if (!currentMap.has(keyValue)) {
        return undefined;
      }

      if (i === boardKey.length - 1) {
        // Last element, get from the moves map
        const movesMap = currentMap.get(keyValue);
        return movesMap.get(movesMade);
      }

      currentMap = currentMap.get(keyValue);
    }

    return undefined;
  }

  private hasMemoCache(
    memoCache: Map<number, any>,
    boardKey: number[],
    movesMade: number
  ): boolean {
    let currentMap = memoCache;

    // Navigate through the array
    for (let i = 0; i < boardKey.length; i++) {
      const keyValue = boardKey[i];

      if (!currentMap.has(keyValue)) {
        return false;
      }

      if (i === boardKey.length - 1) {
        // Last element, check in the moves map
        const movesMap = currentMap.get(keyValue);
        return movesMap.has(movesMade);
      }

      currentMap = currentMap.get(keyValue);
    }

    return false;
  }

  solve(): Solution[] {
    // Create our custom data structures for pure number array keys
    const memoCache = new Map<number, any>();
    const visitedStates = new Map<number, any>();

    //check if the equation is already solved
    if (evaluateEquation(this.originalEquation)) {
      return []; // return empty array if the equation is already solved
    }

    // Pre-compute the initial board key
    const initialBoardKey = this.createBoardKey(this.board);

    // Get permutations from the standard solver
    let permutations = this.findPermutations(
      this.board,
      initialBoardKey,
      [],
      0,
      this.maxMovableMatches,
      memoCache,
      visitedStates
    );

    // remove duplicates
    permutations = this.removeDuplicateSolutions(permutations);

    return permutations;
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
    boardKey: number[],
    currentSteps: string[],
    movesMade: number,
    maxMoves: number,
    memoCache: Map<number, any>,
    visitedStates: Map<number, any>
  ): Solution[] {
    // Check if we've already computed this state
    if (this.hasMemoCache(memoCache, boardKey, movesMade)) {
      // For cached states, we need to append the current steps
      const cachedResults = this.getFromMemoCache(memoCache, boardKey, movesMade)!;
      return cachedResults.map(solution => ({
        ...solution,
        steps: [...currentSteps, ...solution.steps],
      }));
    }

    // Mark this state as visited
    this.addToVisitedStates(visitedStates, boardKey);

    // Base case: we've made all the moves we can
    if (movesMade >= maxMoves) {
      // Convert board to equation string
      const equation = boardToEquation(board);

      // Return valid solutions
      const result =
        equation && equation !== this.normalizedEquation && evaluateEquation(equation)
          ? [
              {
                equation: this.originalEquation,
                solution: equation,
                steps: [...currentSteps],
              },
            ]
          : [];

      // Store the result in the cache with empty steps
      this.setInMemoCache(
        memoCache,
        boardKey,
        movesMade,
        result.map(solution => ({
          ...solution,
          steps: [], // Store with empty steps so we can append current steps when retrieved
        }))
      );

      return result;
    }

    // Generate all possible next moves
    const possibleMoves = this.generateAllPossibleMoves(board, boardKey, movesMade, visitedStates);
    let allPermutations: Solution[] = [];

    // Try each possible move
    for (const { newBoard, newBoardKey, description } of possibleMoves) {
      // For intermediate states, check if we have a valid solution already
      if (movesMade < maxMoves - 1) {
        const equation = boardToEquation(newBoard);
        if (equation && equation !== this.normalizedEquation && evaluateEquation(equation)) {
          // Found a valid solution, add it
          allPermutations.push({
            equation: this.originalEquation,
            solution: equation,
            steps: [...currentSteps, description],
          });
        }
      }

      // Always continue exploring permutations regardless of current state validity
      const permutations = this.findPermutations(
        newBoard,
        newBoardKey,
        [...currentSteps, description],
        movesMade + 1,
        maxMoves,
        memoCache,
        visitedStates
      );

      // Add these permutations to our running list
      allPermutations = [...allPermutations, ...permutations];
    }

    // Store the result in the cache with empty steps
    this.setInMemoCache(
      memoCache,
      boardKey,
      movesMade,
      allPermutations.map(solution => ({
        ...solution,
        steps: solution.steps.slice(currentSteps.length), // Store only the new steps
      }))
    );

    return allPermutations;
  }

  private generateAllPossibleMoves(
    board: MatchBoard,
    boardKey: number[],
    movesMade: number,
    visitedStates: Map<number, any>
  ): { newBoard: MatchBoard; newBoardKey: number[]; description: string }[] {
    const moves: { newBoard: MatchBoard; newBoardKey: number[]; description: string }[] = [];

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

        // Create a new board key by copying the original and updating the position
        const newBoardKey = [...boardKey];
        newBoardKey[i] = this.slotsToBinary(newBoard[i]);

        // Process for original board
        this.processMatchAdditions(
          newBoard,
          newBoardKey,
          i,
          j => j < board.length,
          board,
          key,
          false,
          visitedStates,
          moves
        );

        // Handle prepending if enabled
        if (this.includePrepended) {
          this.processPrepending(newBoard, i, key, false, movesMade, visitedStates, moves);
        }

        // Process flipped board if needed
        if (this.includeFlipped) {
          const flippedBoard = flipBoard(newBoard);
          if (flippedBoard) {
            const flippedBoardKey = this.createBoardKey(flippedBoard);

            this.processMatchAdditions(
              flippedBoard,
              flippedBoardKey,
              i,
              j => j < flippedBoard.length,
              flippedBoard,
              key,
              true,
              visitedStates,
              moves
            );

            // Handle prepending if enabled
            if (this.includePrepended) {
              this.processPrepending(flippedBoard, i, key, true, movesMade, visitedStates, moves);
            }
          }
        }
      }
    }

    return moves;
  }

  private processMatchAdditions(
    board: MatchBoard,
    boardKey: number[],
    sourcePos: number,
    jCondition: (j: number) => boolean,
    positionSource: MatchBoard,
    sourceKey: string,
    isFlipped: boolean,
    visitedStates: Map<number, any>,
    moves: { newBoard: MatchBoard; newBoardKey: number[]; description: string }[]
  ): void {
    for (let j = 0; jCondition(j); j++) {
      for (const [targetKey, targetValue] of Object.entries(positionSource[j])) {
        // Skip true slots (already a match there)
        if (targetValue) continue;

        // Don't move match back to same slot
        if (!isFlipped && sourcePos === j && sourceKey === targetKey) continue;

        // Create a new board with the match added
        const finalBoard = this.cloneBoard(board);
        finalBoard[j] = { ...finalBoard[j], [targetKey]: true };

        // Update the board key for the changed position
        const newBoardKey = [...boardKey];
        newBoardKey[j] = this.slotsToBinary(finalBoard[j]);

        // Skip if we've already visited this board state
        if (this.hasVisitedState(visitedStates, newBoardKey)) continue;

        // Mark as visited
        this.addToVisitedStates(visitedStates, newBoardKey);

        // Add this move to our list
        let description: string;
        if (isFlipped) {
          description = `Take match from position ${sourcePos + 1} ${sourceKey}, flip the equation 180 degrees, then move it to position ${j + 1} ${targetKey}`;
        } else {
          description = `Move match from position ${sourcePos + 1} ${sourceKey} to position ${j + 1} ${targetKey}`;
        }

        moves.push({ newBoard: finalBoard, newBoardKey, description });
      }
    }
  }

  private processPrepending(
    board: MatchBoard,
    sourcePos: number,
    sourceKey: string,
    isFlipped: boolean,
    movesMade: number,
    visitedStates: Map<number, any>,
    moves: { newBoard: MatchBoard; newBoardKey: number[]; description: string }[]
  ): void {
    const movesLeft = this.maxMovableMatches - movesMade;

    if (movesLeft < 1) return;

    const allowedKeys = {
      1: ['g'],
      2: ['g', 'addv', 'mul_tl_br', 'mul_tr_bl', 'altg', 'divb', 'divt', 'b', 'c'],
    };

    // Try prepending a new character to the equation
    const newSlot = createEmptySlots();

    // For each allowable slot in the potential prepended character
    for (const targetKey of Object.keys(newSlot)) {
      if (!allowedKeys[Math.min(movesLeft, 2) as keyof typeof allowedKeys].includes(targetKey)) {
        continue;
      }

      // Set the match in the slot
      newSlot[targetKey as keyof MatchSlots] = true;

      // Create a board with the new character prepended
      const prependedBoard = this.cloneBoard(board);
      prependedBoard.unshift({ ...newSlot });

      // Generate new board key - this will need to be completely recalculated
      const newBoardKey = this.createBoardKey(prependedBoard);

      // Skip if we've already visited this board state
      if (this.hasVisitedState(visitedStates, newBoardKey)) continue;

      // Mark as visited
      this.addToVisitedStates(visitedStates, newBoardKey);

      let description: string;
      if (isFlipped) {
        description = `Take match from position ${sourcePos + 1} ${sourceKey}, flip the equation 180 degrees, then prepend '${targetKey}' to the equation`;
      } else {
        description = `Take match from position ${sourcePos + 1} ${sourceKey} and prepend '${targetKey}' to the equation`;
      }

      moves.push({ newBoard: prependedBoard, newBoardKey, description });
    }
  }

  private cloneBoard(board: MatchBoard): MatchBoard {
    return board.map(slots => ({ ...slots }));
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
