import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operator/filter';

export class ActionsObservable extends Observable {
  constructor(actionsSubject) {
    super();
    this.source = actionsSubject;
  }

  lift(operator) {
    const observable = new ActionsObservable(this);
    observable.operator = operator;
    return observable;
  }

  ofType(key) {
    return this::filter((action) => action.type === key);
  }
}
