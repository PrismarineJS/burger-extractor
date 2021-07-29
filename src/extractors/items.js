
// Item extractor

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

function toTitle(str) {
  return str.split('_').map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1)
  }).join(' ')
}

module.exports = ({ items }, outputDirectory) => new Promise((resolve, reject) => {
  console.log(chalk.green('    Extracting item data'))
  const extracted = []

  // Extract data
  for (const name in items.item) {
    const item = items.item[name]

    if (item.text_id === 'air')
      continue


    const itemData = {
      id: item.numeric_id,
      displayName: item?.display_name ?? toTitle(item.text_id),
      name: item.text_id,
      stackSize: item.max_stack_size
    }

    // Manual fixes
    switch (itemData.name) {
      case 'brown_mushroom':
      case 'red_mushroom':
      case 'stone_button':
      case 'wooden_button':
      case 'brown_mushroom_block':
      case 'red_mushroom_block':
      case 'end_portal_frame':
      case 'spawn_egg':
      case 'monster_egg':
        itemData.displayName = toTitle(itemData.name)
        break
      case 'stone_slab2':
        itemData.displayName = 'Red Sandstone Slab'
        break
      case 'double_plant':
        itemData.displayName = 'Large Flowers'
        break
      case 'yellow_flower':
        itemData.displayName = 'Dandelion'
        break
      case 'red_flower':
        itemData.displayName = 'Poppy'
        break
      case 'record_13':
      case 'music_disc_13':
        itemData.displayName = '13 Disc'
        break
      case 'record_cat':
      case 'music_disc_cat':
        itemData.displayName = 'Cat Disc'
        break
      case 'record_blocks':
      case 'music_disc_blocks':
        itemData.displayName = 'Blocks Disc'
        break
      case 'record_chirp':
      case 'music_disc_chirp':
        itemData.displayName = 'Chirp Disc'
        break
      case 'record_far':
      case 'music_disc_far':
        itemData.displayName = 'Far Disc'
        break
      case 'record_mall':
      case 'music_disc_mall':
        itemData.displayName = 'Mall Disc'
        break
      case 'record_mellohi':
      case 'music_disc_mellohi':
        itemData.displayName = 'Mellohi Disc'
        break
      case 'record_stal':
      case 'music_disc_stal':
        itemData.displayName = 'Stal Disc'
        break
      case 'record_strad':
      case 'music_disc_strad':
        itemData.displayName = 'Strad Disc'
        break
      case 'record_ward':
      case 'music_disc_ward':
        itemData.displayName = 'Ward Disc'
        break
      case 'record_11':
      case 'music_disc_11':
        itemData.displayName = '11 Disc'
        break
      case 'record_wait':
      case 'music_disc_wait':
        itemData.displayName = 'Wait Disc'
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
