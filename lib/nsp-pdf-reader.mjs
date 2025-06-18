import TableReader from './table-reader.mjs'

export default class NSPPDFReader {

  #filePath
  #pages

  constructor(filePath) {
    this.#filePath = filePath
  }

  getHeaderIndex(pageNum) {
    return this.#pages[pageNum].findIndex(row => row[0] === 'Train Movement Type')
  }

  getHeader(pageNum) {
    let headerIndex = this.getHeaderIndex(pageNum)
    return this.#pages[pageNum].slice(0, headerIndex + 1)
  }

  getBody(pageNum) {
    let headerIndex = this.getHeaderIndex(pageNum)
    return this.#pages[pageNum].slice(headerIndex + 2)
  }

  async read() {
    let tableReader = new TableReader(this.#filePath)
    this.#pages = await tableReader.read()
  }

  __setPageData(data) { this.#pages = data }

}