/**
 * these are the factory methods for the actions.
 */
export const GET_ALL_PRODUCTS = 'GET_ALL_PRODUCTS'
export const RECEIVE_PRODUCTS = 'RECEIVE_PRODUCTS'

export const ADD_TO_CART = 'ADD_TO_CART'
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART'

export const CHECKOUT_REQUEST = 'CHECKOUT_REQUEST'
export const CHECKOUT_SUCCESS = 'CHECKOUT_SUCCESS'
export const CHECKOUT_FAILURE = 'CHECKOUT_FAILURE'

export const getAllProducts = () => ({ type: GET_ALL_PRODUCTS })

export const receiveProducts = products => ({
  type: RECEIVE_PRODUCTS,
  products
})

export const addToCart = productId => ({
  type: ADD_TO_CART,
  productId
})

export const removeFromCart = productId => ({
  type: REMOVE_FROM_CART,
  productId
})

export const checkout = () => ({ type: CHECKOUT_REQUEST })

export const checkoutSuccess = cart => ({
  type: CHECKOUT_SUCCESS,
  cart
})

export const checkoutFailure = error => ({
  type: CHECKOUT_FAILURE,
  error
})
