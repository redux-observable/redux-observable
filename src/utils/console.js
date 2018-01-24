const deprecationsSeen = {};

export const warn = (typeof console === 'object' && typeof console.warn === 'function')
  ? msg => console.warn(msg)
  : () => {};

export const deprecate = msg => {
  if (!deprecationsSeen[msg]) {
    deprecationsSeen[msg] = true;
    warn(`redux-observable | DEPRECATION: ${msg}`);
  }
};
