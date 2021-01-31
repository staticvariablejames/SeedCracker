import { mkdirSync, writeFileSync } from 'fs';
import { firefox } from 'playwright';

let baseURL = 'https://orteil.dashnet.org/';

let urls = [
    {url: 'cookieclicker/img/bunnies.png'},
    {url: 'cookieclicker/img/goldCookie.png'},
    {url: 'cookieclicker/img/hearts.png'},
    {url: 'cookieclicker/img/icons.png'},
    {url: 'cookieclicker/img/wrathCookie.png'},
];

mkdirSync('cookieclicker/img/', {recursive: true});

setTimeout(async () => {
    let browser = await firefox.launch();
    let page = await browser.newPage();
    let path: string;
    page.on('response', async response => {
        if(Math.floor(response.status()/100) == 2) { // Success
            writeFileSync(path, await response.body());
        }
    })
    for(let {url} of urls) {
        path = './' + url;
        await page.goto(baseURL + url);
    }
    await page.close();
    await browser.close();
});
