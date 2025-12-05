import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import { getHeatTimetables, HeatTimetableFile } from './lib/heat/vline-heat.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let heatTTFolder = path.join(__dirname, 'heat-pdfs')

let timetables = await getHeatTimetables()
let files = []

if (await fs.stat(heatTTFolder)) {
  const fileNames = await fs.readdir(heatTTFolder)
  
  for (let file of fileNames) {
    if (!file.endsWith('.pdf')) continue

    let timetableFile = HeatTimetableFile.fromFile(path.join(heatTTFolder, file))
    files.push(timetableFile)
  }
} else {
  await fs.mkdir(heatTTFolder)
  await timetables.saveFiles(heatTTFolder)
  files = timetables.files
} 

for (let file of files) {
  console.log('Reading', file)
  let runs = await file.extractRuns()
  console.log(runs)
}