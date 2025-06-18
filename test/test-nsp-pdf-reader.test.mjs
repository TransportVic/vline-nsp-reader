import { expect } from 'chai'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import NSPPDFReader from '../lib/nsp-pdf-reader.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nspFP63EasternFreight = path.join(__dirname, 'sample-data', 'FP63 15-09-24 Eastern and S-East Freight NSP190824.pdf')
const nspFP63NESG = path.join(__dirname, 'sample-data', 'FP63 15-09-24 North Eastern Standard Gauge Full Service NSP130824.pdf')

describe('The NSP PDF Reader class', () => {
  it('Should get the table header', async () => {
    let reader1 = new NSPPDFReader(nspFP63EasternFreight)
    await reader1.read()
    expect(reader1.getHeader(0)).to.deep.equal([
      ['Business ID', '', '9560', '9343 ††', '9343', '9562 ††', '9476', '9564', '9564 ††'],
      ['Days Run', '', 'MF', 'MO', 'ME', 'MF', 'MF', 'FE', 'FO'],
      ['Operator', '', 'QL', 'QL', 'QL', 'QL', 'QL', 'QL', 'QL'],
      ['Train Movement Type', '', 'Steel', 'Quarry', 'Quarry', 'Steel', 'Paper', 'Steel', 'Steel']
    ])

    let reader2 = new NSPPDFReader(nspFP63NESG)
    await reader2.read()
    expect(reader2.getHeader(0)).to.deep.equal([
      ['Business ID','','8605','2MA8','6MA8','8611','7605','ST24','8613','8615','7615','7601','8617','7603','7617','7603','8625'],
      ['Days Run','','Daily','MO','FO','Daily','Sun+MF','Daily','Sat','Daily','MF+Sat','Daily','SuO','MF','SuO','Sat','Daily'],
      ['Master Vehicle Formation','','3VS','OVERLAND','OVERLAND','3VS','3VS','XPT','3VS','2X 3VS','3VS','3VS','3VS','3VS','3VS','3VS','2X 3VS'],
      ['Formed By On Arrival','','8604 06:30 SDL','ON','ON','8610 10:27 ABY','8605 10:43 SPE','ON','8612 11:37 ABY','AAP 8610, 8614','8615 15:40 SPE','8611 11:09 SPE Sun+MF 8613 11:56 SPE Sat','8616 14:05 SDL','7604 04:50 SDM','8617 18:16 SPE','8611 11:09 SPE','8620 16:33 ABY'],
      ['Train Movement Type','','PSNG_SRV','PSNG_SRV','PSNG_SRV','EMPTY','EMPTY','PSNG_SRV','EMPTY','PSNG_SRV','EMPTY','EMPTY','PSNG_SRV','EMPTY','EMPTY','EMPTY','PSNG_SRV'],
    ])
  })
})