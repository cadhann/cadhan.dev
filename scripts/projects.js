import { projects } from "../data/projects.js";

/**
 * Render one project card from local project data.
 *
 * @param {{
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
 * Populate the project grid from the local data module.
 *
 * @returns {void}
 */
export function initProjects() {
  const grid = document.querySelector(".projects-grid");

  if (!(grid instanceof HTMLElement)) {
    return;
  }

  grid.innerHTML = projects.map(renderProjectCard).join("");
}
