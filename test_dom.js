const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('js/app.js', 'utf8');
const storage = fs.readFileSync('js/storage.js', 'utf8');
const drag = fs.readFileSync('js/dragAndDrop.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });

// Polyfill textContent and other browser APIs if needed, but JSDOM does a good job.
dom.window.eval(storage);
dom.window.eval(drag);
try {
    dom.window.eval(js);
    
    // Fire DOMContentLoaded
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
    
    // If no error is caught here or in promise rejection, we are fine.
    console.log("No initial synchronous errors.");
} catch (e) {
    console.error("RUNTIME ERROR:", e);
}

// Check for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
