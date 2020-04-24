const puppeteer = require('puppeteer')
const fs = require('fs').promises
const path = require('path')
require('dotenv').config()

// create screenshots folder, if it doesn't exist already. Delete files from previous runs, if it exists
;(async () => {
  try{
    const stats = await fs.stat('screenshots')
    const files = await fs.readdir('screenshots')
    for (const file of files) {
      fs.unlink(path.join('screenshots', file))
    }
  } catch (err) {
    if(err.code === 'ENOENT') {
      await fs.mkdir('screenshots')
    }
  }
})()

try {
  (async () => {
    //{headless:false}
    const browser = await puppeteer.launch({headless:true})
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
    await page.setViewport({ width: 1200, height: 800 })
    await page.goto('https://youtube.com')
    await page.screenshot({path: `screenshots/init.png`})
    // click login button
    const buttonHandle = await page.evaluateHandle(`document.querySelector("#buttons > ytd-button-renderer > a")`)
    await buttonHandle.click()

    // enter login info    
    await page.waitForSelector('#yDmH0d')
    await page.type('#identifierId', process.env.EMAIL)
    await page.click('#identifierNext')

    // enter password
    await page.waitForNavigation({timeout:25000, waitUntil:'networkidle0'})
    await page.waitForSelector('#passwordNext')
    const input = await page.evaluateHandle(`document.querySelector("#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input")`)
    await input.focus()
    await input.type(process.env.PASS)
    await page.evaluate(()=>document.querySelector('#passwordNext').click())

    let videoNumber = 1
    
    await page.waitForNavigation({timeout:25000, waitUntil:'networkidle2'})
    await page.screenshot({ path: `screenshots/0.png` })    
    await page.waitForSelector('ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer') 
    const recommended = await page.$$('ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer')
    await recommended[2].click()
    
    while(1) {
      await page.waitFor(4000)
      await page.waitForSelector('.html5-video-container')
      try {
        const example = await page.evaluate(() => {
          const meta = {}
          meta['title'] = document.querySelector('#container > h1 > yt-formatted-string').innerText
          meta['views'] = document.querySelector('#count > yt-view-count-renderer > span.view-count.style-scope.yt-view-count-renderer').innerText
          meta['published'] = document.querySelector('#date > yt-formatted-string').innerText
          meta['channel'] = document.querySelector("#upload-info.style-scope.ytd-video-owner-renderer > #channel-name > div > div > yt-formatted-string > a").innerText
          meta['subscribers'] = document.querySelector("#owner-sub-count").innerText
          //meta['likes'] = document.querySelector("#text.style-scope.ytd-toggle-button-renderer.style-text").innerText
          //meta['dislikes'] = 
          return JSON.stringify(meta)
        })
        console.log(example)
      } catch (e) {
        console.log(e)
        await page.waitFor(1000)
        await page.screenshot({ path: `screenshots/ERROR.png` })
      }
      await page.screenshot({ path: `screenshots/${videoNumber}.png` })
      console.log(`screenshot ${videoNumber++}`)
      await page.waitFor(1000)
      await page.waitForSelector('a.ytp-next-button.ytp-button')
      try {
        await page.click('a.ytp-next-button.ytp-button')
      } catch(e) {
        await page.waitForSelector('a#logo')
        await page.click('a#logo')
        await page.waitFor(5000)
        await page.waitForSelector('ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer')
        await page.screenshot({path: `screenshots/${videoNumber - 1}-reset.png`})
        const recommended = await page.$$('ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer')
        await recommended[0].click()
      }
    }
  })()
} catch (err) {
  console.error(err)
}