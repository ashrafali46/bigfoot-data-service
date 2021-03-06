import csv from 'csv-parser'
import Redis from 'ioredis'

import fs from 'fs'

let r = new Redis()
let p = r.pipeline()

fs.createReadStream('data/bfro_reports_geocoded.csv')
  .pipe(csv())
  .on('data', data => {
    let { number, title, date, observed, classification, county, state, latitude, longitude, location_details } = data

    let id = parseInt(number)
    title = title.replace(/^Report \d*: /, '')
    county = county.replace(/ County$/, '')
    let location = (longitude && latitude) ? `${longitude},${latitude}` : ''

    let key = `sighting:${id}`
    let values = { id, title, date, observed, classification, county, state, location, location_details }

    p.hset(key, values)
  })
  .on('end', () => {
    p.exec()
    r.quit()
  })
