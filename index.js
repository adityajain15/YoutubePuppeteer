const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

fs.readdir('screenshots', (err, files) => {
  if (err) throw err

  for (const file of files) {
    fs.unlink(path.join('screenshots', file), err => {
      if (err) throw err
    })
  }
})

require('dotenv').config()
const screenshot = 'youtube_fm_dreams_video.png'
try {
  (async () => {
    //{headless:false}
    const browser = await puppeteer.launch({headless:true})
    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 800 })
    await page.goto('https://youtube.com')
    await page.screenshot({path: `screenshots/init.png`})
    // click login button
    const buttonHandle = await page.evaluateHandle(`document.querySelector("#buttons > ytd-button-renderer > a")`)
    await buttonHandle.click()

    // enter login info
    
    await page.waitForNavigation({timeout:25000, waitUntil:'domcontentloaded'})
    await page.waitForSelector('#yDmH0d')
    await page.type('#identifierId', process.env.EMAIL)
    await page.screenshot({path: `screenshots/login1.png`})
    await page.click('#identifierNext')

    // enter password
    await page.waitForNavigation({timeout:25000, waitUntil:'networkidle0'})
    await page.waitForSelector('#passwordNext')
    const input = await page.evaluateHandle(`document.querySelector("#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input")`)
    await input.focus()
    await input.type(process.env.PASS)
    await page.evaluate(()=>document.querySelector('#passwordNext').click())

    let videoNumber = 1
    // search
    //await page.waitForSelector("ytd-thumbnail.ytd-rich-grid-renderer")
    await page.waitForSelector('ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer') 
    await page.screenshot({path: `screenshots/${videoNumber}.png`})
    const recommended = await page.$$('ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer')
    await recommended[0].click()
    
    while(1) {
      await page.waitForSelector('.html5-video-container')
      await page.waitFor(5000)
      await page.screenshot({ path: `screenshots/${videoNumber}.png` })
      console.log(`screenshot ${videoNumber++}`)
      await page.waitForSelector('a.ytp-next-button.ytp-button')
      try {
        await page.click('a.ytp-next-button.ytp-button')
      } catch(e) {
        await page.waitForSelector('a#logo')
        await page.click('a#logo')
        await page.waitFor(5000)
        await page.waitForSelector('ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer')
        await page.screenshot({path: `screenshots/${videoNumber}-reset.png`})
        const recommended = await page.$$('ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer')
        await recommended[0].click()
      }
      //await page.waitForNavigation({timeout:0})
    }
    
    
    
    console.log('done')
    /*
    await page.type('#search', 'Clinton emails truth')
    await page.click('button#search-icon-legacy')*/

    //await page.waitForNavigation({timeout:4000})
    
    //const pass = await page.$eval("#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input")
    //await pass.type('dsa')
    //console.log(searchValue)
    //const buttons = await page.$$('#buttons')
    //console.log(buttons[5])
    //await buttons[3].click()
    /*
    await page.click('button#search-icon-legacy')
    await page.waitForSelector('ytd-thumbnail.ytd-video-renderer')
    await page.screenshot({path: 'youtube_fm_dreams_list.png'})
    const videos = await page.$$('ytd-thumbnail.ytd-video-renderer')
    await videos[2].click()
    await page.waitForSelector('.html5-video-container')
    await page.waitFor(5000)
    await page.screenshot({ path: screenshot })*/
    //await browser.close()
    console.log('See screenshot: ' + screenshot)
  })()
} catch (err) {
  console.error(err)
}