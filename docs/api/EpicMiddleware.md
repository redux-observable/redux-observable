# EpicMiddleware

An instance of the redux-observable middleware.

To create it, call [`createEpicMiddleware`](createEpicMiddleware.md).

### EpicMiddleware Methods

- [`run(rootEpic)`](#run)

<hr>

### <a id='run'></a>[`run(rootEpic)`](#replaceEpic)

Run the middleware with the provided epic.

You might need to call this multiple times if your app implements code splitting and you want to load some of the epics dynamically or you're using hot reloading.

#### Arguments

1. `rootEpic` (*Epic*) The epic for the middleware to use.
