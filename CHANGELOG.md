<a name="0.6.0"></a>
# [0.6.0](https://github.com/redux-observable/redux-observable/compare/0.5.0...v0.6.0) (2016-05-26)


### Bug Fixes

* **package:** Add d.ts file to package. ([fe8f073](https://github.com/redux-observable/redux-observable/commit/fe8f073))


### Features

* **combineDelegators:** add a method to combine different delegators to make it easier to create a rootDelegator ([da2eeaf](https://github.com/redux-observable/redux-observable/commit/da2eeaf))
* **ofType:** now accepts multiple types to filter for ([9027d1c](https://github.com/redux-observable/redux-observable/commit/9027d1c))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/redux-observable/redux-observable/compare/0.4.0...v0.5.0) (2016-05-20)


### Features

* **middleware processor:** add argument to middleware to set up async processing for all actions pumped thr ([5a672be](https://github.com/redux-observable/redux-observable/commit/5a672be))
* **reduxObservable:** allow async streams to emit other async actions, ([94233f3](https://github.com/redux-observable/redux-observable/commit/94233f3)), closes [#8](https://github.com/redux-observable/redux-observable/issues/8)


### BREAKING CHANGES

* middleware processor: dispatched actions will now occur _before_ the actions created by synchronous observable side effects.



<a name="0.4.0"></a>
# [0.4.0](https://github.com/blesh/redux-observable/compare/0.3.0...v0.4.0) (2016-05-12)


### Bug Fixes

* **actions:** Wasn't actually emitting the correct actions to the actions Subject ([a1cf32e](https://github.com/blesh/redux-observable/commit/a1cf32e))

### Features

* **ofType:** add operator to provided actions observable ([174ceda](https://github.com/blesh/redux-observable/commit/174ceda))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/blesh/redux-observable/compare/0.2.0...v0.3.0) (2016-05-12)


### Bug Fixes

* **naming:** get rid of references to rxDucks missed during renaming ([04c54c6](https://github.com/blesh/redux-observable/commit/04c54c6))



<a name=""></a>
# [](//compare/0.1.0...vundefined) (2016-05-12)




<a name="0.1.0"></a>
# [0.1.0](https://github.com/blesh/rx-ducks-middleware/compare/0.0.2...v0.1.0) (2016-04-29)


### Features

* **async interop:** can dispatch functions that return promises, observable-like objects, and iterables ([d20c411](https://github.com/blesh/rx-ducks-middleware/commit/d20c411))
