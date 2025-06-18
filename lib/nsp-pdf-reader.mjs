import TableReader from './table-reader.mjs'

export default class NSPPDFReader {

  #filePath
  #pages

  constructor(filePath) {
    this.#filePath = filePath
  }

  getHeader(pageNum) {

  }

  async read() {
    let tableReader = new TableReader(this.#filePath)
    this.#pages = await tableReader.read()
  }

}