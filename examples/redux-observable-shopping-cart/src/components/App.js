import React, { Component } from 'react'
import ProductList from './ProductList'
import Cart from './Cart'

export default class App extends Component {
  render () {
    return (
      <div>
        <h1>Welcome to the shopping cart</h1>
        <h2>Shopping Cart Example</h2>
        <hr />
        <ProductList />
        <hr />
        <Cart />
      </div>
    )
  }
}
