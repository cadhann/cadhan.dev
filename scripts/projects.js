let resizeFrame = 0;

/**
 * Trim a project description to the visible height of its card body.
 *
 * @param {HTMLElement} body
 * @returns {void}
 */
function clampProjectBody(body) {
  const fullText = body.dataset.fullText ?? body.textContent?.trim() ?? "";

  body.dataset.fullText = fullText;
  body.textContent = fullText;

  if (!fullText || body.scrollHeight <= body.clientHeight) {
    return;
  }

  const words = fullText.split(/\s+/);
  let lowerBound = 0;
  let upperBound = words.length;
  let bestFit = "";

  while (lowerBound <= upperBound) {
    const middle = Math.floor((lowerBound + upperBound) / 2);
    const candidate =
      middle >= words.length
        ? fullText
        : `${words.slice(0, middle).join(" ")}...`;

    body.textContent = candidate;

    if (body.scrollHeight <= body.clientHeight) {
      bestFit = candidate;
      lowerBound = middle + 1;
    } else {
      upperBound = middle - 1;
    }
  }

  body.textContent = bestFit || "...";
}

/**
 * Clamp every rendered project description to its available space.
 *
 * @returns {void}
 */
function clampProjectBodies() {
  const bodies = document.querySelectorAll(".project-card__body");

  bodies.forEach((body) => {
    if (body instanceof HTMLElement) {
      clampProjectBody(body);
    }
  });
}

/**
 * Re-clamp the project descriptions once per animation frame on resize.
 *
 * @returns {void}
 */
function scheduleProjectBodyClamp() {
  if (resizeFrame !== 0) {
    return;
  }

  resizeFrame = window.requestAnimationFrame(() => {
    resizeFrame = 0;
    clampProjectBodies();
  });
}

/**
 * Clamp the pre-rendered project cards once layout and fonts are ready.
 *
 * @returns {void}
 */
export function initProjects() {
  const grid = document.querySelector(".projects-grid");

  if (!(grid instanceof HTMLElement)) {
    return;
  }

  if (!grid.childElementCount) {
    return;
  }

  clampProjectBodies();
  window.addEventListener("resize", scheduleProjectBodyClamp);

  if ("fonts" in document) {
    document.fonts.ready.then(clampProjectBodies);
  }
}
