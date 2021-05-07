let deprecationsSeen: { [key: string]: boolean } = {};
export const resetDeprecationsSeen = (): void => {
  deprecationsSeen = {};
};

const consoleWarn = (typeof console === 'object' && typeof console.warn === 'function')
  ? (...args: any[]) => console.warn(...args)
  : () => { };

export const deprecate = (msg: string): void => {
  if (!deprecationsSeen[msg]) {
    deprecationsSeen[msg] = true;
    consoleWarn(`redux-observable | DEPRECATION: ${msg}`);
  }
};

export const warn = (msg: string): void => {
  consoleWarn(`redux-observable | WARNING: ${msg}`);
};
