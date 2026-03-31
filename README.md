# cadhan.dev

My portfolio website: https://cadhan.dev

Powered by HTML + CSS + JavaScript.

The project grid is generated from `data/projects.js` into `index.html` so the cards are present in the initial HTML instead of being injected after page load.

## Usage

Clone the repo and generate the project grid:

```bash
npm run generate:projects
```

Start your local static server of choice.

If you open the project in VS Code, the project grid watcher is configured to start automatically on folder open. With [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) running, changes to `data/projects.js` will regenerate the project cards and reload the page.

Build for production to the `dist` folder:

```bash
npm run build
```

Watch project data and regenerate the grid automatically:

```bash
npm run watch:projects
```

## Notes

- Project cards are generated from `data/projects.js`
- The generated project grid in `index.html` should not be edited manually
- GitHub Pages deployment runs through GitHub Actions

## License

[MIT](./LICENSE)
