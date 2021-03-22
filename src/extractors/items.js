
// Item extractor

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

module.exports = ({ items }, outputDirectory) => new Promise((resolve, reject) => {
  console.log(chalk.green('    Extracting item data'))
  const extracted = []

  // Extract data
  for (const name in items.item) {
    const item = items.item[name]

    const itemData = {
      id: item.numeric_id,
      displayName: item.display_name,
      name: item.text_id,
      stackSize: item.max_stack_size
    }

    // Manual fixes
    switch (itemData.name) {
      case 'music_disc_13':
        itemData.displayName = '13 Disc'
        break
      case 'music_disc_cat':
        itemData.displayName = 'Cat Disc'
        break
      case 'music_disc_blocks':
        itemData.displayName = 'Blocks Disc'
        break
      case 'music_disc_chirp':
        itemData.displayName = 'Chirp Disc'
        break
      case 'music_disc_far':
        itemData.displayName = 'Far Disc'
        break
      case 'music_disc_mall':
        itemData.displayName = 'Mall Disc'
        break
      case 'music_disc_mellohi':
        itemData.displayName = 'Mellohi Disc'
        break
      case 'music_disc_stal':
        itemData.displayName = 'Stal Disc'
        break
      case 'music_disc_strad':
        itemData.displayName = 'Strad Disc'
        break
      case 'music_disc_ward':
        itemData.displayName = 'Ward Disc'
        break
      case 'music_disc_11':
        itemData.displayName = '11 Disc'
        break
      case 'music_disc_wait':
        itemData.displayName = 'Wait Disc'
        break
      case 'air':
        itemData.stackSize = 0
        break
      case 'bow':
      case 'carrot_on_a_stick':
      case 'elytra':
      case 'fishing_rod':
      case 'flint_and_steel':
      case 'shears':
      case 'shield':
      case 'trident':
        itemData.stackSize = 1
        break
      default: {
        const len = itemData.name.length
        if (itemData.name.substr(len - 7) === '_helmet' || itemData.name.substr(len - 11) === '_chestplate' || itemData.name.substr(len - 9) === '_leggings' || itemData.name.substr(len - 6) === '_boots' || itemData.name.substr(len - 4) === '_axe' || itemData.name.substr(len - 4) === '_hoe' || itemData.name.substr(len - 8) === '_pickaxe' || itemData.name.substr(len - 7) === '_shovel' || itemData.name.substr(len - 6) === '_sword') {
          itemData.stackSize = 1
        }
      }
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
