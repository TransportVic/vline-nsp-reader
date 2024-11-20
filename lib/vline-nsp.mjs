import fetch from 'node-fetch';
import constants from './constants.mjs';
import { load as parseHTML } from 'cheerio'

class NSPVersion {

  version
  effective

  constructor(version, effective) {
    this.version = version
    this.effective = effective
  }

}

export async function getNSPVersion() {
  let body = await (await fetch(constants.VLINE_CORPORATE_HOST + constants.NSP_PAGE)).text()
  let $ = parseHTML(body)

  let buttons = $('div#publication-list > a.btn.button-file-link-caption')

  let buttonText = Array.from(buttons).map(button => {
    return $(button).text().trim()
  }).filter(text => text.startsWith('FP'))

  let nspVersions = {}

  buttonText.forEach(text => {
    let data = text.match(/(FP\w+) (\d+)-(\d+)-(\d+)/)
    if (!data) return null

    let [_, version, day, month, year] = data

    if (!nspVersions[version]) nspVersions[version] = new NSPVersion(version, new Date(`${`20${year}`.slice(-4)}-${month}-${day}`))
  })

  return Object.values(nspVersions).sort((a, b) => b.effective - a.effective)
}