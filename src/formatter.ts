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
