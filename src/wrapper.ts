// Define types for the WebAssembly module
interface MatchstickWasmModule {
  _malloc(size: number): number;
  _free(ptr: number): void;
  _initializeSolver(jsonPtr: number): boolean;
  _findSolutions(equationPtr: number, maxMoves: number, allowFlipping: boolean): number;
  _cleanupSolver(): void;
  ccall(ident: string, returnType: string, argTypes: string[], args: any[]): any;
  cwrap(ident: string, returnType: string, argTypes: string[]): Function;
  UTF8ToString(ptr: number): string;
  stringToUTF8(str: string, outPtr: number, maxBytesToWrite: number): void;
  FS: any;
}

// Define types for the solution objects
interface Move {
  fromChar: string;
  fromBit: number;
  toChar: string;
  toBit: number;
}

export interface Solution {
  equation: string;
  numMoves: number;
  flipped: boolean;
  moves: Move[];
}

// Import path and url for file operations
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import our WebAssembly module
// @ts-ignore: Module import might have compatibility issues with TypeScript
import MatchstickModuleFactory from './web/matchstick_wasm.js';

// Get the current directory for resolving WASM paths
function getCurrentDir() {
  try {
    // For ESM
    if (typeof import.meta.url !== 'undefined') {
      const __filename = fileURLToPath(import.meta.url);
      return path.dirname(__filename);
    }
    // For CommonJS
    else if (typeof __dirname !== 'undefined') {
      return __dirname;
    }
    // Fallback
    return process.cwd();
  } catch (error) {
    return process.cwd();
  }
}

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

  /**
   * Preprocess an equation string to normalize it
   * - Removes whitespace
   * - Converts '*', '×' to 'x' for multiplication
   */
  static preprocessEquation(equation: string): string {
    // Remove all whitespace
    let processed = equation.replace(/\s+/g, '');

    // Replace all variations of multiplication symbol with '*'
    processed = processed.replace(/[*×]/g, 'x');

    return processed;
  }

  // Initialize the WebAssembly module
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // @ts-ignore: Dynamic import type mismatch
      this.module = await MatchstickModuleFactory({
        // Set the locateFile function to find wasm file in the correct location
        locateFile: (filename: string) => {
          const currentDir = getCurrentDir();
          const webDir = path.resolve(currentDir, '..', 'web');
          const filePath = path.join(webDir, filename);

          if (fs.existsSync(filePath)) {
            return filePath;
          }

          // Fallback paths
          const potentialPaths = [
            // From dist directory
            path.join(currentDir, 'web', filename),
            // From src directory
            path.join(currentDir, '..', 'src', 'web', filename),
            // From project root
            path.join(process.cwd(), 'dist', 'web', filename),
            path.join(process.cwd(), 'src', 'web', filename),
          ];

          for (const potentialPath of potentialPaths) {
            if (fs.existsSync(potentialPath)) {
              return potentialPath;
            }
          }

          console.warn(`WASM file not found: ${filename}. Trying default location.`);
          return filename;
        },
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize MatchstickSolver:', error);
      throw error;
    }
  }

  // Initialize the solver with precomputed equations
  async initializeSolver(precomputedEquationsPath: string | null = null): Promise<boolean> {
    if (!this.initialized) {
      await this.init();
    }

    if (this.solverInitialized) {
      return true;
    }

    try {
      if (!this.module) {
        throw new Error('Module not initialized');
      }

      let jsonPath = precomputedEquationsPath;

      if (!jsonPath) {
        throw new Error('Precomputed equations path is required');
      }

      // Check if the file exists, otherwise try to resolve it
      if (!fs.existsSync(jsonPath)) {
        const currentDir = getCurrentDir();
        const potentialPaths = [
          // From dist directory
          path.join(currentDir, '..', jsonPath),
          // From root directory
          path.join(process.cwd(), jsonPath),
          // From dist directory
          path.join(process.cwd(), 'dist', jsonPath),
          // Absolute path in dist
          path.join(process.cwd(), 'dist', 'precomputed_equations.json'),
        ];

        for (const potentialPath of potentialPaths) {
          if (fs.existsSync(potentialPath)) {
            jsonPath = potentialPath;
            break;
          }
        }
      }

      if (!fs.existsSync(jsonPath)) {
        throw new Error(`Could not find precomputed equations file: ${jsonPath}`);
      }

      const jsonText = fs.readFileSync(jsonPath, 'utf8');

      // Upload file to memory
      try {
        this.module.FS.mkdir('/data');
      } catch {
        /* Folder already exists */
      }

      this.module.FS.writeFile('/data/precomputed.json', jsonText);

      // Use ccall instead of direct method calls
      const result = this.module.ccall(
        'initializeSolver',
        'boolean',
        ['string'],
        ['/data/precomputed.json']
      );

      this.solverInitialized = result;
      return result;
    } catch (error) {
      console.error('Error initializing solver:', error);
      return false;
    }
  }

  // Find solutions for the given matchstick equation
  async findSolutions(
    equation: string,
    maxMoves: number = 1,
    allowFlipping: boolean = true
  ): Promise<Solution[]> {
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

      //preprocess equation
      equation = MatchstickSolver.preprocessEquation(equation);

      // Use ccall instead of direct memory management
      const result = this.module.ccall(
        'findSolutions',
        'string',
        ['string', 'number', 'boolean'],
        [equation, maxMoves, allowFlipping]
      );

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
        this.module.ccall('cleanupSolver', 'void', [], []);
        this.solverInitialized = false;
      } catch (error) {
        console.error('Error cleaning up solver:', error);
      }
    }
  }
}

export default MatchstickSolver;
