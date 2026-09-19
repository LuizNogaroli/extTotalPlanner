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
  window.ThemeService = function() { this.setTheme = () => {}; this.setLayout = () => {}; };
  window.I18nService = function() { this.t = (k) => k; this.onLangChange = () => {}; };
  window.NotificationService = function() { this.show = () => {}; };
  window.ContentService = function() { this.load = () => {}; };
`);
dom.window.eval(js);

dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

setTimeout(() => {
    try {
        console.log("Calling goDaily...");
        const d = new Date();
        dom.window.appRouter.goDaily(d);
        console.log("goDaily executed.");
        
        const dailyWrapper = dom.window.document.getElementById('daily-view-wrapper');
        const weeklyWrapper = dom.window.document.getElementById('weekly-view-wrapper');
        console.log("Daily wrapper hidden?", dailyWrapper.classList.contains('hidden'));
        console.log("Weekly wrapper hidden?", weeklyWrapper.classList.contains('hidden'));
    } catch(e) {
        console.error("RUNTIME ERROR:", e);
    }
}, 500);
