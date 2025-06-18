import util from 'util'
import NSPPDFReader from './lib/nsp-pdf-reader.mjs'
import TableReader from './lib/table-reader.mjs'

// let nspReader = new NSPPDFReader(process.argv[2])
// await nspReader.read()
// console.log(util.inspect(nspReader.getAllRuns(), { depth: null, colors: true, maxArrayLength: null }))

let tableReader = new TableReader(process.argv[2])
let pages = await tableReader.read()

for (let page of pages) console.table(page)