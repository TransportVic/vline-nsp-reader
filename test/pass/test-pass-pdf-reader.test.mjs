import { expect } from 'chai'
import path from 'path'
import url from 'url'
import PassPDFReader from '../../lib/pass/pass-pdf-reader.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const traralgonWOLO = path.join(__dirname, 'sample-data', '500-Traralgon-36-wolo-timetable-011225-web-v1.pdf')

describe('The Pass PDF Reader class', () => {
  it('Extracts coach runs', async () => {
    const reader = new PassPDFReader(traralgonWOLO)
    const runs = await reader.readRuns()
    const coach0540 = runs.find(coach => coach.origin === 'Drouin' && coach.destination === 'Traralgon' && coach.departureTime === '05:40')
    expect(coach0540).to.exist
    expect(coach0540.type).to.equal('Coach')

    const stops = coach0540.stops
    expect(stops[0]).to.deep.equal({
      name: 'Drouin',
      arr: '05:40',
      dep: '05:40'
    })

    expect(stops[1]).to.deep.equal({
      name: 'Warragul (1)',
      arr: '05:52',
      dep: '05:52'
    })
  })

  it('Extracts rail runs', async () => {
    const reader = new PassPDFReader(traralgonWOLO)
    const runs = await reader.readRuns()
    const train0940 = runs.find(train => train.origin === 'SOUTHERN CROSS' && train.destination === 'Traralgon' && train.departureTime === '09:25' && train.destinationArrivalTime === '12:04')
    expect(train0940).to.exist
    expect(train0940.type).to.equal('Train')

    const stops = train0940.stops
    expect(stops[15]).to.deep.equal({
      name: 'Moe',
      arr: '11:29',
      dep: '11:29'
    })

    expect(stops[16]).to.deep.equal({
      name: 'MORWELL',
      arr: '11:42',
      dep: '11:55'
    })

    expect(stops[17]).to.deep.equal({
      name: 'Traralgon',
      arr: '12:04',
      dep: '12:04'
    })
  })
})