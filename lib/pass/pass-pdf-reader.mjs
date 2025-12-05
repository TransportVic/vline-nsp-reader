import termini from '../nsp/termini.mjs'
import PassTableReader from './pass-table-reader.mjs'

export default class PassPDFReader {

  #filePath
  #pages

  constructor(filePath) {
    this.#filePath = filePath
  }

  getStations(table) {
    return table.map(row => row[0].replace(/a ?r ?r$/, '').replace(/d ?e ?p$/, '').trim())
  }

  getBody(table) {
    return table.map(row => row.slice(1))
  }

  async readRuns() {
    const tableReader = new PassTableReader(this.#filePath)
    const tables = await tableReader.read()

    const runs = []

    for (const table of tables) {
      const stations = this.getStations(table)
      const body = this.getBody(table)

      for (let columnIndex = 0; columnIndex < body[0].length; columnIndex++) {
        let currentRun = {
          type: '',
          stops: []
        }

        let lastStation
        for (let stationIndex = 0; stationIndex < stations.length; stationIndex++) {
          const stationName = stations[stationIndex]
          const stopData = (body[stationIndex][columnIndex] || '').replace('.', ':')
          if (stationName === 'Service') {
            currentRun.type = stopData[0] + stopData.slice(1).toLowerCase()
            continue
          }
          if (stationName === 'Service Information') continue
          if (!stopData || stopData.length === 1) continue

          if (lastStation && lastStation.name === stationName) {
            lastStation.dep = stopData
          } else {
            if (lastStation) currentRun.stops.push(lastStation)
            lastStation = {
              name: stationName,
              arr: stopData,
              dep: stopData
            }
          }
        }

        currentRun.stops.push(lastStation)
        runs.push(currentRun)
      }
    }

    return runs.map(run => this.setRunData(run))
  }

  setRunData(run) {
    return {
      ...run,
      origin: run.stops[0].name,
      destination: run.stops[run.stops.length - 1].name,
      departureTime: run.stops[0].dep,
      destinationArrivalTime: run.stops[run.stops.length - 1].arr,
    }
  }
    
}