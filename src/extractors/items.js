
// Block extractor

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

module.exports = ({ items }, outputDirectory) => new Promise((resolve, reject) => {
  console.log(chalk.green('    Extracing item data'))
  const extracted = []

  // Extract data
  for (let name in items.item) {
    const item = items.item[name]

    const itemData = {
      id: item.numeric_id,
      textId: item.text_id,
      displayName: item.display_name,
      name: item.text_id,
      stackSize: item.max_stack_size
    }

    extracted.push(itemData)
  }

  // Sort data
  extracted.sort((a, b) => (a.id - b.id))

  try {
    fs.writeFileSync(path.join(outputDirectory, 'items.json'), JSON.stringify(extracted, null, 2))
    resolve()
  } catch (e) {
    reject(e)
  }
})
