/**
 * Toggle the nav's scrolled state once the page has moved down enough.
 *
 * @returns {void}
 */
export function initNav() {
  const nav = document.querySelector(".site-nav");

  if (!(nav instanceof HTMLElement)) {
    return;
  }

  let scheduled = false;

  /**
   * Apply the scrolled class when the page has moved beyond the nav's height.
   *
   * @returns {void}
   */
  function updateState() {
    scheduled = false;
    nav.classList.toggle("is-scrolled", window.scrollY > nav.offsetHeight);
  }

  /**
   * Coalesce rapid scroll and resize events into one animation-frame update.
   *
   * @returns {void}
   */
  function requestUpdate() {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.requestAnimationFrame(updateState);
  }

  updateState();

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
}
