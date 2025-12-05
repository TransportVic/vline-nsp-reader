import { expect } from 'chai'
import nock from 'nock'
import constants from '../../lib/heat/constants.mjs'

import { dir as tmpdir } from 'tmp-promise'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import { getHeatTimetables, HeatTimetable, HeatTimetableFile } from '../../lib/heat/vline-heat.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const heatPage = (await fs.readFile(path.join(__dirname, 'sample-data', 'dec-2025.html'))).toString()
const heatTTData = await fs.readFile(path.join(__dirname, '..', 'pass', 'sample-data', '500-Traralgon-36-wolo-timetable-011225-web-v1.pdf'))

describe('The NSP website scraper', () => {
  describe('The getNSPVersion function', () => {
    it('Should return the timetables as a list of NSP files', async () => {
      nock(constants.VLINE_HOST).get(constants.HEAT_PAGE).reply(200, heatPage)

      const timetables = await getHeatTimetables()
      expect(timetables.files[0].line).to.equal('Geelong')
      expect(timetables.files[0].type).to.equal('36 degrees')
      expect(timetables.files[0].href).to.contain('/getattachment/426698f9-5dba-481b-9b4f-6bae7a38a1c7/Geelong-Melbourne-(Heat-timetable-36)')

      expect(timetables.files[1].line).to.equal('Warrnambool')
      expect(timetables.files[1].type).to.equal('36 degrees')

      expect(timetables.files[2].line).to.equal('Geelong')
      expect(timetables.files[2].type).to.equal('39 degrees')
      expect(timetables.files[2].href).to.equal('/getattachment/79d5b4ed-9407-4277-897b-332a9237fce1/Geelong-Melbourne-(Heat-timetable-39)')
    })
  })
})

describe('The NSPVersion class', () => {
  it('Should download its files to a given output directory', async () => {
    const tmp = await tmpdir({ unsafeCleanup: true })

    nock(constants.VLINE_HOST).get('/file.pdf').reply(200, heatTTData)

    const heatTT = new HeatTimetable()
    heatTT.addFile(new HeatTimetableFile('Geelong' ,'36 degrees', '/file.pdf'))

    await heatTT.saveFiles(tmp.path)

    const stat = await fs.stat(path.join(tmp.path, 'Geelong - 36 degrees.pdf'))
    expect(stat.size).to.equal(175941)

    await tmp.cleanup()
  })
})