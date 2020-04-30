/*
    Entity merger

    This script tries to set entity.category from oldData
*/

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

module.exports = (outputDirectory, oldData) => new Promise(async (resolve, reject) => {
  console.log(chalk.green('    Merging entity data'))

  const entitiesPath = path.join(outputDirectory, 'entities.json')
  const entities = JSON.parse(fs.readFileSync(entitiesPath))

  for (let entity of entities) {
    if (!entity.category) {
      const oldEntity = oldData.entitiesByName[entity.name]
      if (oldEntity && oldEntity.category) {
        entity.category = oldEntity.category
      }
    }
  }

  fs.writeFileSync(entitiesPath, JSON.stringify(entities, null, 2))

  resolve()
})
