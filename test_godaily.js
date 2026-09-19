const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('js/app.js', 'utf8');
const storage = fs.readFileSync('js/services/StorageService.js', 'utf8');
const drag = fs.readFileSync('js/dragAndDrop.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost/" });

dom.window.eval(storage);
dom.window.eval(drag);
dom.window.eval(`
  // Mock missing services
  window.ThemeService = { setTheme: () => {}, setLayout: () => {} };
  window.I18nService = { t: (key) => key, onLangChange: () => {} };
  window.NotificationService = { show: () => {} };
  window.ContentService = { load: () => {} };
`);
dom.window.eval(js);

dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

setTimeout(() => {
    try {
        console.log("Calling goDaily...");
        dom.window.appRouter.goDaily(new Date());
        console.log("goDaily finished successfully");
    } catch(e) {
        console.error("RUNTIME ERROR:", e);
    }
}, 1000);
