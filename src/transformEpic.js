import { ActionsObservable } from './ActionsObservable';

export const transformEpic = (epic, transformer) => (action$, store) =>
  transformer(
    ActionsObservable.from(epic(action$, store)),
    store
  );
