// Define MatchSlots type here instead of importing from index to avoid circular dependencies
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

export type MatchstickMove = {
  fromChar: number;
  fromBit: number;
  toChar: number;
  toBit: number;
};

//solution type
export type Solution = {
  solution: string;
  steps: MatchstickMove[];
  flipped: boolean;
};

// The entire equation as a series of slot cells
export type MatchBoard = MatchSlots[];
