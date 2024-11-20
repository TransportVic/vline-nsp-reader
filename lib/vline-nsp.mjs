import fetch from 'node-fetch';
import constants from './constants.mjs';
import { load as parseHTML } from 'cheerio'

export async function getNSPVersion() {
  let body = await (await fetch(constants.VLINE_CORPORATE_HOST + constants.NSP_PAGE)).text()
  let $ = parseHTML(body)

  let buttons = $('div#publication-list > a.btn.button-file-link-caption')
  return Array.from(buttons).map(button => {
    return $(button).text().trim()
  }).filter(text => text.startsWith('FP')).map(text => {
    let data = text.match(/(FP\w+) (\d+)-(\d+)-(\d+)/)
    if (!data) return null

    let [_, version, day, month, year] = data

    return {
      version: version,
      effective: new Date(`${`20${year}`.slice(-4)}-${month}-${day}`)
    }
  }).sort((a, b) => b.effective - a.effective).filter((file, i, arr) => i == 0 || arr[i - 1].version !== file.version)
}