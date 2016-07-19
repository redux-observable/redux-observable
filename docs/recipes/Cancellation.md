# Cancellation

Cancelling some async side effects is a common requirement of Epics. While there are several ways of doing this depending on your requirements, the most common way is to have your application dispatch a cancellation action and listen for it inside your Epic.

This can be done with the `.takeUntil()` RxJS operator:

```js
const fetchUserEpic = action$ =>
  action$.ofType(FETCH_USER)
    .mergeMap(action =>
      ajax.getJSON(`/api/users/${action.payload}`)
        .map(fetchUserFulfilled)
        .takeUntil(action$.ofType(FETCH_USER_CANCELLED))
    );
```

Here we placed the `.takeUntil()` after inside our `.mergeMap()`, but after our AJAX call; this is important because we want to cancel only the AJAX request, not stop the Epic from listening for any future actions.

***

### Try It Live!

<a class="jsbin-embed" href="https://jsbin.com/fivaca/embed?js,output&height=500px">View this demo on JSBin</a><script src="https://static.jsbin.com/js/embed.min.js?3.37.0"></script>
