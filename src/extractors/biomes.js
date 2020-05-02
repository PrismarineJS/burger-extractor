
// Block extractor

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

module.exports = ({ biomes }, outputDirectory) => new Promise((resolve, reject) => {
  console.log(chalk.green('    Extracting biome data'))
  const extracted = []

  // Extract data
  for (let name in biomes.biome) {
    const biome = biomes.biome[name]

    const biomeData = {
      id: biome.id,
      name: biome.text_id,
      displayName: biome.name,
      rainfall: biome.rainfall,
      temperature: biome.temperature
    }

    // TODO: Compute biome color
    if (!biomeData.color) {

    }

    extracted.push(biomeData)
  }

  // Sort data
  extracted.sort((a, b) => (a.id - b.id))

  try {
    fs.writeFileSync(path.join(outputDirectory, 'biomes.json'), JSON.stringify(extracted, null, 2))
    resolve()
  } catch (e) {
    reject(e)
  }
})
