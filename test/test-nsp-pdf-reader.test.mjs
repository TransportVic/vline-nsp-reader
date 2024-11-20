import { expect } from 'chai'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nspFP63EasternFreight = await fs.readFile(path.join(__dirname, 'sample-data', 'FP63 15-09-24 Eastern and S-East Freight NSP190824.pdf'))

describe('The NSP PDF Reader class', () => {
  
})