# Usage with UI Frameworks

Both redux and redux-observable are UI framework agnostic. Not only can you pick your favorite one, if you decide to change UI frameworks down the road, a majority of your business logic will be in redux + redux-observable so your UI framework is mostly just a view layer/template, making it much easier to switch between them!

Generally speaking, your actual UI/templating logic (Angular/React/Vue/etc) should have no knowledge of redux-observable.
