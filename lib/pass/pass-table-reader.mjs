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
          if (text.y < tableStart - commonHeight || text.y > tableEnd + commonHeight * 1.5) return

          let textContent = decodeURIComponent(text.R[0].T)

          let currentRow = rowStarts.findIndex(r => r > text.y + 0.3) - 1
          if (currentRow < 0) currentRow = rowStarts.length - 1

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

        return tableData
      })

      console.log(tables)

      console.log(heightFrequency)
      console.log(VLines)
      console.log(rowStarts)

      let pageData = []
      let smallTable = rowStarts.length === 2

      return pageData
    })

    return pages[0]

    // return pages.map(page => {
    //   let maxSize = Math.max(...page.map(row => row.length))
    //   let blankCells = Array(maxSize).fill('')

    //   return page.map(row => row.map(g => g.replace(/  +/g, ' ').trim()).concat(blankCells).slice(0, maxSize))
    // })
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