/* global describe, it */
import { expect } from 'chai';
import { dispatchOnMount, reduxObservable } from '../';
import { Component } from 'react';
import { createStore, applyMiddleware } from 'redux';
import * as Rx from 'rxjs';
import 'babel-polyfill';

const { Observable } = Rx;

describe('dispatchOnMount', () => {
  it('should exist', () => {
    expect(dispatchOnMount).to.be.a('function');
  });

  it('should wire a thunkservable to dispatch on componentDidMount', () => {
    let reducedActions = [];
    let reducer = (state, action) => {
      reducedActions.push(action);
      return state;
    };
    let store = createStore(reducer, applyMiddleware(reduxObservable()));

    @dispatchOnMount(() => Observable.of({ type: 'TEST' }))
    class TestComponent extends Component {
    }

    let comp = new TestComponent();
    // fake connection?
    comp.context = { store };
    comp.componentDidMount();

    expect(reducedActions).to.deep.equal([{ type: '@@redux/INIT' }, { type: 'TEST' }]);
  });

  it('should unsubscribe on componentWillUnmount', () => {
    let reducedActions = [];
    let reducer = (state, action) => {
      reducedActions.push(action);
      return state;
    };
    let store = createStore(reducer, applyMiddleware(reduxObservable()));

    let source1Unsubbed = false;
    let source1 = new Observable((observer) => {
      return () => {
        source1Unsubbed = true;
      };
    });

    let source2Unsubbed = false;
    let source2 = new Observable((observer) => {
      return () => {
        source2Unsubbed = true;
      };
    });

    @dispatchOnMount(() => source1, () => source2)
    class TestComponent extends Component {
    }

    let comp = new TestComponent();
    // fake connection?
    comp.context = { store };
    comp.componentDidMount();

    expect(source1Unsubbed).to.equal(false);
    expect(source2Unsubbed).to.equal(false);

    comp.componentWillUnmount();

    expect(source1Unsubbed).to.equal(true);
    expect(source2Unsubbed).to.equal(true);
  });

  it('should subscribe to multiple thunkservables', () => {
    let reducedActions = [];
    let reducer = (state, action) => {
      reducedActions.push(action);
      return state;
    };
    let store = createStore(reducer, applyMiddleware(reduxObservable()));

    let source1 = Observable.of({ type: 'SOURCE1' });
    let source2 = Observable.of({ type: 'SOURCE2' });

    @dispatchOnMount(() => source1, () => source2)
    class TestComponent extends Component {
    }

    let comp = new TestComponent();
    // fake connection?
    comp.context = { store };
    comp.componentDidMount();

    expect(reducedActions).to.deep.equal([
      { type: '@@redux/INIT' },
      { type: 'SOURCE1' },
      { type: 'SOURCE2' }
    ]);
  });

  it('should allow normal actions to dispatch on mount', () => {
    let reducedActions = [];
    let reducer = (state, action) => {
      reducedActions.push(action);
      return state;
    };
    let store = createStore(reducer, applyMiddleware(reduxObservable()));

    let source2 = Observable.of({ type: 'SOURCE2' });

    @dispatchOnMount({ type: 'PLAIN_ACTION' }, () => source2)
    class TestComponent extends Component {
    }

    let comp = new TestComponent();
    // fake connection?
    comp.context = { store };
    comp.componentDidMount();

    expect(reducedActions).to.deep.equal([
      { type: '@@redux/INIT' },
      { type: 'PLAIN_ACTION' },
      { type: 'SOURCE2' }
    ]);

    // since plain actions don't return subscriptions, because they're not functions
    // let's just be really sure we don't break the unsub in the componentWillUnmount
    expect(() => comp.componentWillUnmount()).not.to.throw();
  });
});
