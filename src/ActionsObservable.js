import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";
import { merge } from "rxjs/observable/merge";
import { from } from "rxjs/observable/from";
import { filter } from "rxjs/operator/filter";
import { _catch } from "rxjs/operator/catch";

export class ActionsObservable extends Observable {
  static of(...actions) {
    return new this(of(...actions));
  }

  static from(actions, scheduler) {
    return new this(from(actions, scheduler));
  }

  constructor(actionsSubject) {
    super();
    this.source = actionsSubject;
  }

  lift(operator) {
    const observable = new ActionsObservable(this);
    observable.operator = operator;
    return observable;
  }

  catchAndRelease(action) {
    return this::_catch((error, source) => {
      const fullAction = Object.assign({}, action, { error });

      return merge(of(fullAction), source);
    });
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
