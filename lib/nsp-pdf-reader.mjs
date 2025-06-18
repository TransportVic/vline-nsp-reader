import TableReader from './table-reader.mjs'

export default class NSPPDFReader {

  #filePath
  #pages

  #stations = []

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

  getStations(pageNum) {
    if (this.#stations[pageNum]) return this.#stations[pageNum]
    let body = this.getBody(pageNum)
    let stationList = body.map(row => row[0])

    let output = []
    let lastStation = stationList[0]
    for (let i = 0; i < stationList.length; i++) {
      if (stationList[i]) {
        lastStation = stationList[i]
        output.push(stationList[i])
      } else {
        output.push(lastStation)
      }
    }

    this.#stations[pageNum] = output
    return output
  }

  async read() {
    let tableReader = new TableReader(this.#filePath)
    this.#pages = await tableReader.read()
  }

  __setPageData(data) { this.#pages = data }

  getRuns(pageNum) {
    let header = this.getHeader(pageNum)
    let body = this.getBody(pageNum)
    let stations = this.getStations(pageNum)

    let runs = []
    for (let runIndex = 2; runIndex < header[0].length; runIndex++) {
      let runData = {
        tdn: header[0][runIndex].slice(0, 4),
        conditional: header[0][runIndex].length > 4,
        daysRun: header[1][runIndex],
        operator: header[2][runIndex],
        movementType: header[3][runIndex],
        stations: []
      }

      runs.push(runData)
    }
    return runs
  }

}