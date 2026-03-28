const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  
  // Wait for React app to load
  await page.waitForSelector('text=PyAlgo');
  
  // Wait for worker to load Pyodide
  console.log('Waiting for Pyodide to be Ready...');
  await page.waitForSelector('text=READY', { timeout: 30000 });
  
  // Click Run Code
  console.log('Clicking Run Code...');
  await page.click('button:has-text("Run Code")');
  
  // Wait for trace to generate (button text changes back to "Run Code")
  console.log('Waiting for trace generation...');
  await page.waitForSelector('button:has-text("Run Code")', { timeout: 15000 });
  
  // Check timeline length
  const timelineText = await page.innerText('.font-mono.flex-1.px-4.text-center');
  console.log('Timeline Info:', timelineText);
  
  // Check output
  const outputHTML = await page.innerHTML('.h-48.bg-black');
  console.log('Terminal HTML contains 120 (5!):', outputHTML.includes('120'));

  await browser.close();
})();
