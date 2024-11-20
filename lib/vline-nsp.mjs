import fetch from 'node-fetch';
import constants from './constants.mjs'
import { load as parseHTML } from 'cheerio'
import async from 'async'
import fs from 'fs/promises'
import path from 'path'
import { pipeline } from 'stream/promises'
import { createWriteStream } from 'fs'
import NSPPDFReader from './nsp-pdf-reader.mjs'

export class NSPVersion {

  version
  effective

  files = []

  constructor(version, effective) {
    this.version = version
    this.effective = effective
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

export class NSPFile {

  name
  href

  #nspVersion
  #filePath 

  constructor(name, href, nspVersion) {
    this.name = name
    this.href = href

    this.#nspVersion = nspVersion
  }

  async download(outputDir) {
    this.#filePath = path.join(outputDir, `${this.#nspVersion.version} ${this.name}.pdf`)

    let response = await fetch(constants.VLINE_CORPORATE_HOST + this.href)
    let outputStream = createWriteStream(this.#filePath)

    await pipeline(response.body, outputStream)
  }

  async extractRuns() {
    return await new NSPPDFReader(this.#filePath).read()
  }

}

export async function getNSPVersion() {
  let body = await (await fetch(constants.VLINE_CORPORATE_HOST + constants.NSP_PAGE)).text()
  let $ = parseHTML(body)

  let buttons = Array.from($('div#publication-list > a.btn.button-file-link-caption'))

  let nspVersions = {}

  buttons.filter(button => $(button).text().trim().startsWith('FP')).forEach(button => {
    let text = $(button).text()
    let data = text.match(/(FP\w+) (\d+)-(\d+)-(\d+) (.+)/)
    if (!data) return null

    let [_, version, day, month, year, name] = data

    if (!nspVersions[version]) nspVersions[version] = new NSPVersion(version, new Date(`${`20${year}`.slice(-4)}-${month}-${day}`))

    let nspVersion = nspVersions[version]
    nspVersion.addFile(new NSPFile(name.replace(/ NSP.+/, '').trim(), $(button).attr('href'), nspVersion))
  })

  return Object.values(nspVersions).sort((a, b) => b.effective - a.effective)
}