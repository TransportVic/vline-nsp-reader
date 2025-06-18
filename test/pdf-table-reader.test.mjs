import { expect } from 'chai'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import TableReader from '../lib/table-reader.mjs'
import { exec } from 'child_process'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nspFP63EasternFreightPath = path.join(__dirname, 'sample-data', 'FP63 15-09-24 Eastern and S-East Freight NSP190824.pdf')
const nspFP63EasternFreightTSV = (await fs.readFile(path.join(__dirname, 'sample-data', 'freight.tsv'))).toString().replace(/^\uFEFF/, '').split('\n').map(line => line.split('\t'))

const nspFP63AlburyPath = path.join(__dirname, 'sample-data', 'FP63 15-09-24 North Eastern Standard Gauge Full Service NSP130824.pdf')
const nspFP63AlburyTSV = (await fs.readFile(path.join(__dirname, 'sample-data', 'albury.tsv'))).toString().replace(/^\uFEFF/, '').split('\n').map(line => line.split('\t'))

describe('The PDF Table Reader class', () => {
  it('Should convert a PDF buffer into an array of pages, each containing the table data (freight data)', async () => {
    let tableReader = new TableReader(nspFP63EasternFreightPath)
    let pages = await tableReader.read()

    expect(pages.length).to.equal(6)
    expect(pages[0]).to.deep.equal(nspFP63EasternFreightTSV)
  })

  it('Should convert a PDF buffer into an array of pages, each containing the table data (albury data)', async () => {
    let tableReader = new TableReader(nspFP63AlburyPath)
    let pages = await tableReader.read()

    expect(pages.length).to.equal(4)
    expect(pages[0]).to.deep.equal(nspFP63AlburyTSV)
  })

  it('Should not include the "Effective/As at/Replaces" text in the table', async () => {
    let tableReader = new TableReader(nspFP63EasternFreightPath)
    let pages = await tableReader.read()

    let page4Text = pages[3].map(row => row.join('')).join('')
    expect(page4Text).not.to.include('Effective')
  })
})