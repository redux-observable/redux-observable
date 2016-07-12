import { createEpicMiddleware, ActionsObservable } from '../index';
import { Observable } from 'rxjs/Observable';

// should be a function
createEpicMiddleware();

// should be a constructor that returns an observable
const actionsSubject = Observable.create(() => {});
const aoTest: Observable<string> = new ActionsObservable(actionsSubject);
