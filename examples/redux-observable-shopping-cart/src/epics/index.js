import { of } from 'rxjs'
import { switchMap, map, catchError } from 'rxjs/operators'
import { combineEpics, ofType } from 'redux-observable'
import { getCart } from '../reducers'
import { api } from '../services'
import * as actions from '../actions'

/**
 * search products epic
 * @param action$
 * @param store
 * @returns {any|*|Observable}
 */
const searchProducts = action$ =>
  action$.pipe(
    ofType(actions.GET_ALL_PRODUCTS),
    switchMap(q => {
      /*
       * This example uses the same api of the redux-saga example, thus
       * it adapts a Promise to an Observable.
       */
      return api.getProducts().pipe(map(actions.receiveProducts))
    })
  )

/**
 * checkout epic.
 * @param action$
 * @param store
 * @returns {any|*|Observable}
 */
const checkout = (action$, state$) =>
  action$.pipe(
    ofType(actions.CHECKOUT_REQUEST),
    switchMap(q => {
      const cart = getCart(state$.value)
      return api
        .buyProducts(cart)
        .pipe(
          map(cart => actions.checkoutSuccess(cart)),
          catchError(error => of(actions.checkoutFailure(error)))
        )
    })
  )

export const rootEpic = combineEpics(searchProducts, checkout)
