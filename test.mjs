import { getNSPVersion, NSPFile } from './lib/vline-nsp.mjs'
import fs from 'fs/promises'
import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let currentVersion = { effective: 0 }
let nspFolder = path.join(__dirname, 'nsp-pdfs')
let versionFile = path.join(nspFolder, 'ver.json')
try {
  currentVersion = JSON.stringify(await fs.readFile(versionFile))
} catch (e) {}

let nspFiles

let latestVersion = { effective: 0, version: 'FP65' }
// let latestVersion = (await getNSPVersion())[0]
if (latestVersion.effective > currentVersion.effective) {
  console.log(`Updating NSP to ${latestVersion.version}`)
  if (await fs.stat(nspFolder)) await fs.rm(nspFolder, { recursive: true })
  await fs.mkdir(nspFolder)

  await latestVersion.saveFiles(nspFolder)
  currentVersion = { version: latestVersion.version, effective: +latestVersion.effective }
  await fs.writeFile(versionFile, JSON.stringify(currentVersion))

  nspFiles = latestVersion.files
} else {
  console.log('NSP up to date')
  let nspFileNames = await fs.readdir(nspFolder)
  
  nspFiles = []
  for (let file of nspFileNames) {
    if (!(file.endsWith('.pdf') && file.startsWith(latestVersion.version)) || file.includes('Central')) continue
    let nspFile = new NSPFile(file.slice(0, -4), null, latestVersion.version)
    nspFile.setFilePath(path.join(nspFolder, file))
    nspFiles.push(nspFile)
  }
}

let allRuns = {}

for (let file of nspFiles) {
  console.log('Reading', file)
  let runs = await file.extractRuns()
  for (let run of runs) {
    if (run.movementType !== 'PSNG_SRV') continue
    let runID = `${run.tdn}-${run.daysRunCode}`
    if (!allRuns[runID]) allRuns[runID] = run
  }
}

console.log(allRuns)