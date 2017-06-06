export const identity = x => x;

export const defaultAdapter = {
  input: identity,
  output: identity
};

export const defaultOptions = {
  adapter: defaultAdapter
};
