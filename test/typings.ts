import { expect } from 'chai';
import { createStore, applyMiddleware } from 'redux';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { createEpicMiddleware, Epic, combineEpics,
  EpicMiddleware, ActionsObservable } from '../';

interface FluxStandardAction {
  type: string | symbol | any;
  payload?: any;
  error?: boolean | any;
  meta?: any
}

const epic1: Epic<FluxStandardAction> = (action$: ActionsObservable<FluxStandardAction>, store) =>
  action$.ofType('FIRST')
    .mapTo({
      type: 'first',
      payload: store.getState()
    });

const epic2: Epic<FluxStandardAction> = (action$, store) =>
  action$.ofType('SECOND', 'NEVER')
    .mapTo('second')
    .mergeMap(type => Observable.of({ type }));

const epic3: Epic<FluxStandardAction> = action$ =>
  action$.ofType('THIRD')
    .mapTo({
      type: 'third'
    });

const epic4: Epic<FluxStandardAction> = () =>
  Observable.of({
    type: 'fourth'
  });

const epic5: Epic<FluxStandardAction> = (action$, store) =>
  action$.ofType('FIFTH')
    .flatMap(({ type, payload }) => Observable.of({
      type: 'fifth',
      payload
    }));

const epic6 = (action$, store) =>
  action$.ofType('SIXTH')
    .map(({ type, payload }) => ({
      type: 'sixth',
      payload
    }));

const rootEpic1: Epic<FluxStandardAction> = combineEpics<FluxStandardAction>(epic1, epic2, epic3, epic4, epic5, epic6);
const rootEpic2 = combineEpics(epic1, epic2, epic3, epic4, epic5, epic6);

const epicMiddleware1: EpicMiddleware<FluxStandardAction> = createEpicMiddleware<FluxStandardAction>(rootEpic1);
const epicMiddleware2 = createEpicMiddleware(rootEpic2);

// should be a constructor that returns an observable
const input$ = Observable.create(() => {});
const action$: ActionsObservable<FluxStandardAction> = new ActionsObservable<FluxStandardAction>(input$);

const reducer = (state = [], action) => state.concat(action);
const store = createStore(
  reducer,
  applyMiddleware(epicMiddleware1, epicMiddleware2)
);

epicMiddleware1.replaceEpic(rootEpic2);
epicMiddleware2.replaceEpic(rootEpic1)

store.dispatch({ type: 'FIRST' });
store.dispatch({ type: 'SECOND' });
store.dispatch({ type: 'FIFTH', payload: 'fifth-payload' });
store.dispatch({ type: 'SIXTH', payload: 'sixth-payload' });

expect(store.getState()).to.deep.equal([
  { "type": "@@redux/INIT" },
  { "type": "fourth" },
  { "type": "fourth" },
  { "type": "@@redux-observable/EPIC_END" },
  { "type": "fourth" },
  { "type": "@@redux-observable/EPIC_END" },
  { "type": "fourth" },
  { "type": "FIRST" },
  { "type": "first",
    "payload": [
      { "type": "@@redux/INIT" },
      { "type": "fourth" },
      { "type": "fourth" },
      { "type": "@@redux-observable/EPIC_END" },
      { "type": "fourth" },
      { "type": "@@redux-observable/EPIC_END" }
    ]
  },
  { "type": "first",
    "payload": [
      { "type": "@@redux/INIT" },
      { "type": "fourth" },
      { "type": "fourth" },
      { "type": "@@redux-observable/EPIC_END" }
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
  { "type": "sixth", "payload": "sixth-payload" }
]);

console.log('typings.ts: OK');
