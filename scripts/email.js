const EMAIL_LOCAL_CODES = [109, 101];
const EMAIL_DOMAIN_CODES = [99, 97, 100, 104, 97, 110, 46, 100, 101, 118];

/**
 * Decode an email fragment from character codes.
 *
 * @param {number[]} codes
 * @returns {string}
 */
function decodeFragment(codes) {
  return String.fromCharCode(...codes);
}

/**
 * Build the public email address without storing it verbatim in HTML.
 *
 * @returns {string}
 */
function getEmailAddress() {
  return `${decodeFragment(EMAIL_LOCAL_CODES)}@${decodeFragment(EMAIL_DOMAIN_CODES)}`;
}

/**
 * Populate email labels and mailto links after the page loads.
 *
 * @returns {void}
 */
export function initEmail() {
  const email = getEmailAddress();
  const emailLinks = document.querySelectorAll("[data-email-link]");
  const emailTextNodes = document.querySelectorAll("[data-email-text]");

  emailTextNodes.forEach((node) => {
    node.textContent = email;
  });

  emailLinks.forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) {
      return;
    }

    link.href = `mailto:${email}`;
    link.title = email;
  });
}
