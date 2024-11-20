import { expect } from 'chai'
import nock from 'nock'
import constants from '../lib/constants.mjs'
import { getNSPVersion } from '../lib/vline-nsp.mjs'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nspFP61FP62 = (await fs.readFile(path.join(__dirname, 'sample-data', 'nsp-fp61-fp62.html'))).toString()
const nspFP63 = (await fs.readFile(path.join(__dirname, 'sample-data', 'nsp-fp63.html'))).toString()

describe('The NSP website scraper', () => {
  
  describe('The getNSPVersion function', () => {
    it('Should read the NSP website and determine the NSP version available', async () => {
      nock(constants.VLINE_CORPORATE_HOST).get(constants.NSP_PAGE).reply(200, nspFP63)
      expect(await getNSPVersion()).to.deep.equal([{
        version: 'FP63',
        effective: new Date('2024-09-15')
      }])
    })

    it('Should work with multiple NSP version being available', async () => {
      nock(constants.VLINE_CORPORATE_HOST).get(constants.NSP_PAGE).reply(200, nspFP61FP62)
      expect(await getNSPVersion()).to.deep.equal([{
        version: 'FP62',
        effective: new Date('2023-11-19')
      }, {
        version: 'FP61',
        effective: new Date('2023-05-28')
      }])
    })
  })

})