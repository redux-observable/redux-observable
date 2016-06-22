import { reduxObservable, ActionsObservable, Processor } from '../index';
import { Observable } from 'rxjs/Observable';
interface Action {
  type: string
}
interface ReduxStateShape {
  [key: string]: any
}
// should be a function
reduxObservable();

// should be a constructor that returns an observable
const actionsSubject = Observable.create(() => {});
const aoTest: Observable<string> = new ActionsObservable(actionsSubject);

const processor: Processor<Action, ReduxStateShape> =
  (actions$, { dispatch }) => actions$.ofType('A_TYPE');

// should accept processor
reduxObservable(processor);
