import { firefox, Browser, Page } from 'playwright';

let browser: Browser;
let page: Page;
beforeAll(async () => {
  browser = await firefox.launch();
});
afterAll(async () => {
  await browser.close();
});
beforeEach(async () => {
  page = await browser.newPage();
});
afterEach(async () => {
  await page.close();
});

test('Two sweets within the first ten FtHoF casts! [SLOW]', async () => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://127.0.0.1:8080/');

    await page.click('#outcome-list .outcome-frame .outcome-backfire-icon');
    await page.click('#outcome-list .outcome-frame .gc-effect:nth-child(8)'); // sweet

    await page.click('#new-outcome-button .big-plus-icon');

    await page.click('#outcome-list .outcome-frame:nth-child(2) .outcome-backfire-icon');
    await page.click('#outcome-list .outcome-frame:nth-child(2) .gc-effect:nth-child(8)'); // sweet
    await page.fill('#outcome-list .outcome-frame:nth-child(2) .spells-cast-counter', '9');

    await page.click('#outcome-list #crack-seed-button');

    let currentPercentage = 0;
    while(true) {
        await new Promise(r => setTimeout(r, 1000)); // Sleep for one second

        let result = await page.evaluate( () => {
            return document.getElementById('cracking-result')!.textContent;
        });
        if(!result) fail('Result is null!');

        if(/Success/.test(result)) {
            // Check that the seed (zcral) is indeed part of the content
            expect(result).toMatch('zcral');
            break; // We're done
        } else {
            expect(result).toMatch(/([0-9.])*%/);
            let percentage = Number(result.match(/([0-9.]*)%/)![1]);
            // After one second, we must have had made at least some progress
            expect(percentage).toBeGreaterThanOrEqual(currentPercentage);
            currentPercentage = percentage;
        }
    }

    await browser.close()
}, 300*1000);
