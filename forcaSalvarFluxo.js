require('dotenv').config({ path: '.env.local' });
const puppeteer = require('puppeteer');

const [, , workflowId] = process.argv;
const email = process.env.N8N_EMAIL;
const senha = process.env.N8N_PASSWORD;

if (!workflowId || !email || !senha) {
  console.error('Uso: node forcaSalvarFluxo.js <workflowId> (com N8N_EMAIL e N8N_PASSWORD no .env.local)');
  process.exit(1);
}

const N8N_URL = 'https://workflows.guarumidia.com';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new', // usa o modo headless moderno (compatível com servidores)
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(`${N8N_URL}/workflow/${workflowId}`, { waitUntil: 'networkidle2' });

  try {
    await page.waitForSelector('input[name="emailOrLdapLoginId"]', { timeout: 8000 });
    await page.type('input[name="emailOrLdapLoginId"]', email);
    await page.type('input[name="password"]', senha);
    await page.click('[data-test-id="form-submit-button"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
  } catch {
    // Login não necessário
  }

  await page.waitForSelector('[data-test-id="canvas-trigger-node"]', { timeout: 15000 });
  await new Promise(resolve => setTimeout(resolve, 5000));

  const nodeHandle = await page.$('[data-test-id="canvas-trigger-node"]');
  const box = await nodeHandle.boundingBox();

  if (box) {
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const endY = startY + 40;

    await page.mouse.move(startX, startY);
    await page.mouse.down({ button: 'left' });
    await page.mouse.move(startX, endY, { steps: 10 });
    await page.mouse.up();
  }

  try {
    await page.waitForFunction(() => {
      const spans = Array.from(document.querySelectorAll('button span'));
      return spans.some(span => span.textContent?.trim() === 'Save');
    }, { timeout: 8000 });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const span = await btn.$('span');
      if (span) {
        const text = await page.evaluate(el => el.textContent, span);
        if (text?.trim() === 'Save') {
          await btn.click();
          break;
        }
      }
    }
  } catch {
    // Botão "Save" não apareceu
  }

  await browser.close();
})();
