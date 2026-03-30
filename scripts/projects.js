import { projects } from "../data/projects.js";

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
 * Render the full-row portfolio notice card.
 *
 * @param {{
 *   layout: "notice",
 *   title: string,
 *   body: string,
 * }} project
 * @returns {string}
 */
function renderNoticeCard(project) {
  return `
    <article class="project-card project-card--notice">
      <h2 class="project-card__notice-title">${project.title}</h2>
      <p class="project-card__notice-body">${project.body}</p>
    </article>
  `;
}

/**
 * Render one standard project card from local project data.
 *
 * @param {{
 *   layout: "project",
 *   variant: string,
 *   title: string,
 *   kicker: string,
 *   body: string,
 *   tags: string[],
 * }} project
 * @returns {string}
 */
function renderProjectCard(project) {
  const tags = project.tags
    .map((tag) => `<li class="project-card__tag">${tag}</li>`)
    .join("");

  return `
    <article class="project-card ${project.variant}">
      <div class="project-card__media" aria-hidden="true"></div>
      <h2 class="project-card__title">${project.title}</h2>
      <p class="project-card__kicker">${project.kicker}</p>
      <p class="project-card__body">${project.body}</p>
      <ul class="project-card__tags" aria-label="Project technologies">${tags}</ul>
    </article>
  `;
}

/**
 * Render either the full-row notice or a standard project card.
 *
 * @param {import("../data/projects.js").Project} project
 * @returns {string}
 */
function renderCard(project) {
  return project.layout === "notice"
    ? renderNoticeCard(project)
    : renderProjectCard(project);
}

/**
 * Populate the project grid from the local data module.
 *
 * @returns {void}
 */
export function initProjects() {
  const grid = document.querySelector(".projects-grid");

  if (!(grid instanceof HTMLElement)) {
    return;
  }

  grid.innerHTML = projects.map(renderCard).join("");
  clampProjectBodies();
  window.addEventListener("resize", scheduleProjectBodyClamp);

  if ("fonts" in document) {
    document.fonts.ready.then(clampProjectBodies);
  }
}
