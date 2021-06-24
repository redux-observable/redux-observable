window.gitbook = window.gitbook || [];

gitbook.push(function () {
  gitbook.events.on('page.change', function () {
    gtag('event', 'page_view', { 'send_to': 'UA-110740387-1' });

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

(function () {
  function loadScript(url) {
    var script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);
  }

  loadScript('https://www.googletagmanager.com/gtag/js?id=UA-110740387-1');
  loadScript('https://sidecar.gitter.im/dist/sidecar.v1.js');
})();

window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag('js', new Date());

gtag('config', 'UA-110740387-1');
