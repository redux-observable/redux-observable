const deprecationsSeen = {};

export const deprecate = (typeof console === 'object' && typeof console.warn === 'function')
  ? msg => {
    if (!deprecationsSeen[msg]) {
      deprecationsSeen[msg] = true;
      console.warn(`redux-observable | DEPRECATION: ${msg}`);
    }
  }
  : () => {};

export const warn = (typeof console === 'object' && typeof console.warn === 'function')
  ? msg => {
    console.warn(`redux-observable | WARNING: ${msg}`);
  }
  : () => {};
