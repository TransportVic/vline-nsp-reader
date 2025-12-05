import fetch from 'node-fetch';
import constants from './constants.mjs'
import { load as parseHTML } from 'cheerio'
import async from 'async'
import fs from 'fs/promises'
import path from 'path'
import { pipeline } from 'stream/promises'
import { createWriteStream } from 'fs'
import PassPDFReader from '../pass/pass-pdf-reader.mjs'

export class HeatTimetable {

  files = []

  constructor() {
  }

  addFile(file) {
    this.files.push(file)
  }

  async saveFiles(outputDir) {
    try {
      await fs.mkdir(outputDir)
    } catch (e) {}
    await async.forEach(this.files, async file => {
      await file.download(outputDir)
    })
  }

}

export class HeatTimetableFile {

  line
  type
  href

  #filePath 

  constructor(line, type, href) {
    this.line = line
    this.type = type
    this.href = href
  }

  async download(outputDir) {
    this.#filePath = path.join(outputDir, `${this.line} - ${this.type}.pdf`)

    let response = await fetch(constants.VLINE_HOST + this.href)
    let outputStream = createWriteStream(this.#filePath)

    await pipeline(response.body, outputStream)
  }

  setFilePath(filePath) {
    this.#filePath = filePath
  }

  async extractRuns() {
    let reader = new PassPDFReader(this.#filePath)
    return await reader.readRuns()
  }

  static fromFile(pathname) {
    const filename = path.basename(pathname).replace('.pdf', '')
    const [line, type] = filename.split(' - ')
    const file = new HeatTimetableFile(line, type, '')
    file.setFilePath(pathname)

    return file
  }

}

export async function getHeatTimetables() {
  let body = await (await fetch(constants.VLINE_HOST + constants.HEAT_PAGE)).text()
  let $ = parseHTML(body)

  let buttons = Array.from($('div.TimeTableHeaderMainContainer > a.button-file-link-caption'))
  const timetable = new HeatTimetable()

  buttons.forEach(button => {
    let text = $(button).text().replace(/PDF.+/, '').replace(' extreme heat timetable', '').replace(/via .+\(/, '(').replace(/ \/ \w+/, '')
    let data = text.match(/([\w ]+) \((.+)\)/)
    if (!data) return null

    let [_, line, type] = data
    timetable.addFile(new HeatTimetableFile(line, type, $(button).attr('href')))
  })

  return timetable.files.length ? timetable : null
}