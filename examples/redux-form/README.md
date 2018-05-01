# redux-form + redux-observable

this project demonstrates the holy union between `redux-form` & `redux-observable`.

the marriage of these two libraries is made _bizarre_ in that `redux-form`'s form submissions
depends on all submission activity occurring strictly in a `Promise` chain.  `redux`
categorically is an event based architecture (read: action based), which does not
conform to `redux-form`'s demand of a Promise chain.

this proposed workflow is as follows:

- wire a `Promise` into `redux-forms`'s `onSubmit` API
- `dispatch` the submission action as usual, which activates the epic, passing resolve & reject in with the payload

```js
async onSubmit (formValues) {
  try {
    await new Promise((resolve, reject) => {
      dispatch({
        type: SUBMIT_FORM, // or whatever you call it
        payload: formValues,
        meta: { // why meta? https://github.com/redux-utilities/flux-standard-action#meta
          resolve,
          reject
        }
      })
    })

  } catch (err) {
    throw new SubmissionError(err) // imported from `redux-form`
  }
}
```

- in your epic, test for `meta['resolve'|'reject']`, and call them as needed

```js
// example form submission epic
const submitEpic = action$ =>
  action$.ofType(ACTIONS.START_SUBMISSION)
    .mergeMap(action => {
      let { resolve, reject } = action.meta || {};
      return Observable.of(1) // fake network request
        .delay(1000)
        .map(res => {
          // pretend that the server does this verification
          if (ALLOWED_NAMES.indexOf(action.payload.username) === -1) {
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
```

## usage

- `yarn` or `npm install`
- `yarn start`

## contributing

this demo was made using [create-react-app](https://github.com/facebook/create-react-app)
