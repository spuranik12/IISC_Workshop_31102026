// Playwright login test for work-tracker.html, served from a local static server.
// Run: node test-login.js   (requires the `playwright` package, e.g. NODE_PATH=<dir>/node_modules)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 8123;
const URL = `http://localhost:${PORT}/work-tracker.html`;
const CREDS = { username: 'testuser01', password: 'Test@1234' };

const server = http.createServer((req, res) => {
  const file = path.join(__dirname, req.url === '/' ? 'work-tracker.html' : req.url.split('?')[0]);
  if (!file.startsWith(__dirname) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  fs.createReadStream(file).pipe(res);
});

let failures = 0;
const check = (name, ok) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

(async () => {
  await new Promise(r => server.listen(PORT, r));
  // HEADED=1 opens a visible browser window, slowed down so the steps can be watched
  const headed = process.env.HEADED === '1';
  const browser = await chromium.launch({ headless: !headed, slowMo: headed ? 600 : 0 });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(URL);
  check('login screen shown on first load', await page.isVisible('#loginScreen'));
  check('app header hidden while logged out', !(await page.isVisible('header')));

  await page.fill('#lUser', 'testuser01');
  await page.fill('#lPass', 'wrong-password');
  await page.click('#loginForm button[type=submit]');
  check('wrong password shows error', (await page.textContent('#loginError')).includes('Invalid'));
  check('still on login after wrong password', await page.isVisible('#loginScreen'));

  await page.keyboard.press('n');
  check('"n" shortcut blocked while logged out', await page.isHidden('#modal'));

  await page.click('#lFill');
  check('Fill button populates credentials',
    (await page.inputValue('#lUser')) === CREDS.username && (await page.inputValue('#lPass')) === CREDS.password);

  await page.click('#lToggle');
  check('show-password toggle reveals password', (await page.getAttribute('#lPass', 'type')) === 'text');

  await page.click('#loginForm button[type=submit]');
  check('login screen hidden after valid login', await page.isHidden('#loginScreen'));
  check('app header visible after login', await page.isVisible('header'));
  check('sample tasks rendered on board', (await page.locator('.card').count()) > 0);

  await page.reload();
  check('session persists across reload', await page.isHidden('#loginScreen'));

  const other = await context.newPage();
  await other.goto(URL);
  check('new tab requires login again', await other.isVisible('#loginScreen'));
  await other.close();

  await page.click('#logoutBtn');
  check('logout returns to login screen', await page.isVisible('#loginScreen'));

  check('no uncaught page errors', errors.length === 0);
  if (errors.length) console.log(errors);

  if (headed) await page.waitForTimeout(5000); // leave the window open briefly
  await browser.close();
  server.close();
  console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
