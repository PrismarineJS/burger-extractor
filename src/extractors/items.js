
// Block extractor

const fs = require('fs')
const path = require('path')

module.exports = ({ items }, outputDirectory) => new Promise((resolve, reject) => {
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
