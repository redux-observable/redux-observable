let deprecationsSeen: { [key: string]: boolean } = {};
export const resetDeprecationsSeen = () => {
  deprecationsSeen = {};
};

const consoleWarn = (typeof console === 'object' && typeof console.warn === 'function')
  ? (...args: any[]) => console.warn(...args)
  : () => { };

export const deprecate = (msg: string) => {
  if (!deprecationsSeen[msg]) {
    deprecationsSeen[msg] = true;
    consoleWarn(`redux-observable | DEPRECATION: ${msg}`);
  }
};

export const warn = (msg: string) => {
  consoleWarn(`redux-observable | WARNING: ${msg}`);
};
