import util from 'util'
import NSPPDFReader from './lib/nsp-pdf-reader.mjs'

let nspReader = new NSPPDFReader(process.argv[2])
await nspReader.read()
console.log(util.inspect(nspReader.getAllRuns(), { depth: null, colors: true, maxArrayLength: null }))
