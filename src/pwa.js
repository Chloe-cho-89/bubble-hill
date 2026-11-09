export function isInAppBrowser(nav) {
  return /KAKAOTALK|Instagram|FBAN|FBAV|Line\/|NAVER|DaumApps|; wv\)/i.test(nav.userAgent || '');
}
export function photoSaveHint(nav) {
  return isInAppBrowser(nav) ? '사진을 길게 눌러 저장해 주세요' : '';
}
// Hints are passive text. UA detection is only a fallback, never permission to prompt.
export function installationHint(nav) {
  const ua = nav.userAgent || '';
  if (/SamsungBrowser/i.test(ua)) return '삼성 인터넷에서 설치하면 경고가 뜰 수 있어요 · Chrome에서 열면 바로 설치할 수 있어요';
  if (isInAppBrowser(nav)) {
    return 'Chrome에서 열어 주세요';
  }
  const ios = /iPhone|iPad|iPod/.test(ua) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
  if (ios && (/CriOS/.test(ua) || /Safari/.test(ua) && !/FxiOS|EdgiOS|OPiOS/.test(ua))) {
    return '공유 → 홈 화면에 추가';
  }
  return '';
}

export function setupInstall(win = window, doc = document) {
  const area = doc.getElementById('install-area');
  const button = doc.getElementById('install-app');
  const help = doc.getElementById('install-help');
  if (!area || !button || !help) return;
  const mode = win.matchMedia?.('(display-mode: standalone)');
  const samsung = /SamsungBrowser/i.test(win.navigator.userAgent || '');
  let pending = null, installed = false, busy = false, dismissed = false, failed = false;
  const standalone = () => mode?.matches || win.navigator.standalone === true;
  const render = () => {
    const suppressed = installed || standalone() || busy || dismissed;
    const hideButton = suppressed || samsung || !pending || win.navigator.onLine === false;
    // Hiding a focused element can move focus to body before the prompt closes.
    const titleRoot = doc.getElementById('title-screen');
    if (hideButton && doc.activeElement === button && titleRoot && !titleRoot.hidden) {
      doc.getElementById('start-walk')?.focus({preventScroll:true});
    }
    button.hidden = hideButton;
    help.textContent = suppressed || !button.hidden ? '' :
      (failed ? '브라우저 메뉴에서 설치해 주세요' : installationHint(win.navigator));
    help.hidden = !help.textContent;
    area.hidden = button.hidden && help.hidden;
  };
  const beforeInstall = event => {
    event.preventDefault();
    if (samsung || installed || standalone() || busy || dismissed) return;
    pending = event;
    failed = false;
    render();
  };
  const complete = () => { installed = true; pending = null; render(); };
  const stop = event => event.stopPropagation();
  const install = async event => {
    event.stopPropagation();
    if (button.hidden || busy || !pending) return;
    const request = pending;
    pending = null;
    busy = true;
    render();
    try {
      // Call synchronously in the click gesture; each event may only be used once.
      const result = await request.prompt();
      const choice = request.userChoice ? await request.userChoice : result;
      if (choice?.outcome === 'accepted') installed = true;
      else dismissed = true; // Do not ask again during this visit.
    } catch {
      failed = true;
    } finally {
      busy = false;
      render();
    }
  };
  area.addEventListener('pointerdown', stop);
  area.addEventListener('click', stop);
  button.addEventListener('click', install);
  win.addEventListener('beforeinstallprompt', beforeInstall);
  win.addEventListener('appinstalled', complete);
  win.addEventListener('online', render);
  win.addEventListener('offline', render);
  win.addEventListener('pageshow', render);
  mode?.addEventListener?.('change', render);
  render();
  return {dispose() {
    area.removeEventListener('pointerdown', stop);
    area.removeEventListener('click', stop);
    button.removeEventListener('click', install);
    win.removeEventListener('beforeinstallprompt', beforeInstall);
    win.removeEventListener('appinstalled', complete);
    win.removeEventListener('online', render);
    win.removeEventListener('offline', render);
    win.removeEventListener('pageshow', render);
    mode?.removeEventListener?.('change', render);
  }};
}

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
