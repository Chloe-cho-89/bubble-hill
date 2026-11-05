// Keep updates waiting until every game window has closed, preserving the current walk.
export function registerPwa(win = window, doc = document) {
  const status = doc.getElementById('offline-status');
  const say = message => { if (status) status.textContent = message; };
  if (!win.isSecureContext || !win.navigator.serviceWorker || win.location.protocol === 'file:') {
    return Promise.resolve(null);
  }
  say('오프라인 산책을 준비하고 있어요');
  return win.navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'}).then(registration => {
    const showReady = () => say(registration.waiting
      ? '새 산책이 준비됐어요 · 모두 닫고 다시 열면 만나요'
      : '인터넷 없이도 산책할 수 있어요');
    if (registration.active) showReady();
    const watch = worker => {
      if (!worker) return;
      const changed = () => {
        if (worker.state === 'installed' || worker.state === 'activated') showReady();
        if (worker.state === 'redundant') say('오프라인 준비를 다음 접속 때 다시 해볼게요');
      };
      worker.addEventListener('statechange', changed);
      changed();
    };
    watch(registration.installing);
    registration.addEventListener('updatefound', () => watch(registration.installing));
    registration.update().catch(() => {});
    return registration;
  }).catch(() => {
    say('오프라인 준비를 다음 접속 때 다시 해볼게요');
    return null;
  });
}
