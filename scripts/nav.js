/**
 * Toggle the nav's scrolled state once the page has moved down enough.
 *
 * @returns {void}
 */
export function initNav() {
  const nav = document.querySelector(".site-nav");
  const topLink = document.querySelector("[data-scroll-top]");

  if (!(nav instanceof HTMLElement)) {
    return;
  }

  if (topLink instanceof HTMLAnchorElement) {
    const targetUrl = new URL(topLink.href, window.location.href);
    const isCurrentPageLink =
      targetUrl.origin === window.location.origin &&
      targetUrl.pathname === window.location.pathname &&
      targetUrl.search === window.location.search;

    if (isCurrentPageLink) {
      /**
       * Jump to the top of the current page instead of reloading it.
       *
       * @param {MouseEvent} event
       * @returns {void}
       */
      function handleTopLinkClick(event) {
        event.preventDefault();
        window.scrollTo(0, 0);
      }

      topLink.addEventListener("click", handleTopLinkClick);
    }
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
