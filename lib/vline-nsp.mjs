import fetch from 'node-fetch';
import constants from './constants.mjs';
import { load as parseHTML } from 'cheerio'

class NSPVersion {

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

    nspVersions[version].addFile({
      name: name.replace(/ NSP.+/, '').trim(),
      href: $(button).attr('href')
    })
  })

  return Object.values(nspVersions).sort((a, b) => b.effective - a.effective)
}