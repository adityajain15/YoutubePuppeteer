const puppeteer = require('puppeteer')
const fs = require('fs').promises
const path = require('path')
const mongo = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const dbUrl = 'mongodb://localhost:27017'
require('dotenv').config()

async function setupDatabase() {
  const client = await mongo.connect(dbUrl, { useUnifiedTopology: true })
  try{
    const db = await client.db('veilance')
    return db
  } catch (e) {
    console.log(e)
  }
}

async function setupFolder() {
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
}

async function init() {
  await setupFolder()
  console.log(`----Folder setup----`)
  const db = await setupDatabase()
  console.log(`----Database setup----`)
  puppet(db)
}

async function puppet(db) {
  let autoplayCheck = true
  const collection = db.collection('videos')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  })
  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36')
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
  //await page.waitForNavigation({timeout:25000, waitUntil:'networkidle2'})
  await page.waitFor(4000)
  await page.waitForSelector('#passwordNext')
  const input = await page.evaluateHandle(`document.querySelector("#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input")`)
  await input.focus()
  await input.type(process.env.PASS)
  await page.evaluate(()=>document.querySelector('#passwordNext').click())

  let videoNumber = 1
  let errorNumber = 1
  await page.waitForNavigation({timeout:25000, waitUntil:'networkidle2'})
  //page.on('console', consoleObj => console.log(consoleObj.text()))
  await page.screenshot({ path: `screenshots/0.png` })    
  await page.waitForSelector('ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer') 
  const recommended = await page.$$('ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer')
  await recommended[2].click()
  
  while(1) {
    if(autoplayCheck) {
      try{
        await page.waitForSelector('paper-toggle-button#toggle')
        await page.screenshot({ path: `screenshots/autoplaycheck-0.png` })
        autoplayCheck = await page.evaluate(()=>{
          const toggle = document.querySelector('paper-toggle-button#toggle')
          if(toggle) {
            if(toggle.getAttribute('aria-pressed') === "true") {
              toggle.click()
              return Promise.resolve(false)
            }
          }
          return Promise.resolve(true)
        })
        await page.screenshot({ path: `screenshots/autoplaycheck-1.png` })
      } catch (e) {
        console.log(e)
      }
        
    }
    
    await page.waitFor(4000)
    await page.waitForSelector('.html5-video-container')
    
    try {
      let [metadata, recommended] = await page.evaluate(async () => {
        async function sleep(ms){
          return new Promise(resolve => setTimeout(resolve, ms))
        }
        const meta = {}
        meta['title'] = document.querySelector('#container > h1 > yt-formatted-string').innerText
        meta['views'] = document.querySelector('#count > yt-view-count-renderer > span.view-count.style-scope.yt-view-count-renderer').innerText
        meta['published'] = document.querySelector('#date > yt-formatted-string').innerText
        meta['channel'] = document.querySelector("#upload-info.style-scope.ytd-video-owner-renderer > #channel-name > div > div > yt-formatted-string > a").innerText
        meta['subscribers'] = document.querySelector("#owner-sub-count").innerText
        meta['length'] = document.querySelector('.ytp-bound-time-right').innerText

        const children = []
        if(document.querySelector('#items.ytd-watch-next-secondary-results-renderer')){
          let el = document.querySelectorAll('ytd-compact-video-renderer')
          for (let i = 0; i < 5; i++){
            let next = el[i]
            let child = {}
            if(!next.querySelector('#video-title')){
              continue
            }
            child['title'] = next.querySelector('#video-title').innerText
            child['channel'] = next.querySelector('#channel-name').innerText
            child['link'] = next.querySelector('a.yt-simple-endpoint').href
            if(next.querySelector('#metadata-line').children.length === 3) {
              const spanArray = Array.from(next.querySelector('#metadata-line').children)
              child['views'] = spanArray[0].innerText
              child['published'] = spanArray[1].innerText
            } else if (next.querySelector('#metadata-line').children.length === 2) {
              const spanArray = Array.from(next.querySelector('#metadata-line').children)
              child['other'] = spanArray[0].innerText
            }
            children.push(child)
          }
        }

        // get category
        if(document.querySelector('#content.style-scope.ytd-metadata-row-renderer')){
          meta['category'] = document.querySelector('#content.style-scope.ytd-metadata-row-renderer').innerText
        } else {
          if(document.querySelector('paper-button#more')) {
            document.querySelector('paper-button#more').click()
            await sleep(500)
            if(document.querySelector('#content.style-scope.ytd-metadata-row-renderer')){
              meta['category'] = document.querySelector('#content.style-scope.ytd-metadata-row-renderer').innerText
            }
          }
        }
        return Promise.resolve([meta, children])
      })
      console.log(recommended)
      metadata['url'] = page.url()
      const player = await page.$('#player-container-outer')
      const imageUrl = `screenshots/${videoNumber}.png`
      await page.screenshot({ path: imageUrl })
      metadata['image'] = path.join(__dirname, imageUrl)
      const videoInserted = await db.collection('Videos').insertOne(metadata)
      await db.collection('Recommendations').insertMany(
        recommended.map(d=>{
          d['video'] = videoInserted.insertedId
          return d
        })
      )
      videoNumber++
    } catch (e) {
      // error, video can probably not be played
      console.log('------------------------------------------------')
      console.log(e)
      console.log('------------------------------------------------')
      await page.screenshot({path: `screenshots/error-${errorNumber++}.png`})
    }
    await page.waitFor(1000)
    await page.waitForSelector('#items.style-scope.ytd-watch-next-secondary-results-renderer')
    const recommendedHandle = await page.$$('ytd-compact-video-renderer')
    try {
      const random = Math.floor(Math.random() * 5)
      console.log(`Currently on ${videoNumber - 1} picking recommendation ${random}`)
      await recommendedHandle[random].click()
    } catch(e) {
      await page.waitForSelector('a#logo')
      await page.click('a#logo')
      await page.waitFor(5000)
      await page.waitForSelector('ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer')
      await page.screenshot({path: `screenshots/${videoNumber}-reset.png`})
      const recommended = await page.$$('ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer')
      await recommended[0].click()
    }
  }
}

init()