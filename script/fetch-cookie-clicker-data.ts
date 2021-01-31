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

mkdirSync('cache/cookieclicker/img/', {recursive: true});

setTimeout(async () => {
    let browser = await firefox.launch();
    let page = await browser.newPage();
    let path: string;
    let currentURL: string;
    page.on('response', async response => {
        if(Math.floor(response.status()/100) == 2 && response.url() == currentURL) { // Success
            console.log('Writing ' + path);
            writeFileSync(path, await response.body());
        }
    })
    for(let {url} of urls) {
        currentURL = baseURL + url;
        path = 'cache/' + url;
        await page.goto(currentURL);
    }
    await page.close();
    await browser.close();
});
