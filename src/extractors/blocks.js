/*
    Block extractor

    This script does not extract the following data: emitLight, filterLight, boundingBox, stackSize and transparent
*/

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const blockParents = require('../patches/block_properties.json')

function jsUcfirst (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

module.exports = ({ blocks, items }, outputDirectory) => new Promise((resolve, reject) => {
  console.log(chalk.green('    Extracting block data'))
  const extracted = []

  function findItemByName (name) {
    const item = items.item[name]
    if (!item) console.warn(chalk.red`      Unknown item "${chalk.cyan(name)}"!`)
    return item ? item.numeric_id : null
  }

  // Extract data
  for (const name in blocks.block) {
    // For each block extracted by burger
    const block = blocks.block[name]

    // Initial block data
    const blockData = {
      id: block.numeric_id,
      displayName: block.display_name === undefined ? jsUcfirst(block.text_id.replace(/_/g, ' ')) : block.display_name,
      name: block.text_id,
      hardness: block.hardness || 0,
      resistance: block.resistance || 0,
      minStateId: block.min_state_id,
      maxStateId: block.max_state_id
    }

    // Get block states
    const states = []

    if (block.states) {
      for (const index in block.states) {
        const state = block.states[index]
        states.push({
          name: state.name,
          type: state.type,
          values: state.values,
          num_values: state.num_values
        })
      }
    }

    blockData.states = states

    // Get block drops
    const drops = []

    // Remove any `wall_` from block id (skeleton_skull item has two blocks, skeleton_skull and skeleton_wall_skull)
    const idParsed = block.text_id.replace('wall_', '')
    if (items.item[idParsed]) { // If the item exists
      drops.push(items.item[idParsed].numeric_id)
    }

    // Check if the block is a flower pot with a flower in it
    if (idParsed.startsWith('potted_')) {
      drops.push(findItemByName('flower_pot'))
      drops.push(findItemByName(idParsed.substring(7)))
    }

    // Manually check for other possible blocks
    if (!drops.length) {
      if (idParsed === 'potatoes') drops.push(findItemByName('potato'))
      if (idParsed === 'redstone_wire') drops.push(findItemByName('redstone'))
      if (idParsed === 'tripwire') drops.push(findItemByName('string'))
      if (idParsed === 'melon_stem') drops.push(findItemByName('melon_seeds'))
      if (idParsed === 'pumpkin_stem') drops.push(findItemByName('pumpkin_seeds'))
      if (idParsed === 'beetroots') drops.push(findItemByName('beetroot'))
      if (idParsed === 'carrots') drops.push(findItemByName('carrot'))
      if (idParsed === 'cocoa') drops.push(findItemByName('cocoa_beans') || findItemByName('dye')) // Cocoa beans were just dye:3 pre-flattening
      if (idParsed === 'kelp_plant') drops.push(findItemByName('kelp'))
      if (idParsed === 'tall_seagrass') drops.push(findItemByName('seagrass'))
    }

    blockData.drops = drops

    // Get block diggable

    let diggable = true

    if (block.hardness === -1.0) {
      diggable = false
      blockData.hardness = null
    }

    if (block.text_id === 'water' || block.text_id === 'lava') diggable = false

    blockData.diggable = diggable

    // Push the data
    extracted.push(blockData)
  }

  const lostProperties = ['material', 'hardness', 'resistance', 'blocksMovement', 'ticksRandomly', 'lightLevel', 'blockColors', 'soundType', 'slipperiness', 'speedFactor', 'variableOpacity', 'isSolid', 'isAir', 'requiresTool']

  extracted.forEach(entry => {
    if (Object.keys(blockParents).includes(entry.name)) {
      const parent = extracted.find(el => el.name === blockParents[entry.name])
      if (!parent) return

      lostProperties.forEach(propName => {
        if (!entry[propName] && parent[propName]) entry[propName] = parent[propName]
      })
    }
  })

  // Sort data by id
  extracted.sort((a, b) => (a.id - b.id))

  try {
    fs.writeFileSync(path.join(outputDirectory, 'blocks.json'), JSON.stringify(extracted, null, 2))
    resolve()
  } catch (e) {
    reject(e)
  }
})
