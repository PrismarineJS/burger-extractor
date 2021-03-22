
// Entity extractor

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

module.exports = ({ entities }, outputDirectory) => new Promise((resolve, reject) => {
  console.log(chalk.green('    Extracting entity data'))
  const extracted = []

  // Extract data
  for (const name in entities.entity) {
    const entity = entities.entity[name]

    const entityData = {
      id: entity.id,
      internalId: entity.id,
      name: entity.name,
      displayName: entity.display_name,
      width: entity.width,
      height: entity.height,
      type: 'UNKNOWN',
      category: 'UNKNOWN'
    }
    // .type and .category are set in the entity merger

    if (entity.id === undefined) {
      continue
    }

    if (!entityData.width) {
      entityData.width = 0
      entityData.height = 0
    }

    extracted.push(entityData)
  }

  // Sort data
  extracted.sort((a, b) => (a.id - b.id))

  try {
    fs.writeFileSync(path.join(outputDirectory, 'entities.json'), JSON.stringify(extracted, null, 2))
    resolve()
  } catch (e) {
    reject(e)
  }
})
