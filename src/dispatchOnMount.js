import { Component } from 'react';
import { Subscription } from 'rxjs/Subscription';

const $$reduxObservableSubscription = '@@reduxObservableSubscription';

export function dispatchOnMount(...toDispatch) {
  return (ComposedComponent) =>
    class DispatchOnMountComponent extends Component {
      componentDidMount() {
        this[$$reduxObservableSubscription] = new Subscription();
        toDispatch.map(a => this.context.store.dispatch(a))
          .forEach(sub => sub && this[$$reduxObservableSubscription].add(sub));
      }

      componentWillUnmount() {
        this[$$reduxObservableSubscription].unsubscribe();
      }

      render() {
        return (<ComposedComponent {...this.props}/>);
      }
    };
}
