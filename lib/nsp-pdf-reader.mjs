import TableReader from './table-reader.mjs'

export default class NSPPDFReader {

  #filePath
  #pages

  constructor(filePath) {
    this.#filePath = filePath
  }

  getHeader(pageNum) {
    let pageData = this.#pages[pageNum]
    let headerIndex = pageData.findIndex(row => row[0] === 'Train Movement Type')
    return pageData.slice(0, headerIndex + 1)
  }

  async read() {
    let tableReader = new TableReader(this.#filePath)
    this.#pages = await tableReader.read()
  }

}