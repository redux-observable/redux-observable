import { expect } from 'chai';
import { createStore, applyMiddleware, MiddlewareAPI } from 'redux';
import { Observable } from 'rxjs/Observable';
import { asap } from 'rxjs/scheduler/asap';
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

const epic1: Epic<FluxStandardAction, any> = (action$: ActionsObservable<FluxStandardAction>, store) =>
  action$.ofType('FIRST')
    .mapTo({
      type: 'first',
      payload: store.getState()
    });

const epic2: Epic<FluxStandardAction, any> = (action$, store) =>
  action$.ofType('SECOND', 'NEVER')
    .mapTo('second')
    .mergeMap(type => Observable.of({ type }));

const epic3: Epic<FluxStandardAction, any> = action$ =>
  action$.ofType('THIRD')
    .mapTo({
      type: 'third'
    });

const epic4: Epic<FluxStandardAction, any> = () =>
  Observable.of({
    type: 'fourth'
  });

const epic5: Epic<FluxStandardAction, any> = (action$, store) =>
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

const rootEpic1: Epic<FluxStandardAction, any> = combineEpics<FluxStandardAction, any>(epic1, epic2, epic3, epic4, epic5, epic6);
const rootEpic2 = combineEpics(epic1, epic2, epic3, epic4, epic5, epic6);

const epicMiddleware1: EpicMiddleware<FluxStandardAction, any> = createEpicMiddleware<FluxStandardAction, any>(rootEpic1);
const epicMiddleware2 = createEpicMiddleware(rootEpic2);

interface CustomEpic<T, S, U> {
  (action$: ActionsObservable<T>, store: MiddlewareAPI<S>, api: U): Observable<T>;
}

const customEpic: CustomEpic<FluxStandardAction, any, number> = (action$, store, some) =>
  action$.ofType('CUSTOM1')
    .map(({ type, payload }) => ({
      type: 'custom1',
      payload
    }));

const customEpic2 = (action$, store, some) =>
  action$.ofType('CUSTOM2')
    .map(({ type, payload }) => ({
      type: 'custom2',
      payload
    }));

const combinedCustomEpics = combineEpics<CustomEpic<FluxStandardAction, any, any>>(customEpic, customEpic2);

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

const input$ = Observable.create(() => {});
const action$1: ActionsObservable<FluxStandardAction> = new ActionsObservable<FluxStandardAction>(input$);
const action$2: ActionsObservable<FluxStandardAction> = ActionsObservable.of<FluxStandardAction>({ type: 'SECOND' }, { type: 'FIRST' }, asap);
const action$3: ActionsObservable<FluxStandardAction> = ActionsObservable.from<FluxStandardAction>([{ type: 'SECOND' }, { type: 'FIRST' }], asap);

console.log('typings.ts: OK');
