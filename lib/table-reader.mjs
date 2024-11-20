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

      let rows = [] // store Texts and their x positions in rows

      page.Texts.forEach(text => {
        let textContent = decodeURIComponent(text.R[0].T)

        let firstYGreater = rowStarts.find(r => r > text.y + 0.1)
        let difference = firstYGreater - text.y
        let currentRow = rowStarts.indexOf(firstYGreater) - 1
        if (difference > 0.6) currentRow--
        if (currentRow < 0) return

        let currentCol = colStarts.findIndex(c => c > text.x + 0.4) - 1

        if (!rows[currentRow]) rows[currentRow] = []

        if (!rows[currentRow][currentCol]) {
          rows[currentRow][currentCol] = textContent
        } else {
          rows[currentRow][currentCol] += ` ${textContent}`
        }
      })

      for (var i = 0; i < rows.length; i++) {
        if (!rows[i]) rows[i] = []
        for (let j = 0; j < rows[i].length; j++) {
          if (!rows[i][j]) rows[i][j] = ''
        }
      }
      return rows
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

      // adding try/catch/printstack 'cause pdfParser seems to prevent errors from bubbing up (weird implementation).
      // It also doesn't seem to implement the callback(err, otherdata) convention used in most Node.js modules, so let's fix that here.
      pdfParser.on("pdfParser_dataReady", data => {
        try {
          resolve(this.parserCallback(data))
        } catch (err) {
          console.log(err.stack)
        }
      })
    
      pdfParser.on("pdfParser_dataError", err => {
        reject(err)
      })

      let pdfBuffer = await fs.readFile(this.#file)
      pdfParser.parseBuffer(pdfBuffer)
    })
  
  }

}