import 'rxjs';
import { applyMiddleware, compose, createStore, combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { createEpicMiddleware } from 'redux-observable';
import { Field, reduxForm } from 'redux-form';
import { Observable } from 'rxjs/Observable';
import { Provider } from 'react-redux';
import { reducer as reduxFormReducer } from 'redux-form';
import { SubmissionError } from 'redux-form';
import { Values } from 'redux-form-website-template';
import React from 'react';
import ReactDOM from 'react-dom';

const ACTIONS = {
  START_SUBMISSION: 'START_SUBMISSION',
  COMPLETE_SUBMISSION: 'COMPLETE_SUBMISSION',
};

const ALLOWED_NAMES = [
  'john',
  'paul',
  'george',
  'ringo'
];

const rootEpic = combineEpics(
  // Let's make a single login epic that verifies that the username is valid.
  // The key takeaway here is that this epic is **aware** that some dispatched
  // actions have resolve/reject attached to their FSA meta field. The meta field
  // _is_ a valid FSA field, although resolve/reject are not guaranteed properties.
  // You (and your team) will need to design form associated epics with awareness
  // of these meta fields.
  action$ =>
    action$.ofType(ACTIONS.START_SUBMISSION)
      .mergeMap(action => {
        let { resolve, reject } = action.meta || {}; // :eyes:
        return Observable.of(1)
          .delay(1000) // fake network request
          .map(res => {
            if (ALLOWED_NAMES.indexOf(action.payload.username) === -1) {
              // pretend that the server did this verification
              throw new Error('bad username');
            }
            if (resolve) resolve(res); // :eyes: -- resume redux-form `onSubmit` function
            return { type: ACTIONS.COMPLETE_SUBMISSION };
          })
          .catch(error => {
            if (reject) reject(error); // :eyes:
            return Observable.of({ type: ACTIONS.COMPLETE_SUBMISSION, error });
          });
      })
);

// standard redux stuff
const epicMiddleware = createEpicMiddleware(rootEpic);
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  combineReducers({
    form: reduxFormReducer,
  }),
  composeEnhancers(
    applyMiddleware(
      epicMiddleware
    )
  )
);

/**
 * `submit` is fed into the redux-form API.  this function should return a Promise,
 * resolve when all is well, or reject with a `SubmissionError` if
 * submission/validation failed.
 */
async function submit(values, dispatch) {
  try {
    await new Promise((resolve, reject) => {
      dispatch({
        type: ACTIONS.START_SUBMISSION,
        payload: values,
        meta: { resolve, reject } // the epic is responsible for calling these
      });
    });
  } catch (err) {
    throw new SubmissionError({
      _error: `Login failed!  Server responded with: ${err}`
    });
  }
}

// normal redux-form stuff
const renderField = ({ input, label, type, meta: { touched, error } }) => (
  <div>
    <label>{label}</label>
    <div>
      <input {...input} placeholder={label} type={type} />
      {touched && error && <span>{error}</span>}
    </div>
  </div>
);

// normal redux-form stuff
const SubmitValidationForm = props => {
  const { dispatch, error, handleSubmit, pristine, reset, submitting } = props;
  return (
    <form onSubmit={handleSubmit(values => submit(values, dispatch))}>
      <Field
        name='username'
        type='text'
        component={renderField}
        label='Username'
      />
      {error && <strong>{error}</strong>}
      <div>
        <button type='submit' disabled={submitting}>Log In</button>
        <button type='button' disabled={pristine || submitting} onClick={reset}>
          Clear Values
        </button>
      </div>
    </form>
  );
};

// normal redux-form stuff
const ConnectedSubmitValidationForm = reduxForm({
  form: 'submitValidation',
})(SubmitValidationForm);

// render the `redux-form`ified form into the app!
const rootEl = document.getElementById('root');
ReactDOM.render(
  <Provider store={store}>
    <div style={{ padding: 15 }}>
      <h2>Async valdiation & submission with redux-observable and redux-forms</h2>
      <p>
        Usernames that will pass validation:{' '}
        {ALLOWED_NAMES.map((name, i) =>
          <span key={name}>
            <code>{name}</code>
            {i === ALLOWED_NAMES.length - 1 ? '' : ', '}
          </span>
        )}
      </p>
      <ConnectedSubmitValidationForm />
      <Values form='submitValidation' />
    </div>
  </Provider>,
  rootEl
);

