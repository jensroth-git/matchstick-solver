import MatchstickSolver from './wrapper.js';
import { matchstickFormatter } from './formatter.js';
import type { Solution } from './wrapper.js';

/**
 * Matchstick Equation Solver
 *
 * A high-performance package for solving matchstick equation puzzles
 * Powered by WebAssembly for constant-time solution lookups
 */

// Export individual functions/classes and types
export { MatchstickSolver };
export { matchstickFormatter };
export type { Solution };

// Default export for backward compatibility
export default MatchstickSolver;
