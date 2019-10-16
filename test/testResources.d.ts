import 'redux';

declare module 'redux' {
  interface ActionTypes {
    INIT: string;
  }
  // eslint-disable-next-line
  export const __DO_NOT_USE__ActionTypes: ActionTypes;
}
