/**
 * Matchstick Slot Definitions
 *
 * This file contains the definitions for character slot patterns
 * and recognition functions.
 */
import { MatchSlots } from './types.js';

// Default slot patterns for characters
export const slotPatterns: Record<string, MatchSlots> = {
  // Digits
  '0': {
    a: true,
    b: true,
    c: true,
    d: true,
    e: true,
    f: true,
    g: false,
    altg: false,
    addv: false,
    mul_tl_br: false,
    mul_tr_bl: false,
    divb: false,
    divt: false,
  },
  '1': {
    a: false,
    b: true,
    c: true,
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
  },
  '2': {
    a: true,
    b: true,
    c: false,
    d: true,
    e: true,
    f: false,
    g: true,
    altg: false,
    addv: false,
    mul_tl_br: false,
    mul_tr_bl: false,
    divb: false,
    divt: false,
  },
  '3': {
    a: true,
    b: true,
    c: true,
    d: true,
    e: false,
    f: false,
    g: true,
    altg: false,
    addv: false,
    mul_tl_br: false,
    mul_tr_bl: false,
    divb: false,
    divt: false,
  },
  '4': {
    a: false,
    b: true,
    c: true,
    d: false,
    e: false,
    f: true,
    g: true,
    altg: false,
    addv: false,
    mul_tl_br: false,
    mul_tr_bl: false,
    divb: false,
    divt: false,
  },
  '5': {
    a: true,
    b: false,
    c: true,
    d: true,
    e: false,
    f: true,
    g: true,
    altg: false,
    addv: false,
    mul_tl_br: false,
    mul_tr_bl: false,
    divb: false,
    divt: false,
  },
  '6': {
    a: true,
    b: false,
    c: true,
    d: true,
    e: true,
    f: true,
    g: true,
    altg: false,
    addv: false,
    mul_tl_br: false,
    mul_tr_bl: false,
    divb: false,
    divt: false,
  },
  '7': {
    a: true,
    b: true,
    c: true,
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
  },
  '8': {
    a: true,
    b: true,
    c: true,
    d: true,
    e: true,
    f: true,
    g: true,
    altg: false,
    addv: false,
    mul_tl_br: false,
    mul_tr_bl: false,
    divb: false,
    divt: false,
  },
  '9': {
    a: true,
    b: true,
    c: true,
    d: true,
    e: false,
    f: true,
    g: true,
    altg: false,
    addv: false,
    mul_tl_br: false,
    mul_tr_bl: false,
    divb: false,
    divt: false,
  },

  // Operators
  '+': {
    a: false,
    b: false,
    c: false,
    d: false,
    e: false,
    f: false,
    g: true,
    altg: false,
    addv: true,
    mul_tl_br: false,
    mul_tr_bl: false,
    divb: false,
    divt: false,
  },
  '-': {
    a: false,
    b: false,
    c: false,
    d: false,
    e: false,
    f: false,
    g: true,
    altg: false,
    addv: false,
    mul_tl_br: false,
    mul_tr_bl: false,
    divb: false,
    divt: false,
  },
  '=': {
    a: false,
    b: false,
    c: false,
    d: false,
    e: false,
    f: false,
    g: true,
    altg: true,
    addv: false,
    mul_tl_br: false,
    mul_tr_bl: false,
    divb: false,
    divt: false,
  },
  x: {
    a: false,
    b: false,
    c: false,
    d: false,
    e: false,
    f: false,
    g: false,
    altg: false,
    addv: false,
    mul_tl_br: true,
    mul_tr_bl: true,
    divb: false,
    divt: false,
  },
  '/': {
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
    divb: true,
    divt: true,
  },

  // Other characters
  ' ': {
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
  },
};

const XOR = (a: boolean, b: boolean): boolean => {
  return a !== b;
};

const requiredSet = (slots: boolean[]): boolean => {
  return slots.every(slot => slot);
};

export const slotToChar = (slots: MatchSlots): string | false => {
  //XOR for g and altg

  //0
  if (
    requiredSet([
      slots.a,
      slots.b,
      slots.c,
      slots.d,
      slots.e,
      slots.f,
      !slots.g,
      !slots.altg,
      !slots.addv,
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    return '0';
  }

  //1
  if (
    requiredSet([
      slots.b,
      slots.c,
      !slots.a,
      !slots.d,
      !slots.e,
      !slots.f,
      !slots.g,
      !slots.altg,
      !slots.addv,
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    return '1';
  }

  //2
  if (
    requiredSet([
      slots.a,
      slots.b,
      !slots.c,
      slots.d,
      slots.e,
      !slots.f,
      !slots.addv,
      XOR(slots.g, slots.altg),
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    return '2';
  }

  //3
  if (
    requiredSet([
      slots.a,
      slots.b,
      slots.c,
      slots.d,
      !slots.e,
      !slots.f,
      XOR(slots.g, slots.altg),
      !slots.addv,
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    return '3';
  }

  //4
  if (
    requiredSet([
      !slots.a,
      slots.b,
      slots.c,
      !slots.d,
      !slots.e,
      slots.f,
      XOR(slots.g, slots.altg),
      !slots.addv,
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    return '4';
  }

  //5
  if (
    requiredSet([
      slots.a,
      !slots.b,
      slots.c,
      slots.d,
      !slots.e,
      slots.f,
      XOR(slots.g, slots.altg),
      !slots.addv,
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    return '5';
  }

  //6
  if (
    requiredSet([
      slots.a,
      !slots.b,
      slots.c,
      slots.d,
      slots.e,
      slots.f,
      XOR(slots.g, slots.altg),
      !slots.addv,
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    return '6';
  }

  //7
  if (
    requiredSet([
      slots.a,
      slots.b,
      slots.c,
      !slots.d,
      !slots.e,
      !slots.f,
      !slots.g,
      !slots.altg,
      !slots.addv,
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    return '7';
  }

  //8
  if (
    requiredSet([
      slots.a,
      slots.b,
      slots.c,
      slots.d,
      slots.e,
      slots.f,
      XOR(slots.g, slots.altg),
      !slots.addv,
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    return '8';
  }

  //9
  if (
    requiredSet([
      slots.a,
      slots.b,
      slots.c,
      slots.d,
      !slots.e,
      slots.f,
      XOR(slots.g, slots.altg),
      !slots.addv,
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    return '9';
  }

  //+
  if (
    requiredSet([
      !slots.a,
      !slots.b,
      !slots.c,
      !slots.d,
      !slots.e,
      !slots.f,
      XOR(slots.g, slots.altg),
      slots.addv,
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    return '+';
  }

  //-
  if (
    requiredSet([
      !slots.a,
      !slots.b,
      !slots.c,
      !slots.d,
      !slots.e,
      !slots.f,
      XOR(slots.g, slots.altg),
      !slots.addv,
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    return '-';
  }

  //=
  if (
    requiredSet([
      !slots.a,
      !slots.b,
      !slots.c,
      !slots.d,
      !slots.e,
      !slots.f,
      slots.g,
      slots.altg,
      !slots.addv,
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    return '=';
  }

  //x
  if (
    requiredSet([
      !slots.a,
      !slots.b,
      !slots.c,
      !slots.d,
      !slots.e,
      !slots.f,
      !slots.g,
      !slots.altg,
      !slots.addv,
      slots.mul_tl_br,
      slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    // Always return '*' for multiplication slots pattern
    return 'x';
  }

  // /
  if (
    requiredSet([
      !slots.a,
      !slots.b,
      !slots.c,
      !slots.d,
      !slots.e,
      !slots.f,
      !slots.g,
      !slots.altg,
      !slots.addv,
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      slots.divb,
      slots.divt,
    ])
  ) {
    return '/';
  }

  // ' '
  if (
    requiredSet([
      !slots.a,
      !slots.b,
      !slots.c,
      !slots.d,
      !slots.e,
      !slots.f,
      !slots.g,
      !slots.altg,
      !slots.addv,
      !slots.mul_tl_br,
      !slots.mul_tr_bl,
      !slots.divb,
      !slots.divt,
    ])
  ) {
    return ' ';
  }

  return false;
};
