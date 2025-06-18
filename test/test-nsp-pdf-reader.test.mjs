import { expect } from 'chai'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import NSPPDFReader from '../lib/nsp-pdf-reader.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nspFP63EasternFreight = path.join(__dirname, 'sample-data', 'FP63 15-09-24 Eastern and S-East Freight NSP190824.pdf')
const nspFP63NESG = path.join(__dirname, 'sample-data', 'FP63 15-09-24 North Eastern Standard Gauge Full Service NSP130824.pdf')
const nspFP65Central = path.join(__dirname, 'sample-data', 'FP65 13-04-25 Central Weekday NSP040325.pdf')

const nspFP63EasternFreightTSV = (await fs.readFile(path.join(__dirname, 'sample-data', 'freight.tsv'))).toString().replace(/^\uFEFF/, '').split('\n').map(line => line.split('\t'))
const nspFP63AlburyTSV = (await fs.readFile(path.join(__dirname, 'sample-data', 'albury.tsv'))).toString().replace(/^\uFEFF/, '').split('\n').map(line => line.split('\t'))

describe('The NSP PDF Reader class', () => {
  it('Should get the table header', async () => {
    let reader1 = new NSPPDFReader(nspFP63EasternFreight)
    reader1.__setPageData([nspFP63EasternFreightTSV])
    expect(reader1.getHeader(0)).to.deep.equal([
      ['Business ID', '', '9560', '9343 ††', '9343', '9562 ††', '9476', '9564', '9564 ††'],
      ['Days Run', '', 'MF', 'MO', 'ME', 'MF', 'MF', 'FE', 'FO'],
      ['Operator', '', 'QL', 'QL', 'QL', 'QL', 'QL', 'QL', 'QL'],
      ['Train Movement Type', '', 'Steel', 'Quarry', 'Quarry', 'Steel', 'Paper', 'Steel', 'Steel']
    ])

    let reader2 = new NSPPDFReader(nspFP63NESG)
    reader2.__setPageData([nspFP63AlburyTSV])
    expect(reader2.getHeader(0)).to.deep.equal([
      ['Business ID','','8605','2MA8','6MA8','8611','7605','ST24','8613','8615','7615','7601','8617','7603','7617','7603','8625'],
      ['Days Run','','Daily','MO','FO','Daily','Sun+MF','Daily','Sat','Daily','MF+Sat','Daily','SuO','MF','SuO','Sat','Daily'],
      ['Master Vehicle Formation','','3VS','OVERLAND','OVERLAND','3VS','3VS','XPT','3VS','2X 3VS','3VS','3VS','3VS','3VS','3VS','3VS','2X 3VS'],
      ['Formed By On Arrival','','8604 06:30 SDL','ON','ON','8610 10:27 ABY','8605 10:43 SPE','ON','8612 11:37 ABY','AAP 8610, 8614','8615 15:40 SPE','8611 11:09 SPE Sun+MF 8613 11:56 SPE Sat','8616 14:05 SDL','7604 04:50 SDM','8617 18:16 SPE','8611 11:09 SPE','8620 16:33 ABY'],
      ['Train Movement Type','','PSNG_SRV','PSNG_SRV','PSNG_SRV','EMPTY','EMPTY','PSNG_SRV','EMPTY','PSNG_SRV','EMPTY','EMPTY','PSNG_SRV','EMPTY','EMPTY','EMPTY','PSNG_SRV'],
    ])
  })

  it('Should get the table body', async () => {
    let reader1 = new NSPPDFReader(nspFP63EasternFreight)
    reader1.__setPageData([nspFP63EasternFreightTSV])
    let reader1Body = reader1.getBody(0)
    expect(reader1Body[0][0]).to.equal('Maryvale Paper Mill')
    expect(reader1Body[1][0]).to.equal('Maryvale Exch. Sdg')
    expect(reader1Body[1][6]).to.equal('10:39/10:47')
    expect(reader1Body[reader1Body.length - 2][0]).to.equal('WestGate Port Sdg')
    expect(reader1Body[reader1Body.length - 2][1]).to.equal('Arr')

    let reader2 = new NSPPDFReader(nspFP63NESG)
    reader2.__setPageData([nspFP63AlburyTSV])
    let reader2Body = reader2.getBody(0)
    expect(reader2Body[0][0]).to.equal('SOUTHERN CROSS')
    expect(reader2Body[0][2]).to.equal('07:07')
    expect(reader2Body[0][16]).to.equal('18:02')
    expect(reader2Body[reader2Body.length - 2][0]).to.equal('Albury Stabling')
    expect(reader2Body[reader2Body.length - 1][0]).to.equal('Forms')
  })

  it('Should merge pages that spill onto the next page together', async () => {
    let reader = new NSPPDFReader(nspFP65Central)
    await reader.read()
    let body0 = reader.getBody(0)
    expect(body0[0][0]).to.equal('SOUTHERN CROSS')
    expect(body0[2][0]).to.equal('Southern Cross MTM')
    expect(body0[body0.length - 2][0]).to.equal('KENSINGTON')
    expect(body0[body0.length - 1][0]).to.equal('Forms')

    expect(body0[body0.length - 1][2]).to.equal('19034 09:30 BKS')

    let body1 = reader.getBody(1)
    expect(body1[0][0]).to.equal('SOUTHERN CROSS')
    expect(body1[2][0]).to.equal('Southern Cross MTM')
    expect(body1[body1.length - 2][0]).to.equal('KENSINGTON')
    expect(body1[body1.length - 1][0]).to.equal('Forms')
    
    expect(body1[0][5]).to.equal('08:01')
    expect(body1[body1.length - 1][5]).to.equal('8224 08:42 SPE')

    expect(body1[0][6]).to.equal('08:05')
    expect(body1[body1.length - 1][6]).to.equal('')
  })

  it('Should return a list of stations per page', async () => {
    let reader1 = new NSPPDFReader(nspFP63EasternFreight)
    reader1.__setPageData([nspFP63EasternFreightTSV])
    let expectedStations = [
      'Maryvale Paper Mill',
      'Maryvale Exch. Sdg',
      'MORWELL LOOP',
      'Morwell Loop West',
      'Hernes Oak',
      'Moe West Junction',
      'Moe West Junction',
      'WARRAGUL',
      'WARRAGUL',
      'LONGWARRY',
      'BUNYIP',
      'BUNYIP',
      'Pakenham MTM Boundary',
      'Pakenham East',
      'Pakenham',
      'Pakenham',
      'Berwick',
      'Dandenong East Junction',
      'DANDENONG',
      'DANDENONG',
      'Apex Westall',
      'Westall',
      'Oakleigh',
      'Long Island Steel Terminal',
      'Frankston',
      'Caulfield',
      'Caulfield',
      'Caulfield',
      'Richmond Junction',
      'Richmond Junction',
      'FLINDERS STREET',
      'FLINDERS STREET',
      'FLINDERS STREET',
      'Viaduct Junction',
      'SOUTHERN CROSS',
      'Southern Cross MTM',
      'Franklin Street Junction',
      'Franklin Street Junction',
      'North Melbourne',
      'West Tower',
      'West Tower',
      'Spion Kop',
      'North Dynon Yard',
      'North Dynon Yard',
      'Dynon Jct.',
      'Dynon Jct.',
      'Sth Dynon Junction',
      'WestGate Port Sdg',
      'Forms'
    ]
    expect(reader1.getStations(0)).to.deep.equal(expectedStations)
    expect(reader1.getStations(0)).to.deep.equal(expectedStations)
  })

  it('Should generate a list of runs on each page (Eastern Data)', async () => {
    let reader1 = new NSPPDFReader(nspFP63EasternFreight)
    reader1.__setPageData([nspFP63EasternFreightTSV])
    let runs = reader1.getRuns(0)

    expect(runs[0].tdn).to.equal('9560')
    expect(runs[0].conditional).to.be.false
    expect(runs[0].daysRunCode).to.equal('MF')
    expect(runs[0].operator).to.equal('QL')
    expect(runs[0].movementType).to.equal('Steel')
    expect(runs[0].forming).to.equal('OFF')

    expect(runs[1].tdn).to.equal('9343')
    expect(runs[1].conditional).to.be.true
    expect(runs[1].daysRunCode).to.equal('MO')
    expect(runs[1].operator).to.equal('QL')
    expect(runs[1].movementType).to.equal('Quarry')
    expect(runs[1].forming).to.equal('TO KAX')
    expect(runs[1].stations[0]).to.deep.equal({
      name: 'Apex Westall',
      arrTime: '09:40',
      depTime: '09:40',
      express: false,
      plat: null,
      track: null
    })
    expect(runs[1].stations[1]).to.deep.equal({
      name: 'Westall',
      arrTime: '09:45',
      depTime: '09:50',
      express: false,
      plat: null,
      track: null
    })
    expect(runs[1].stations[2]).to.deep.equal({
      name: 'Oakleigh',
      arrTime: '09:58',
      depTime: '09:58',
      express: true,
      plat: null,
      track: null
    })
    expect(runs[1].stations[3]).to.deep.equal({
      name: 'Caulfield',
      arrTime: '10:05',
      depTime: '10:05',
      express: true,
      plat: '3',
      track: 'CL'
    })
    expect(runs[1].stations[8]).to.deep.equal({
      name: 'Franklin Street Junction',
      arrTime: '10:54',
      depTime: '10:54',
      express: true,
      plat: null,
      track: 'TS'
    })
    expect(runs[1].stations[10]).to.deep.equal({
      name: 'Spion Kop',
      arrTime: '10:56',
      depTime: '10:56',
      express: true,
      plat: null,
      track: null
    })
  })

  it('Should generate a list of runs on each page (NESG Data)', async () => {
    let reader2 = new NSPPDFReader(nspFP63NESG)
    reader2.__setPageData([nspFP63AlburyTSV])
    let runs = reader2.getRuns(0)

    expect(runs[0].tdn).to.equal('8605')
    expect(runs[0].conditional).to.be.false
    expect(runs[0].daysRunCode).to.equal('Daily')
    expect(runs[0].vehicleType).to.equal('3VS')
    expect(runs[0].operator).to.null
    expect(runs[0].movementType).to.equal('PSNG_SRV')
    expect(runs[0].formedBy).to.equal('8604 06:30 SDL')
    expect(runs[0].forming).to.equal('7605 11:00 ABS SUN+MF 8620 12:51 SPE SAT')

    expect(runs[1].tdn).to.equal('2MA8')
    expect(runs[1].conditional).to.be.false
    expect(runs[1].daysRunCode).to.equal('MO')
    expect(runs[1].vehicleType).to.equal('OVERLAND')
    expect(runs[1].operator).to.null
    expect(runs[1].movementType).to.equal('PSNG_SRV')
    expect(runs[1].formedBy).to.equal('ON')
    expect(runs[1].forming).to.be.null
  })
})