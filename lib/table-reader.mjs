import PDFParser from 'pdf2json'
import fs from 'fs/promises'

export default class TableReader {

  #file

  constructor(file) {
    this.#file = file
  }

  parserCallback(data) {
    // PDF's contain pages and each page contains Texts. These texts have an x and y value.
    // So finding Texts with equal y values seems like the solution.
    // However, some y values are off by 0.010 pixels/points so let's first find what the smallest y value could be.

    // Let's find Texts with the same x value and look for the smallest y distance of these Texts (on the same page of course)
    // Then use those smallest y values (per page) to find Texts that seem to be on the same row
    // If no smallest y value (per page) can be found, use 0 as smallest distance.


    // now lets find Texts with 'the same' y-values, Actually y-values in the range of y-smallestYValue and y+smallestYValue:

    let pages = data.Pages.map(page => {
      let fills = page.Fills
      let colStarts = fills.filter(fill => {
        return fill.h > fill.w
      }).map(fill => fill.x).filter((e, i, a) => a.indexOf(e) === i).sort((a, b) => a - b)

      let rowStarts = fills.filter(fill => {
        return fill.h < fill.w
      }).map(fill => fill.y).filter((e, i, a) => a.indexOf(e) === i).sort((a, b) => a - b)

      let pageData = []
      let smallTable = rowStarts.length === 2

      page.Texts.forEach(text => {
        let textContent = decodeURIComponent(text.R[0].T)
        if (textContent.match(/^(Effective|As at|Replaces)/)) return

        let firstYGreater = rowStarts.find(r => r > text.y + 0.3)
        let difference = firstYGreater - text.y
        let currentRow = rowStarts.indexOf(firstYGreater) - 1
        if (!smallTable && difference > 0.6) currentRow--
        if (currentRow < 0) return

        let currentCol = colStarts.findIndex(c => c > text.x + 0.4) - 1

        if (!pageData[currentRow]) pageData[currentRow] = []

        if (!pageData[currentRow][currentCol]) pageData[currentRow][currentCol] = textContent
        else pageData[currentRow][currentCol] += ` ${textContent}`
      })

      for (let y = 0; y < pageData.length; y++) {
        if (!pageData[y]) pageData[y] = []
        for (let x = 0; x < pageData[y].length; x++) {
          if (!pageData[y][x]) pageData[y][x] = ''
        }
      }
      return pageData
    })

    return pages.map(page => {
      let maxSize = Math.max(...page.map(row => row.length))
      let blankCells = Array(maxSize).fill('')

      return page.map(row => row.map(g => g.replace(/  +/g, ' ').trim()).concat(blankCells).slice(0, maxSize))
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