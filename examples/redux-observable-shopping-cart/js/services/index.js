/**
 * Mocking client-server processing
 */
import _products from './products'
import { Observable } from 'rxjs/Observable'

const TIMEOUT = 100;
const MAX_CHECKOUT = 2; // max different items

export const api = {
  getProducts() {
    return new Observable(observer => {
      const timerId = setTimeout(() => {
        observer.next(_products);
        observer.complete();
      }, TIMEOUT);
      return () => clearTimeout(timerId);
    });
  },

  buyProducts(cart) {
    return new Observable(observer => {
      const timerId = setTimeout(() => {
        if(Object.keys(cart.quantityById).length <= MAX_CHECKOUT)
          observer.next(cart);
        else
          observer.error(`You can buy ${MAX_CHECKOUT} items at maximum in a checkout`);
        observer.complete();
      }, TIMEOUT);

      return () => clearTimeout(timerId);
    });
  }
}
