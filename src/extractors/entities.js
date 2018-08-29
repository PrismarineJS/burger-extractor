
// Block extractor

const fs = require('fs')
const path = require('path')

module.exports = ({ entities }, outputDirectory) => new Promise((resolve, reject) => {
  const extracted = []

  // Extract data
  for (let name in entities.entity) {
    const entity = entities.entity[name]

    const entityData = {
      id: entity.id,
      internalId: entity.id,
      name: entity.name,
      displayName: entity.display_name,
      width: entity.width,
      height: entity.height,
      type: 'mob',
      category: 'Hostile mobs'
    }

    if (!entityData.width) {
      entityData.width = 0
      entityData.height = 0
    }

    // TODO: Get entity type and category. Use old version to get this data and set new data to UNKNOWN for user to manually set

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
