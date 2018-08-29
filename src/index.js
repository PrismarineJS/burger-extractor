
// Import modules

const fs = require('fs')
const path = require('path')

// Import extractors

const extractors = [
  require('./extractors/biomes'),
  require('./extractors/blocks'),
  require('./extractors/entities'),
  require('./extractors/items'),
  require('./extractors/recipes')
]

// Read burger file

const burferFile = process.argv[2]

if (!burferFile) {
  console.error(' > Usage: node src/index burger.json')
  process.exit()
}

const data = require(path.join(__dirname, '..', burferFile))[0]

// Run extractor

const outputDirectory = path.join(__dirname, '..', 'out')

if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory)
  console.log(' > Created output directory')
}

Promise.all([
  extractors.map(extractor => {
    return extractor(data, outputDirectory)
  })
]).then(() => {
  console.log(' > Data extracted')
}).catch(err => {
  console.log(` > Error extracting data ${err.toSring()}`)
  console.log(err)
})
