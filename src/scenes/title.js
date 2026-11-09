export function mountTitle(root, button, onStart, onFirstGesture) {
  root.hidden = false;
  root.dataset.input = typeof window !== 'undefined' && window.matchMedia?.('(any-pointer: coarse)').matches ? 'touch' : 'pointer';
  const touch = event => { if(event.pointerType==='touch'||event.pointerType==='pen')root.dataset.input='touch'; };
  const keyboard = event => { if(event.key==='Tab')root.dataset.input='keyboard'; };
  const syncMotion = () => { root.dataset.paused = String(document.hidden); };
  const capture = {capture:true};
  function dispose() {
    root.hidden = true;
    button.removeEventListener('click', start);
    document.removeEventListener('visibilitychange', syncMotion);
    document.removeEventListener('pointerdown', touch, capture);
    document.removeEventListener('keydown', keyboard, capture);
  }
  function start() {
    if (root.hidden) return;
    onFirstGesture();
    dispose();
    onStart();
  }
  syncMotion();
  document.addEventListener('visibilitychange', syncMotion);
  document.addEventListener('pointerdown', touch, capture);
  document.addEventListener('keydown', keyboard, capture);
  button.addEventListener('click', start);
  return { dispose };
}
