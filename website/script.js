window.gitbook = window.gitbook || [];

gitbook.push(function () {
  gitbook.events.on('page.change', function () {
    // JSbin embed code doesn't work with as-is with
    // single page apps. When you navigate to another
    // page it doesn't hydrate those new embeds.
    // This forces the script to reinitialize when
    // a new one is loaded.
    // https://github.com/jsbin/jsbin/issues/2819
    delete window.jsbinified;
  });
});
