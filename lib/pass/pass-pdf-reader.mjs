import termini from '../nsp/termini.mjs'
import PassTableReader from './pass-table-reader.mjs'

export default class PassPDFReader {

  #filePath
  #pages

  constructor(filePath) {
    this.#filePath = filePath
  }

  async readRuns() {
    const tableReader = new PassTableReader(this.#filePath)
    const tables = await tableReader.read()
    
  }

    
}