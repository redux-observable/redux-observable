import { Observable, OperatorFunction } from 'rxjs';
import { Middleware, Action } from 'redux';

/**
 * StateObservable is an Observable that also holds the current state value.
 * It emits the current value to new subscribers and updates when the input$ emits a new, distinct value.
 */
declare class StateObservable<S> extends Observable<S> {
    private _value;
    private __notifier;
    private _inputSubscription;
    /**
     * @param input$ - Source observable of state values
     * @param initialState - Initial state value
     */
    constructor(input$: Observable<S>, initialState: S);
    /**
     * Returns the current state value.
     */
    get value(): S;
    /**
     * Unsubscribes from the input$ observable to prevent memory leaks.
     */
    unsubscribe(): void;
}

declare interface Epic<Input = unknown, Output extends Input = Input, State = void, Dependencies = any> {
    (action$: Observable<Input>, state$: StateObservable<State>, dependencies: Dependencies): Observable<Output>;
}

/**
  Merges all epics into a single one.
 */
declare function combineEpics<Input = unknown, Output extends Input = Input, State = void, Dependencies = any>(...epics: Epic<Input, Output, State, Dependencies>[]): Epic<Input, Output, State, Dependencies>;

interface Options<D = any> {
    dependencies?: D;
}
interface EpicMiddleware<Input = unknown, Output extends Input = Input, State = void, Dependencies = any> extends Middleware<{}, State> {
    run(rootEpic: Epic<Input, Output, State, Dependencies>): void;
}
declare function createEpicMiddleware<Input = unknown, Output extends Input = Input, State = void, Dependencies = any>(options?: Options<Dependencies>): EpicMiddleware<Input, Output, State, Dependencies>;

/**
 * Inferring the types of this is a bit challenging, and only works in newer
 * versions of TypeScript.
 *
 * @param ...types One or more Redux action types you want to filter for, variadic.
 */
declare function ofType<Input, Type extends string, Output extends Input = Extract<Input, Action<Type>>>(...types: [Type, ...Type[]]): OperatorFunction<Input, Output>;

declare const resetDeprecationsSeen: () => void;

export { type Epic, type EpicMiddleware, StateObservable, resetDeprecationsSeen as __FOR_TESTING__resetDeprecationsSeen, combineEpics, createEpicMiddleware, ofType };
