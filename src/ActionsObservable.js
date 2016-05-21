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

  ofType(...keys) {
    return this::filter(({ type }) => {
      const len = keys.length;
      if (len === 1) {
        return type === keys[0];
      } else {
        for (let i = 0; i < len; i++) {
          if (keys[i] === type) {
            return true;
          }
        }
      }
      return false;
    });
  }
}
