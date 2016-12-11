# Error Handling

Handling errors in side effects like AJAX calls is a common requirement of Epics. While there are several ways of doing this depending on your requirements, the most common way is to simply catch them inside your Epic and emit an action with the error information so you can display or log it.

This can be done with the `.catch()` RxJS operator:

```js
const fetchUserEpic = action$ =>
  action$.ofType(FETCH_USER)
    .mergeMap(action =>
	  ajax.getJSON(`/api/users/${action.payload}`)
        .map(fetchUserFulfilled)
        .catch(error => Observable.of({
        	type: FETCH_USER_REJECTED,
        	payload: error.xhr.response,
        	error: true
        }))
    );
```

Here we placed the `.catch()` inside our `.mergeMap()`, but after our AJAX call; this is important because if we let the error reach the `action$.ofType()`, it will terminate it and no longer listen for new actions.

***

### Try It Live!

<a class="jsbin-embed" href="https://jsbin.com/yuleju/embed?js,output&height=500px">View this demo on JSBin</a><script src="https://static.jsbin.com/js/embed.min.js?3.37.0"></script>

