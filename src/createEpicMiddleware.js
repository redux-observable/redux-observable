import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { map } from 'rxjs/operator/map';
import { switchMap } from 'rxjs/operator/switchMap';
import { mergeAll } from 'rxjs/operator/mergeAll';
import { window } from 'rxjs/operator/window';
import { startWith } from 'rxjs/operator/startWith';
import { zipStatic } from 'rxjs/operator/zip';
import { ActionsObservable } from './ActionsObservable';
import { EPIC_END } from './EPIC_END';

const defaultAdapter = {
  input: action$ => action$,
  output: action$ => action$
};

const defaultOptions = {
  adapter: defaultAdapter
};

class SluiceGate {
  static createClosed() {
    return new this(false);
  }
  static createOpen() {
    return new this(true);
  }
  constructor(isOpen) {
    if (typeof isOpen !== 'boolean') {
      throw new TypeError('SluiceGate constructor expects one boolean argument.');
    }
    this._is_open = isOpen;
    this._open = new Subject();
    this._close = new Subject();
  }
  sluice(input) {
    return zipStatic(
      input::window(this._close)::map(
        (w) => {
          const rep = new ReplaySubject();
          w.subscribe(rep);
          return rep;
        }
      ),
      (this._is_open ? this._open::startWith({}) : this._open),
      (w, _) => w,
    )::mergeAll();
  }
  open() {
    if (!this._is_open) {
      this._open.next({});
      this._is_open = true;
    }
  }
  close() {
    if (this._is_open) {
      this._close.next({});
      this._is_open = false;
    }
  }
}

const sluice = function (gate) {
  return gate.sluice(this);
};

export function createEpicMiddleware(epic, options = defaultOptions) {
  if (typeof epic !== 'function') {
    throw new TypeError('You must provide a root Epic to createEpicMiddleware');
  }

  // even though we used default param, we need to merge the defaults
  // inside the options object as well in case they declare only some
  options = { ...defaultOptions, ...options };
  const input$ = new Subject();
  const action$ = options.adapter.input(
    new ActionsObservable(input$)
  );
  const epic$ = new Subject();
  const outputGate = SluiceGate.createClosed();
  let store;

  const epicMiddleware = _store => {
    store = _store;

    return next => {
      epic$
        ::map(epic => {
          const output$ = ('dependencies' in options)
            ? epic(action$, store, options.dependencies)
            : epic(action$, store);

          if (!output$) {
            throw new TypeError(`Your root Epic "${epic.name || '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`);
          }

          return output$;
        })
        ::switchMap(output$ => options.adapter.output(output$))
        ::sluice(outputGate)
        .subscribe(store.dispatch);

      // Setup initial root epic
      epic$.next(epic);
      // wait with any calls to store.dispatch until middleware
      // initialization is complete
      setTimeout(() => outputGate.open());

      return action => {
        const result = next(action);
        input$.next(action);
        return result;
      };
    };
  };

  epicMiddleware.replaceEpic = epic => {
    // gives the previous root Epic a last chance
    // to do some clean up
    store.dispatch({ type: EPIC_END });
    // switches to the new root Epic, synchronously terminating
    // the previous one
    outputGate.close();
    epic$.next(epic);
    outputGate.open();
  };

  return epicMiddleware;
}
