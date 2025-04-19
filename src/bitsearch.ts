import { equationToBoard, flipBoard } from './index.js';
import { MatchSlots, MatchBoard, MatchstickMove } from './types.js';

const BITS_PER_CHAR = 13;
export type CharBits = number; // 0–8191
export type BitBoard = CharBits[];

export type SearchOptions = {
  maxDepth: number;
  allowPrepend?: boolean;
  allowAppend?: boolean;
};

export class BitSearch {
  // Helper function to convert a MatchSlots object to a binary number
  private slotsToBinary(slots: MatchSlots): CharBits {
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

  private binaryToSlots(bitmask: CharBits): MatchSlots {
    const slots: MatchSlots = {
      a: (bitmask & 1) !== 0,
      b: (bitmask & 2) !== 0,
      c: (bitmask & 4) !== 0,
      d: (bitmask & 8) !== 0,
      e: (bitmask & 16) !== 0,
      f: (bitmask & 32) !== 0,
      g: (bitmask & 64) !== 0,
      altg: (bitmask & 128) !== 0,
      addv: (bitmask & 256) !== 0,
      mul_tl_br: (bitmask & 512) !== 0,
      mul_tr_bl: (bitmask & 1024) !== 0,
      divb: (bitmask & 2048) !== 0,
      divt: (bitmask & 4096) !== 0,
    };

    return slots;
  }

  // Helper function to create a compact board key using number arrays
  public boardToBits(board: MatchBoard): BitBoard {
    // Convert each slot in the board to a binary number
    return board.map(slots => this.slotsToBinary(slots));
  }

  public bitsToBoard(bits: BitBoard): MatchBoard {
    return bits.map(bit => this.binaryToSlots(bit));
  }

  public findBoardThisFirst: BitBoard | null = null;
  public findBoardThisSecond: BitBoard | null = null;

  public searchBoard(
    board: BitBoard, // initial board, NOT yet encoded into BigInt
    options: SearchOptions
  ): BitBoard[] {
    //const flippedBoard = flipBoard(findBoard);
    this.findBoardThisFirst = this.boardToBits(equationToBoard('3+3=8'));
    this.findBoardThisSecond = this.boardToBits(equationToBoard('3+5=8'));

    const paddedBoard = [
      ...(options.allowPrepend ? [0] : []), // empty char at start
      ...board,
      ...(options.allowAppend ? [0] : []), // empty char at end
    ];

    return this.rawBitSearch(paddedBoard, options.maxDepth);
  }

  private rawBitSearch(initial: BitBoard, maxDepth: number): BitBoard[] {
    const results: BitBoard[] = [];
    const visited: Set<string> = new Set();

    const encode = (board: BitBoard, depth: number) => board.join(',') + ':' + depth; // fast hashing

    const mutate = (board: BitBoard, depth: number) => {
      if (depth > maxDepth) return;

      const hash = encode(board, depth);

      //we already visited this board at this depth, skip
      if (visited.has(hash)) return;

      //store every board we visit, since intermediate boards are not always valid
      results.push(board);
      visited.add(hash);

      //generate all possible mutations of the board
      for (const next of this.generateBitMutations(board)) {
        mutate(next, depth + 1);
      }
    };

    mutate(initial, 0);
    return results;
  }

  private *generateBitMutations(board: BitBoard): Iterable<BitBoard> {
    const totalBits = board.length * BITS_PER_CHAR;

    for (let from = 0; from < totalBits; from++) {
      const fromChar = Math.floor(from / BITS_PER_CHAR);
      const fromBit = from % BITS_PER_CHAR;

      if ((board[fromChar] & (1 << fromBit)) === 0) continue;

      for (let to = 0; to < totalBits; to++) {
        const toChar = Math.floor(to / BITS_PER_CHAR);
        const toBit = to % BITS_PER_CHAR;

        if ((board[toChar] & (1 << toBit)) !== 0) continue;

        const newBoard = [...board];
        newBoard[fromChar] ^= 1 << fromBit;
        newBoard[toChar] ^= 1 << toBit;

        yield newBoard;
      }
    }
  }

  public diffBoards(from: BitBoard, to: BitBoard): MatchstickMove[] {
    const moves: MatchstickMove[] = [];

    const fromBits = from.flatMap((val, i) =>
      [...Array(BITS_PER_CHAR).keys()].filter(b => val & (1 << b)).map(b => ({ char: i, bit: b }))
    );

    const toBits = to.flatMap((val, i) =>
      [...Array(BITS_PER_CHAR).keys()].filter(b => val & (1 << b)).map(b => ({ char: i, bit: b }))
    );

    const removed = fromBits.filter(
      fb => !toBits.some(tb => tb.char === fb.char && tb.bit === fb.bit)
    );
    const added = toBits.filter(
      tb => !fromBits.some(fb => fb.char === tb.char && fb.bit === tb.bit)
    );

    if (removed.length === added.length) {
      for (let i = 0; i < removed.length; i++) {
        moves.push({
          fromChar: removed[i].char,
          fromBit: removed[i].bit,
          toChar: added[i].char,
          toBit: added[i].bit,
        });
      }
    }

    return moves;
  }
}
