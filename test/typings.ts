import { reduxObservable, ActionsObservable, Processor } from '../index';
import { Observable, Subject } from 'rxjs';
import { Store } from 'redux';

interface Action {
  type: string
}

interface ReduxStateShape {
  [key: string]: any
}

// should be a function
reduxObservable();

// should be a constructor that returns an observable
const actionsSubject = new Subject<Action>();
const aoTest = new ActionsObservable<Action>(actionsSubject);

const processor: Processor<Action, Store<ReduxStateShape> >
  = (action$, { dispatch }) => action$.ofType('A_TYPE').do(v => dispatch(v));

reduxObservable(processor);