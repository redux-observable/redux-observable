# Contributing

We are open to, and grateful for, any contributions made by the community. By contributing to redux-observable, you agree to abide by our [Code of Conduct](https://github.com/redux-observable/redux-observable/blob/master/CODE_OF_CONDUCT.md).

## Reporting Issues and Asking Questions

Before opening an issue, please search the [issue tracker](https://github.com/redux-observable/redux-observable/issues) to make sure your issue hasn’t already been reported.

### Bugs and Improvements

We use the issue tracker to keep track of bugs and improvements to redux-observable itself, its examples, and the documentation. We encourage you to open issues to discuss improvements, architecture, theory, internal implementation, etc. If a topic has been discussed before, we will ask you to join the previous discussion.

### Getting Help

**For support or usage questions like “how do I do X with redux-observable” and “my code doesn’t work”, please search and ask on [StackOverflow with a redux-observable tag](http://stackoverflow.com/questions/tagged/redux-observable?sort=votes&pageSize=50) first.**

We ask you to do this because StackOverflow has a much better job at keeping popular questions visible. Unfortunately good answers get lost and outdated on GitHub.

Some questions take a long time to get an answer. **If your question gets closed or you don’t get a reply on StackOverflow for longer than a few days,** we encourage you to post an issue linking to your question. We will close your issue but this will give people watching the repo an opportunity to see your question and reply to it on StackOverflow if they know the answer.

Please be considerate when doing this as this is not the primary purpose of the issue tracker.

### Help Us Help You

On both websites, it is a good idea to structure your code and question in a way that is easy to read to entice people to answer it. For example, we encourage you to use syntax highlighting, indentation, and split text in paragraphs.

Please keep in mind that people spend their free time trying to help you. You can make it easier for them if you provide versions of the relevant libraries and a runnable small project reproducing your issue. You can put your code on [JSBin](http://jsbin.com) or, for bigger projects, on GitHub. Make sure all the necessary dependencies are declared in `package.json` so anyone can run `npm install && npm start` and reproduce your issue.

### Sending a Pull Request

For non-trivial changes, please open an issue with a proposal for a new feature or refactoring before starting on the work. We don’t want you to waste your efforts on a pull request that we won’t want to accept.

On the other hand, sometimes the best way to start a conversation *is* to send a pull request. Use your best judgment!

In general, the contribution workflow looks like this:

* Open a new issue in the [Issue tracker](https://github.com/redux-observable/redux-observable/issues).
* Fork the repo.
* Create a new feature branch based off the `master` branch.
* Make sure all tests pass and there are no linting errors.
* Submit a pull request, referencing any issues it addresses.

**Commit messages should follow the [conventional-changelog-standard](https://github.com/bcoe/conventional-changelog-standard/blob/master/convention.md).** (the same used by [RxJS](https://github.com/ReactiveX/rxjs) and [Angular 2](https://github.com/angular/angular))

e.g.

```
fix(actions): Emit actions to ActionsSubject recursively

Closes #1528
```

The most common are `docs` (all doc edits, even example code corrections), `fix` (actual library bugfixes), `feat` (new features).

Please try to keep your pull request focused in scope and avoid including unrelated commits.

After you have submitted your pull request, we’ll try to get back to you as soon as possible. We may suggest some changes or improvements.

Thank you for contributing!


## Development

Visit the [issue tracker](https://github.com/redux-observable/redux-observable/issues) to find a list of open issues that need attention.

Fork, then clone the repo:

```
git clone https://github.com/your-username/redux.git
```

### Building

#### Building redux-observable

Running the `build` task will create both a CommonJS module-per-module build and a UMD build.
```
npm run build
```

To create just a CommonJS module-per-module build:

```
npm run build:cjs
```

The result will be in the `lib` folder.

To create just a UMD build:
```
npm run build:umd
npm run build:umd:min
```

The result will be in the `dist` folder.

### Testing and Linting

To run both linting and testing at once, run the following:

```
npm run check
```

To only run linting:

```
npm run lint
```

To only run tests:

```
npm run test
```

### Publishing to NPM

There are several tasks needed to publish a new version, but thankfully we automate all of them into a single command:

```
npm run shipit
```

This will:

* Confirm passing linting and tests
* Prompt you for the new version number to publish
* Bump package.json with that new number
* Generate CHANGELOG.md
* Commit those changes to package.json and CHANGELOG.md
* Push a tag of this release
* And finally publish to NPM

_Using this command when you do not have all the required permissions is unsupported and probably has unexpected behavior._

### Docs

Improvements to the documentation are always welcome. In the docs we abide by typographic rules, so instead of ' you should use ’. Same goes for “ ” and dashes (—) where appropriate. These rules only apply to the text, not to code blocks.

#### Installing Gitbook

To install the latest version of `gitbook` and prepare to build the documentation, run the following:

```
npm run docs:prepare
```

#### Building the Docs

To build the documentation, run the following:

```
npm run docs:build
```

To watch and rebuild documentation when changes occur, run the following:

```
npm run docs:watch
```

The docs will be served at http://localhost:4000.

#### Publishing the Docs

To publish the documentation, run the following:

```
npm run docs:publish
```

#### Cleaning the Docs

To remove previously built documentation, run the following:

```
npm run docs:clean
```
