
import { Observable, Subject, Subscription } from 'rxjs';


/**
 * StateObservable is an Observable that also holds the current state value.
 * It emits the current value to new subscribers and updates when the input$ emits a new, distinct value.
 */
export class StateObservable<S> extends Observable<S> {
  private _value: S;
  private __notifier = new Subject<S>();
  private _inputSubscription: Subscription;

  /**
   * @param input$ - Source observable of state values
   * @param initialState - Initial state value
   */
  constructor(input$: Observable<S>, initialState: S) {
    super((subscriber) => {
      const subscription = this.__notifier.subscribe(subscriber);
      if (subscription && !subscription.closed) {
        subscriber.next(this._value);
      }
      return subscription;
    });

    this._value = initialState;
    this._inputSubscription = input$.subscribe((value) => {
      // Only update if the value has actually changed (immutability pattern)
      if (value !== this._value) {
        this._value = value;
        this.__notifier.next(value);
      }
    });
  }

  /**
   * Returns the current state value.
   */
  get value(): S {
    return this._value;
  }

  /**
   * Unsubscribes from the input$ observable to prevent memory leaks.
   */
  unsubscribe(): void {
    this._inputSubscription.unsubscribe();
    this.__notifier.complete();
  }
}
