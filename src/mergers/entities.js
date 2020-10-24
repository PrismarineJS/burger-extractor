/*
    Entity merger

    This script tries to set entity.category and entity.type from oldData
*/

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

module.exports = async (outputDirectory, oldData) => {
  console.log(chalk.green('    Merging entity data'))

  const entitiesPath = path.join(outputDirectory, 'entities.json')
  const entities = JSON.parse(fs.readFileSync(entitiesPath))

  for (const entity of entities) {
    const oldEntity = oldData.entitiesByName[entity.name]
    if (oldEntity) {
      if (oldEntity.category) entity.category = oldEntity.category
      if (oldEntity.type) entity.type = oldEntity.type
    }
  }

  fs.writeFileSync(entitiesPath, JSON.stringify(entities, null, 2))
}
