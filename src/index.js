
// Import modules

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

// Import extractors

const extractors = [
  require('./extractors/biomes'),
  require('./extractors/blocks'),
  require('./extractors/entities'),
  require('./extractors/items'),
  require('./extractors/recipes'),
  require('./extractors/particles')
]

// Import mergers

const mergers = [
  require('./mergers/blocks'),
  require('./mergers/entities')
]

// Check arguments

const burferFile = process.argv[2]
const oldVersion = process.argv[3]

if (!burferFile || !oldVersion) {
  console.error(' > Usage: node src/index <burger.json> <old version>')
  console.error(' > Example: node src/index burger.json 1.12')
  process.exit()
}

console.log(chalk.yellow('\n > Make sure to have the latest version of minecraft-data installed'))

const oldData = require('minecraft-data')(oldVersion)
if (!oldData) {
  console.error(chalk.red(`No minecraft-data found for version ${oldVersion}`))
  process.exit()
}

// Read burger file

const data = require(path.join(__dirname, '..', burferFile))[0]

// Create output directory

const outputDirectory = path.join(__dirname, '..', 'out')

if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory)
  console.log(' > Created output directory')
}

// Define extraction function

const run = async () => {
  // Run extractors
  console.log(chalk.green('\n  Data extraction started'))
  const date = Date.now()
  await Promise.all(extractors.map(extractor => extractor(data, outputDirectory)))
  console.log(chalk.green(`  Data extracted in ${chalk.yellow(`${Date.now() - date}ms`)}`))

  // Merge with old data
  console.log(chalk.green('\n  Data merge started'))
  const date2 = Date.now()
  await Promise.all(mergers.map(merge => merge(outputDirectory, oldData)))
  console.log(chalk.green(`  Data merged in ${chalk.yellow(`${(Date.now() - date2) / 1000}s`)}`))

  // TODO: Run the mcdata tests on the files to check that they're ok
}

// Execute data extraction

run().then(() => {
  console.log(chalk.yellow('\n > Extraction completed.\n'))
}).catch(err => {
  console.log(chalk.red(` > Error extracting data ${err.toString()}`))
  console.log(err)
  process.exit()
})
