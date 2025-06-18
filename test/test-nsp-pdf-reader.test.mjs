import { expect } from 'chai'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import NSPPDFReader from '../lib/nsp-pdf-reader.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nspFP63EasternFreight = path.join(__dirname, 'sample-data', 'FP63 15-09-24 Eastern and S-East Freight NSP190824.pdf')

describe('The NSP PDF Reader class', () => {
  it.only('Should get the table header', async () => {
    let reader = new NSPPDFReader(nspFP63EasternFreight)
    await reader.read()
    let header = reader.getHeader(0)
    expect(header).to.deep.equal([
      ['Business ID', '', '9560', '9343 ††', '9343', '9562 ††', '9476', '9564', '9564 ††'],
      ['Days Run', '', 'MF', 'MO', 'ME', 'MF', 'MF', 'FE', 'FO'],
      ['Operator', '', 'QL', 'QL', 'QL', 'QL', 'QL', 'QL', 'QL'],
      ['Train Movement Type', '', 'Steel', 'Quarry', 'Quarry', 'Steel', 'Paper', 'Steel', 'Steel']
    ])
  })
})