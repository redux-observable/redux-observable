let deprecationsSeen = {};
export const resetDeprecationsSeen = () => {
  deprecationsSeen = {};
};

const consoleWarn = (typeof console === 'object' && typeof console.warn === 'function')
  ? (...args) => console.warn(...args)
  : () => { };

export const deprecate = msg => {
  if (!deprecationsSeen[msg]) {
    deprecationsSeen[msg] = true;
    consoleWarn(`redux-observable | DEPRECATION: ${msg}`);
  }
};

export const warn = msg => {
  consoleWarn(`redux-observable | WARNING: ${msg}`);
};
