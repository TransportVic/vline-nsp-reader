import PassTableReader from './lib/pass/pass-table-reader.mjs'

// let nspReader = new NSPPDFReader(process.argv[2])
// await nspReader.read()
// console.log(util.inspect(nspReader.getAllRuns(), { depth: null, colors: true, maxArrayLength: null }))

let tableReader = new PassTableReader(process.argv[2])
let tables = await tableReader.read()

for (let table of tables) console.table(table)