// Define types for the WebAssembly module
interface MatchstickWasmModule {
  _malloc(size: number): number;
  _free(ptr: number): void;
  _initializeSolver(jsonPtr: number): boolean;
  _findSolutions(equationPtr: number, maxMoves: number, allowFlipping: boolean): number;
  _cleanupSolver(): void;
  stringToUTF8(str: string, outPtr: number, maxBytesToWrite: number): void;
  UTF8ToString(ptr: number): string;
}

// Define types for the solution objects
interface Move {
  fromChar: string;
  fromBit: number;
  toChar: string;
  toBit: number;
}

interface Solution {
  equation: string;
  numMoves: number;
  flipped: boolean;
  moves: Move[];
}

// Interface for precomputed equations
interface PrecomputedEquations {
  all_equations?: string[];
  [key: string]: any;
}

// Import our WebAssembly module
// @ts-ignore: Module import might have compatibility issues with TypeScript
import MatchstickModuleFactory from './matchstick_wasm.js';

// Class that wraps the WebAssembly module functionality
class MatchstickSolver {
  private module: MatchstickWasmModule | null;
  private initialized: boolean;
  private solverInitialized: boolean;

  constructor() {
    this.module = null;
    this.initialized = false;
    this.solverInitialized = false;
  }

  // Initialize the WebAssembly module
  async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // @ts-ignore: Dynamic import type mismatch
      this.module = await MatchstickModuleFactory();
      this.initialized = true;
      console.log('MatchstickSolver WebAssembly module initialized');
    } catch (error) {
      console.error('Failed to initialize MatchstickSolver:', error);
      throw error;
    }
  }

  // Initialize the solver with precomputed equations
  async initializeSolver(precomputedEquations: PrecomputedEquations | null = null): Promise<boolean> {
    if (!this.initialized) {
      await this.init();
    }

    if (this.solverInitialized) {
      console.log('Solver already initialized');
      return true;
    }

    try {
      if (!this.module) {
        throw new Error('Module not initialized');
      }

      let precomputedJson = "";
      
      if (precomputedEquations) {
        // If precomputed equations are provided as an object, convert to JSON string
        precomputedJson = JSON.stringify(precomputedEquations);
      }

      // Allocate memory for the JSON string in WebAssembly memory
      const jsonPtr = this.module._malloc(precomputedJson.length + 1);
      
      // Write the JSON to WebAssembly memory
      this.module.stringToUTF8(precomputedJson, jsonPtr, precomputedJson.length + 1);
      
      // Call the C++ initialization function
      const result = this.module._initializeSolver(jsonPtr);
      
      // Free the allocated memory
      this.module._free(jsonPtr);
      
      this.solverInitialized = result;
      return result;
    } catch (error) {
      console.error('Error initializing solver:', error);
      return false;
    }
  }

  // Find solutions for the given matchstick equation
  async findSolutions(equation: string, maxMoves: number = 1, allowFlipping: boolean = true): Promise<Solution[]> {
    if (!this.initialized) {
      await this.init();
    }

    if (!this.solverInitialized) {
      await this.initializeSolver();
    }

    try {
      if (!this.module) {
        throw new Error('Module not initialized');
      }

      // Allocate memory for the equation string in WebAssembly memory
      const equationPtr = this.module._malloc(equation.length + 1);
      
      // Write the equation to WebAssembly memory
      this.module.stringToUTF8(equation, equationPtr, equation.length + 1);
      
      // Call the C++ function
      const resultPtr = this.module._findSolutions(equationPtr, maxMoves, allowFlipping);
      
      // Read the result as a string
      const result = this.module.UTF8ToString(resultPtr);
      
      // Free the allocated memory
      this.module._free(equationPtr);
      
      // Parse and return the JSON result
      return JSON.parse(result) as Solution[];
    } catch (error) {
      console.error('Error in findSolutions:', error);
      throw error;
    }
  }

  // Clean up resources when done
  cleanup(): void {
    if (this.initialized && this.solverInitialized && this.module) {
      try {
        this.module._cleanupSolver();
        this.solverInitialized = false;
      } catch (error) {
        console.error('Error cleaning up solver:', error);
      }
    }
  }
}

export default MatchstickSolver; 