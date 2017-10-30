const deprecationsSeen = {};

export const deprecate = (typeof console === 'object' && typeof console.warn === 'function')
  ? msg => {
    if (!deprecationsSeen[msg]) {
      deprecationsSeen[msg] = true;
      console.warn(`redux-observable | DEPRECATION: ${msg}`);
    }
  }
  : () => {};
