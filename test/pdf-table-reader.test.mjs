import { expect } from 'chai'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import TableReader from '../lib/table-reader.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nspFP63EasternFreightPath = path.join(__dirname, 'sample-data', 'FP63 15-09-24 Eastern and S-East Freight NSP190824.pdf')

describe('The PDF Table Reader class', () => {
  it('Should convert a PDF buffer into an array of pages, each containing the table data', async () => {
    let tableReader = new TableReader(nspFP63EasternFreightPath)
    let pages = await tableReader.read()
    // console.log(pages)
    expect(pages.length).to.equal(6)
  })
})