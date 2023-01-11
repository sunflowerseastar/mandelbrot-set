// this is from https://github.com/rustwasm/create-wasm-app, called 'bootstrap.js'

// A dependency graph that contains any wasm must all be imported
// asynchronously. This `bootstrap.js` file does the single async import, so
// that no one else needs to worry about it again.
import("./mandelbrot-set.js").catch((e) =>
  console.error("Error importing `mandelbrot-set.js`:", e)
);
