window.gitbook = window.gitbook || [];

gitbook.push(function () {
  gitbook.events.on('page.change', function () {
    // We use a slightly different styling so that
    // the normal window scrollbar is used, so we need
    // to reset the scroll position every time.
    // We delay it because gitbook theme does some
    // toolbar stuff we have to wait for..#YOLO
    window.scrollTo(0, 0);

    // JSbin embed code doesn't work with as-is with
    // single page apps. When you navigate to another
    // page it doesn't hydrate those new embeds.
    // This forces the script to reinitialize when
    // a new one is loaded.
    // https://github.com/jsbin/jsbin/issues/2819
    delete window.jsbinified;
  });
});


((window.gitter = {}).chat = {}).options = {
  room: 'redux-observable/redux-observable'
};

// Quantcast Analytics
window._qevents = window._qevents || [];

(function () {
  var script = document.createElement('script');
  script.src = (document.location.protocol == 'https:' ? 'https://secure' : 'http://edge') + '.quantserve.com/quant.js';
  script.async = true;
  script.type = 'text/javascript';
  document.body.appendChild(script);
})();

_qevents.push({ qacct:'p-gm1A_eU4dRuUY' });
