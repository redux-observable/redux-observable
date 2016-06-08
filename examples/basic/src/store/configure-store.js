import { createStore, compose, applyMiddleware } from 'redux';
import { reduxObservable } from 'redux-observable';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
    let finalCreateStore = compose(
        applyMiddleware(reduxObservable()),
        global.devToolsExtension ? global.devToolsExtension() : f => f
    )(createStore);

    const store = finalCreateStore(rootReducer, initialState);

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('../reducers', () => {
            const nextReducer = require('../reducers');
            store.replaceReducer(nextReducer);
        });
    }

    return store;
}