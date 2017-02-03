import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { from } from 'rxjs/observable/from';
import { ofType } from './operator/ofType';


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
    this.ofType = ofType.bind(this);
  }

  lift(operator) {
    const observable = new ActionsObservable(this);
    observable.operator = operator;
    return observable;
  }
}
