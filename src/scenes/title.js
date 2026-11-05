export function mountTitle(root, button, onStart, onFirstGesture) {
  root.hidden = false;
  const syncMotion = () => { root.dataset.paused = String(document.hidden); };
  function dispose() {
    root.hidden = true;
    button.removeEventListener('click', start);
    document.removeEventListener('visibilitychange', syncMotion);
  }
  function start() {
    if (root.hidden) return;
    onFirstGesture();
    dispose();
    onStart();
  }
  syncMotion();
  document.addEventListener('visibilitychange', syncMotion);
  button.addEventListener('click', start);
  return { dispose };
}
