# EpicMiddleware

An instance of the redux-observable middleware.

To create it, pass your root [Epic](../basics/Epics.md) to [`createEpicMiddleware`](createEpicMiddleware.md).

### EpicMiddleware Methods

- [`replaceEpic(nextEpic)`](#replaceEpic)

<hr>

### <a id='replaceEpic'></a>[`replaceEpic(nextEpic)`](#replaceEpic)

Replaces the epic currently used by the middleware.

It is an advanced API. You might need this if your app implements code splitting, and you want to load some of the epics dynamically or you implement use hot reloading.

#### Arguments

1. `epic` (*Epic*) The next epic for the middleware to use.
