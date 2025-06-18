import { getOperationDays } from './nsp-utils.mjs'
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

  processStation(station) {
    if (station.depTime.endsWith('*')) {
      station.express = true
      station.depTime = station.depTime.slice(0, -1)
    }

    if (station.depTime && !station.arrTime) {
      if (station.depTime.includes('/')) {
        let [ arrTime, depTime ] = station.depTime.split('/')
        station.arrTime = arrTime, station.depTime = depTime
      } else {
        station.arrTime = station.depTime
      }
    }

    return station
  }

  getRuns(pageNum) {
    let header = this.getHeader(pageNum)
    let body = this.getBody(pageNum)
    let stations = this.getStations(pageNum)

    let runs = []
    for (let runIndex = 2; runIndex < header[0].length; runIndex++) {
      let runData = {
        tdn: header[0][runIndex].slice(0, 4),
        conditional: header[0][runIndex].length > 4,
        daysRunCode: header[1][runIndex],
        daysRun: getOperationDays(header[1][runIndex]),
        operator: null, movementType: null,
        formedBy: null, forming: null,
        vehicleType: null, stations: []
      }

      for (let headerRow = 2; headerRow < header.length; headerRow++) {
        let rowName = header[headerRow][0]
        let rowData = header[headerRow][runIndex]
        if (rowName === 'Operator') runData.operator = rowData
        else if (rowName === 'Train Movement Type') runData.movementType = rowData
        else if (rowName === 'Master Vehicle Formation') runData.vehicleType = rowData
        else if (rowName === 'Formed By On Arrival') runData.formedBy = rowData
      }

      let lastStation = null
      let lastStationName = null
      for (let stationIndex = 0; stationIndex < stations.length - 1; stationIndex++) {
        let currentStation = stations[stationIndex]
        let stationData = body[stationIndex][runIndex]
        if (!stationData) continue
        if (lastStationName === currentStation) {
          let amendmentType = body[stationIndex][1]
          if (amendmentType === 'Plat') lastStation.plat = stationData
          else if (amendmentType === 'Arr') lastStation.arrTime = stationData
          else lastStation.track = stationData
        } else {
          if (lastStation) runData.stations.push(lastStation)
          lastStation = {
            name: currentStation,
            arrTime: null,
            depTime: stationData,
            plat: null, track: null, express: false
          }
        }

        lastStationName = currentStation
      }

      runData.stations.push(lastStation)
      runData.stations = runData.stations.map(station => this.processStation(station))
      let forming = body[stations.length - 1][runIndex].toUpperCase()
      runData.forming = forming.length ? forming : null
      runs.push(runData)
    }

    return runs
  }

  getAllRuns() {
    let runs = []
    for (let i = 0; i < this.#pages.length; i++) runs.push(...this.getRuns(i))
    return runs
  }

}