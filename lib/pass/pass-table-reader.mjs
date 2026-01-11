import PDFParser from '@transportme/pdf2json'
import fs from 'fs/promises'

export default class PassTableReader {

  #file

  constructor(file) {
    this.#file = file
  }

  parserCallback(data) {
    return data.Pages.flatMap(page => {
      const { HLines, VLines } = page

      const heightFrequency = VLines.reduce((acc, line) => {
        if (!acc[line.l]) acc[line.l] = 0
        acc[line.l]++
        return acc
      }, {})
      const commonHeight = parseFloat(Object
        .keys(heightFrequency)
        .map(height => ({ height, freq: heightFrequency[height] }))
        .sort((a, b) => b.freq - a.freq)[0].height)

      const rowStarts = VLines
        .filter(fill => Math.abs(fill.l - commonHeight) < 0.1)
        .map(fill => fill.y)
        .filter((e, i, a) => a.indexOf(e) === i)
        .sort((a, b) => a - b)

      const tables = rowStarts.slice(1).reduce((acc, row) => {
        const currTable = acc[acc.length - 1]
        const tableEnd = currTable[currTable.length - 1]
        if (row - tableEnd > commonHeight * 1.5) {
          // New table
          acc.push([row])
        } else {
          // Existing table
          currTable.push(row)
        }

        return acc
      }, [[rowStarts[0]]])

      return tables.map(rowStarts => {
        const tableStart = rowStarts[0]
        const tableEnd = rowStarts[rowStarts.length - 1]

        const colStarts = HLines
          .filter(fill => tableStart - 0.1 < fill.y && fill.y < tableEnd + commonHeight * 1.5)
          .map(fill => fill.x)
          .filter((e, i, a) => a.indexOf(e) === i)
          .sort((a, b) => a - b)

        const tableData = []

        page.Texts.forEach(text => {
          if (text.y < tableStart - commonHeight * 2 || text.y > tableEnd + commonHeight * 1.5) return

          let textContent = decodeURIComponent(text.R[0].T)

          let currentRow = text.y < tableStart - commonHeight ? 0 : rowStarts.findIndex(r => r > text.y + 0.3)
          if (currentRow < 0) currentRow = rowStarts.length

          let currentCol = colStarts.findLastIndex(c => c < text.x + 0.4)

          if (!tableData[currentRow]) tableData[currentRow] = []

          if (!tableData[currentRow][currentCol]) tableData[currentRow][currentCol] = textContent
          else tableData[currentRow][currentCol] += ` ${textContent}`
        })

        for (let y = 0; y < tableData.length; y++) {
          if (!tableData[y]) tableData[y] = []
          for (let x = 0; x < tableData[y].length; x++) {
            if (!tableData[y][x]) tableData[y][x] = ''
          }
        }

        // Remove empty rows
        for (let y = tableData.length - 1; y > 0; y--) {
          if (tableData[y].length === 0) tableData.splice(y, 1)
        }

        const colCount = tableData[1].length
        for (let x = colCount - 1; x > 0; x--) {
          let text = tableData[0][x] || ''
          if (text.trim().match(/^cont.+$/)) {
            tableData[0][x] = ''
          } else if (text.startsWith(' ') || text.startsWith('to')) {
            tableData[0][x - 1] = (tableData[0][x - 1] + ' ' + text.trim()).replace(/cont.+/, '').trim()
            tableData[0][x] = ''
          }
        }

        for (let x = 1; x < colCount; x++) {
          if (!tableData[0][x]) tableData[0][x] = tableData[0][x - 1]
        }

        for (let x = colCount - 1; x > 0; x--) {
          let hasNonEmpty = tableData.slice(1).some(row => row[x] && row[x].length > 0)
          if (!hasNonEmpty) tableData.forEach(row => row.splice(x, 1))
        }

        return tableData
      })
    })
  }

  read() {
    return new Promise(async (resolve, reject) => {
      let pdfParser = new PDFParser()

      pdfParser.on("pdfParser_dataReady", data => {
        try {
          resolve(this.parserCallback(data))
        } catch (err) {
          reject(err)
        }
      })

      pdfParser.on("pdfParser_dataError", err => {
        reject(err)
      })

      try {
        let pdfBuffer = await fs.readFile(this.#file)
        pdfParser.parseBuffer(pdfBuffer)
      } catch (err) {
        reject(err)
      }
    })
  
  }

}