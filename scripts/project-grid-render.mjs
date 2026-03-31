const START_MARKER = "<!-- projects-grid:start -->";
const END_MARKER = "<!-- projects-grid:end -->";
const GRID_INDENT = "          ";

/**
 * Escape text so project content can be safely embedded into HTML.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Indent a multi-line HTML fragment by the supplied prefix.
 *
 * @param {string} markup
 * @param {string} prefix
 * @returns {string}
 */
function indentMarkup(markup, prefix) {
  return markup
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

/**
 * Render the full-row notice card from project data.
 *
 * @param {import("../data/projects.js").Project} project
 * @returns {string}
 */
function renderNoticeCard(project) {
  return [
    '<article class="project-card project-card--notice">',
    `  <h2 class="project-card__notice-title">${escapeHtml(project.title)}</h2>`,
    `  <p class="project-card__notice-body">${escapeHtml(project.body)}</p>`,
    "</article>",
  ].join("\n");
}

/**
 * Render a standard project card from project data.
 *
 * @param {import("../data/projects.js").Project} project
 * @returns {string}
 */
function renderProjectCard(project) {
  const className = project.variant
    ? `project-card ${escapeHtml(project.variant)}`
    : "project-card";

  const tags = (project.tags ?? [])
    .map((tag) => `    <li class="project-card__tag">${escapeHtml(tag)}</li>`)
    .join("\n");

  return [
    `<article class="${className}">`,
    '  <div class="project-card__media" aria-hidden="true"></div>',
    `  <h2 class="project-card__title">${escapeHtml(project.title)}</h2>`,
    `  <p class="project-card__kicker">${escapeHtml(project.kicker ?? "")}</p>`,
    `  <p class="project-card__body">${escapeHtml(project.body)}</p>`,
    '  <ul class="project-card__tags" aria-label="Project technologies">',
    tags,
    "  </ul>",
    "</article>",
  ].join("\n");
}

/**
 * Render the current project data into the project-grid markup block.
 *
 * @param {import("../data/projects.js").Project[]} projects
 * @returns {string}
 */
function renderProjectsGrid(projects) {
  return projects
    .map((project) =>
      project.layout === "notice"
        ? renderNoticeCard(project)
        : renderProjectCard(project),
    )
    .join("\n");
}

/**
 * Replace the generated project-grid block in an HTML document.
 *
 * @param {string} html
 * @param {import("../data/projects.js").Project[]} projects
 * @returns {string}
 */
export function injectProjectsGrid(html, projects) {
  const startIndex = html.indexOf(START_MARKER);
  const endIndex = html.indexOf(END_MARKER);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error("Project grid markers were not found in index.html.");
  }

  const before = html.slice(0, startIndex + START_MARKER.length);
  const after = html.slice(endIndex);
  const renderedGrid = indentMarkup(renderProjectsGrid(projects), GRID_INDENT);

  return `${before}\n${renderedGrid}\n        ${after}`;
}
