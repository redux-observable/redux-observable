import { expect } from 'chai';
import { createStore, applyMiddleware, MiddlewareAPI, Action } from 'redux';
import { Observable, asapScheduler, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, mapTo, mergeMap } from 'rxjs/operators';

import { createEpicMiddleware, Epic, combineEpics,
  EpicMiddleware, ActionsObservable, StateObservable, ofType } from '../';
import { initAction } from './initAction';

interface State {
  foo: string
}

interface FluxStandardAction {
  type: string | symbol | any;
  payload?: any;
  error?: boolean | any;
  meta?: any
}

interface Dependencies {
  func(value: string): string;
}

const epic1: Epic<FluxStandardAction, FluxStandardAction, State> = (action$, state$) =>
  action$.pipe(
    ofType('FIRST'),
    map(() => ({
      type: 'first',
      payload: state$.value
    }))
  );

const epic2: Epic<FluxStandardAction> = action$ =>
  action$.pipe(
    ofType('SECOND', 'NEVER'),
    mapTo('second'),
    mergeMap(type => of({ type }))
  );

const epic3: Epic<FluxStandardAction> = action$ =>
  action$.pipe(
    ofType('THIRD'),
    mapTo({
      type: 'third'
    })
  );


const epic4: Epic<FluxStandardAction> = () =>
  of({
    type: 'fourth'
  });

const epic5: Epic<FluxStandardAction> = action$ =>
  action$.pipe(
    ofType('FIFTH'),
    mergeMap(({ type, payload }) => of({
      type: 'fifth',
      payload
    }))
  );

const epic6: Epic<FluxStandardAction> = action$ =>
  action$.pipe(
    ofType('SIXTH'),
    map(({ type, payload }) => ({
      type: 'sixth',
      payload
    }))
  );

const epic7: Epic<FluxStandardAction, FluxStandardAction, State, Dependencies> = (action$, state$, dependencies) =>
  action$.pipe(
    ofType('SEVENTH'),
    map(({ type, payload }) => ({
      type: 'seventh',
      payload: dependencies.func(payload)
    }))
  );

const epic8: Epic<FluxStandardAction, FluxStandardAction, State, Dependencies> = (action$, state$, dependencies) =>
  action$.pipe(
    ofType('EIGHTH'),
    map(({ type, payload }) => ({
      type: 'eighth',
      payload
    }))
  );

interface Epic9_Input {
  type: "NINTH",
  payload: string,
}
interface Epic9_Output {
  type: "ninth",
  payload: string,
}

const epic9_1: Epic<FluxStandardAction, Epic9_Output, State, Dependencies> = (action$, state$, dependencies) =>
  action$.pipe(
    ofType<FluxStandardAction, Epic9_Input>('NINTH'),
    map(({ type, payload }) => ({
      type: 'ninth' as 'ninth',
      payload: dependencies.func("ninth-" + payload),
    }))
  );

const epic9_2 = (action$: ActionsObservable<FluxStandardAction>, state$: StateObservable<void>, dependencies: Dependencies) =>
  action$.pipe(
    ofType<FluxStandardAction, Epic9_Input>('NINTH'),
    map(({ type, payload }) => ({
      type: 'ninth',
      payload: dependencies.func("ninth-" + payload),
    } as Epic9_Output))
  );
const rootEpic1: Epic<FluxStandardAction> = combineEpics<FluxStandardAction, FluxStandardAction, any>(epic1, epic2, epic3, epic4, epic5, epic6, epic7, epic8, epic9_1);
const rootEpic2 = combineEpics(epic1, epic2, epic3, epic4, epic5, epic6, epic7, epic8, epic9_2);

const dependencies: Dependencies = {
  func(value: string) { return `func-${value}`}
};

const epicMiddleware1: EpicMiddleware<FluxStandardAction> = createEpicMiddleware<FluxStandardAction>({ dependencies });
const epicMiddleware2 = createEpicMiddleware({ dependencies });

interface CustomEpic<T extends Action, S, U> {
  (action$: ActionsObservable<T>, state$: StateObservable<S>, api: U): Observable<T>;
}

const customEpic: CustomEpic<FluxStandardAction, State, number> = (action$, state$, some) =>
  action$.pipe(
    ofType('CUSTOM1'),
    map(({ type, payload }) => ({
      type: 'custom1',
      payload
    }))
  );

const customEpic2: CustomEpic<FluxStandardAction, State, number> = (action$, state$, some) =>
  action$.pipe(
    ofType('CUSTOM2'),
    map(({ type, payload }) => ({
      type: 'custom2',
      payload
    }))
  );

const customEpicMiddleware: EpicMiddleware<FluxStandardAction> = createEpicMiddleware<FluxStandardAction>({
  dependencies: { getJSON: ajax.getJSON }
});

const combinedCustomEpics = combineEpics<CustomEpic<FluxStandardAction, State, number>>(customEpic, customEpic2);

const reducer = (state: Array<FluxStandardAction> = [], action: FluxStandardAction) => state.concat(action);
const store = createStore(
  reducer,
  applyMiddleware(epicMiddleware1, epicMiddleware2)
);

epicMiddleware1.run(rootEpic1);
epicMiddleware1.run(rootEpic2);

store.dispatch({ type: 'FIRST' });
store.dispatch({ type: 'SECOND' });
store.dispatch({ type: 'FIFTH', payload: 'fifth-payload' });
store.dispatch({ type: 'SIXTH', payload: 'sixth-payload' });
store.dispatch({ type: 'SEVENTH', payload: 'seventh-payload' });
store.dispatch({ type: 'EIGHTH', payload: 'eighth-payload' });
store.dispatch({ type: 'NINTH', payload: 'ninth-payload' });

expect(store.getState()).to.deep.equal([
  initAction,
  { "type": "fourth" },
  { "type": "fourth" },
  { "type": "FIRST" },
  { "type": "first",
    "payload": [
      initAction,
      { "type": "fourth" },
      { "type": "fourth" },
      { "type": "FIRST" }
    ]
  },
  { "type": "first",
    "payload": [
      initAction,
      { "type": "fourth" },
      { "type": "fourth" },
      { "type": "FIRST" },
      { "type": "first",
        "payload": [
          initAction,
          { "type": "fourth" },
          { "type": "fourth" },
          { "type": "FIRST" }
        ]
      },
    ]
  },
  { "type": "SECOND" },
  { "type": "second" },
  { "type": "second" },
  { "type": "FIFTH", "payload": "fifth-payload" },
  { "type": "fifth", "payload": "fifth-payload" },
  { "type": "fifth", "payload": "fifth-payload" },
  { "type": "SIXTH", "payload": "sixth-payload" },
  { "type": "sixth", "payload": "sixth-payload" },
  { "type": "sixth", "payload": "sixth-payload" },
  { "type": "SEVENTH", "payload": "seventh-payload" },
  { "type": "seventh", "payload": "func-seventh-payload" },
  { "type": "seventh", "payload": "func-seventh-payload" },
  { "type": "EIGHTH", "payload": "eighth-payload" },
  { "type": "eighth", "payload": "eighth-payload" },
  { "type": "eighth", "payload": "eighth-payload" },
  { "type": "NINTH", "payload": "ninth-payload" },
  { "type": "ninth", "payload": "func-ninth-ninth-payload" },
  { "type": "ninth", "payload": "func-ninth-ninth-payload" },
]);

const input$ = Observable.create(() => {});
const action$1: ActionsObservable<FluxStandardAction> = new ActionsObservable<FluxStandardAction>(input$);
const action$2: ActionsObservable<FluxStandardAction> = ActionsObservable.of<FluxStandardAction>({ type: 'SECOND' }, { type: 'FIRST' }, asapScheduler);
const action$3: ActionsObservable<FluxStandardAction> = ActionsObservable.from<FluxStandardAction>([{ type: 'SECOND' }, { type: 'FIRST' }], asapScheduler);

{
  // proper type narrowing
  const enum ActionTypes {
    One = 'ACTION_ONE',
    Two = 'ACTION_TWO',
  }
  const doOne = (myStr: string): One => ({type: ActionTypes.One, myStr})
  const doTwo = (myBool: boolean): Two => ({type: ActionTypes.Two, myBool})

  interface One extends Action {
    type: ActionTypes.One
    myStr: string
  }
  interface Two extends Action {
    type: ActionTypes.Two
    myBool: boolean
  }
  type Actions = One | Two

// Explicitly set generics fixes the issue
const epic = (action$: ActionsObservable<Actions>) =>
  action$.pipe(
    ofType<Actions,One>(ActionTypes.One),
    // action is correctly narrowed to One
    map((action) => { console.log(action.myStr) })
  );

}

console.log('typings.ts: OK');
