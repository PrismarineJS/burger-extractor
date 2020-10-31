/*
    Block merger

    This script will try to find missing block data from the old mcdata blocks
*/

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const wiki = require('../lib/wiki')

const colors = [
  'white',
  'orange',
  'magenta',
  'light_blue',
  'yellow',
  'lime',
  'pink',
  'gray',
  'light_gray',
  'cyan',
  'purple',
  'blue',
  'brown',
  'green',
  'red',
  'black'
]

const woodTypes = [
  'jungle',
  'oak',
  'dark_oak',
  'birch',
  'spruce',
  'acacia',
  'stripped_jungle',
  'stripped_oak',
  'stripped_dark_oak',
  'stripped_birch',
  'stripped_spruce',
  'stripped_acacia'
]

module.exports = async (outputDirectory, oldData) => {
  console.log(chalk.green('    Merging block data'))
  // Read required files
  const blocksPath = path.join(outputDirectory, 'blocks.json')
  const blocks = JSON.parse(fs.readFileSync(blocksPath))
  const itemsPath = path.join(outputDirectory, 'items.json')
  const items = JSON.parse(fs.readFileSync(itemsPath))

  function getItemIdFromName (name) {
    const found = items.filter(item => item.name === name)
    if (found && found.length) return found[0].id
    return null
  }

  function oldIdtoNewId (id) {
    const oldItem = Object.values(oldData.items).filter(item => item.id === id)

    if (!oldItem.length) {
      console.log(chalk.red(`Can't find old item with id: ${id}`))
      return null
    }

    const newItem = items.filter(item => item.name === oldItem[0].name)

    if (!newItem.length) {
      console.log(chalk.red(`Can't find new item with name: ${oldItem[0].name}`))
      return null
    }

    return newItem[0].id
  }

  function convertHarvestTools (harvestTools) {
    if (!harvestTools) return

    const newHarvestTools = {}

    Object.keys(harvestTools).forEach(key => {
      newHarvestTools[oldIdtoNewId(parseInt(key))] = true
    })

    return newHarvestTools
  }

  // Loop for each block
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]

    // Find the same block in the old version data
    const [oldBlock] = Object.values(oldData.blocks).filter(oldBlock => oldBlock.name === block.name)

    if (oldBlock) {
      console.log(chalk.yellow(`      Merged ${chalk.cyan(block.name)} with ${chalk.blue(oldBlock.name)} (Same block name)`))

      // Merge values
      block.transparent = oldBlock.transparent
      block.filterLight = oldBlock.filterLight
      block.emitLight = oldBlock.emitLight
      block.boundingBox = oldBlock.boundingBox
      block.stackSize = oldBlock.stackSize
      block.material = oldBlock.material
      block.harvestTools = convertHarvestTools(oldBlock.harvestTools)
      continue
    }

    /*
     Most of the following code will only be executed with new blocks or 1.12 to 1.13 merges
    */

    // Check if the block is a colored variant of an old block
    if (colors.some(color => block.name.startsWith(color))) {
      // Get block name without the color prefix and the following underscore
      const name = block.name.replace(new RegExp(colors.join('|')), '').substr(1)

      // Filter false positives
      if (!['nether_bricks', 'sandstone_slab', 'tone_wall_torch', 'ice'].includes(name)) {
        // Find if there's a block in the old data with the same name (red_wool -> wool, yellow_terracotta -> terracotta)
        const [oldBlock] = Object.values(oldData.blocks).filter(oldBlock => {
          if (name === 'banner') return oldBlock.name === 'standing_banner'
          if (name === 'terracotta') return oldBlock.name === 'white_glazed_terracotta'

          if ([
            'blue_orchid', 'red_tulip', 'orange_tulip', 'white_tulip', 'pink_tulip'
          ].includes(block.name)) return oldBlock.name === 'red_flower'

          return oldBlock.name === name
        })

        if (!oldBlock) {
          console.log(chalk.red(`      Could not find the old block match for ${name} (${block.name}) (Colored block check)`))
          continue
        }
        console.log(chalk.yellow(`      Merged ${chalk.cyan(block.name)} with ${chalk.blue(oldBlock.name)} (Colored block check)`))

        // Merge values
        block.displayName = oldBlock.displayName
        block.stackSize = oldBlock.stackSize
        block.transparent = oldBlock.transparent
        block.filterLight = oldBlock.filterLight
        block.emitLight = oldBlock.emitLight
        block.boundingBox = oldBlock.boundingBox
        block.material = oldBlock.material
        block.harvestTools = convertHarvestTools(oldBlock.harvestTools)
        continue
      }
    }

    // Check if the block is a wooden variant of an old block

    if (woodTypes.some(type => { return block.name.startsWith(type) })) {
      // Get block name without the wooden prefix and the following underscore
      const name = block.name.replace(new RegExp(woodTypes.join('|')), '').substr(1)

      // Find if there's a block in the old data with the same name (oak_wood -> oak_log, oak_pressure_plate -> wooden_pressure_plate)
      const [oldBlock] = Object.values(oldData.blocks).filter(oldBlock => {
        if (name === 'wood') return oldBlock.name === 'log'
        if (name === 'door') return oldBlock.name === 'wooden_door'
        if (name === 'pressure_plate') return oldBlock.name === 'wooden_pressure_plate'
        if (name === 'button') return oldBlock.name === 'wooden_button'
        if (name === 'slab') return oldBlock.name === 'stone_slab'

        return oldBlock.name === name
      })

      if (!oldBlock) {
        console.log(chalk.red(`      Could not find the old block match for ${name} (${block.name}) (Wooden block check)`))
        continue
      }

      console.log(chalk.yellow(`      Merged ${chalk.cyan(block.name)} with ${chalk.blue(oldBlock.name)} (Wooden block check)`))

      // Merge values
      block.displayName = oldBlock.displayName
      block.stackSize = oldBlock.stackSize
      block.transparent = oldBlock.transparent
      block.filterLight = oldBlock.filterLight
      block.emitLight = oldBlock.emitLight
      block.boundingBox = oldBlock.boundingBox
      block.material = oldBlock.material
      block.harvestTools = convertHarvestTools(oldBlock.harvestTools)
      continue
    }

    // Try to manually find the block in the old mcdat
    // Try and find old block
    const [oldBlockAttempt] = Object.values(oldData.blocks).filter(oldBlock => {
      if (block.name.startsWith('potted_')) return oldBlock.name === 'flower_pot'
      if (block.name.startsWith('attached_')) return oldBlock.name === 'melon_stem'
      if (block.name.endsWith('_slab')) return oldBlock.name === 'stone_slab'
      if (block.name.endsWith('_skull')) return oldBlock.name === 'skull'
      if (block.name.endsWith('_head')) return oldBlock.name === 'skull'
      if (block.name.endsWith('_stairs')) return oldBlock.name === 'stone_stairs'
      if (block.name.indexOf('stone_bricks') > -1) return oldBlock.name === 'stonebrick'

      if (block.name === 'smooth_quartz') return oldBlock.name === 'quartz_block'
      if (block.name === 'quartz_pillar') return oldBlock.name === 'quartz_block'
      if (block.name.startsWith('cut_')) return oldBlock.name === block.name.replace('cut_', '')
      if (block.name.startsWith('chiseled_')) return oldBlock.name === block.name.replace('chiseled_', '')
      if (block.name.startsWith('smooth_')) return oldBlock.name === block.name.replace('smooth_', '')
      if (block.name.startsWith('infested_')) return oldBlock.name === block.name.replace('infested_', '')
      if (block.name.startsWith('mossy_')) return oldBlock.name === block.name.replace('mossy_', '')

      if ([
        'dandelion', 'poppy', 'allium',
        'azure_bluet', 'oxeye_daisy', 'peony'
      ].includes(block.name)) return oldBlock.name === 'prismarine'

      if ([
        'large_fern', 'rose_bush', 'lilac', 'sunflower'
      ].includes(block.name)) return oldBlock.name === 'double_plant'

      if ([
        'dandelion', 'poppy', 'allium', 'azure_bluet', 'oxeye_daisy', 'blue_orchid',
        'red_tulip', 'orange_tulip', 'white_tulip', 'pink_tulip'
      ].includes(block.name)) return oldBlock.name === 'red_flower'

      if ([
        'granite', 'diorite', 'andesite',
        'polished_granite', 'polished_diorite', 'polished_andesite'
      ].includes(block.name)) return oldBlock.name === 'stone'

      if ([
        'grass_block', 'coarse_dirt', 'podzol'
      ].includes(block.name)) return oldBlock.name === 'grass'

      if (block.name === 'nether_quartz_ore') return oldBlock.name === 'quartz_ore'
      if (block.name === 'bricks') return oldBlock.name === 'brick_block'
      if (block.name === 'magma_block') return oldBlock.name === 'magma'
      if (block.name === 'red_nether_bricks') return oldBlock.name === 'red_nether_brick'
      if (block.name === 'nether_bricks') return oldBlock.name === 'nether_brick'
      if (block.name === 'wet_sponge') return oldBlock.name === 'sponge'
      if (block.name === 'cobweb') return oldBlock.name === 'web'
      if (block.name === 'spawner') return oldBlock.name === 'mob_spawner'
      if (block.name === 'redstone_wall_torch') return oldBlock.name === 'redstone_torch'
      if (block.name === 'wall_torch') return oldBlock.name === 'torch'
      if (block.name === 'carved_pumpkin') return oldBlock.name === 'pumpkin'
      if (block.name === 'jack_o_lantern') return oldBlock.name === 'lit_pumpkin'
      if (block.name === 'sugar_cane') return oldBlock.name === 'reeds'
      if (block.name === 'powered_rail') return oldBlock.name === 'golden_rail'
      if (block.name === 'nether_portal') return oldBlock.name === 'portal'
      if (block.name === 'terracotta') return oldBlock.name === 'white_glazed_terracotta'
      if (block.name === 'fern') return oldBlock.name === 'tallgrass'
      if (block.name === 'dead_bush') return oldBlock.name === 'deadbush'
      if (block.name === 'melon') return oldBlock.name === 'melon_block'
      if (block.name === 'mushroom_stem') return oldBlock.name === 'red_mushroom_block'
      if (block.name === 'sign') return oldBlock.name === 'standing_sign'
      if (block.name === 'snow_block') return oldBlock.name === 'snow'
      if (block.name === 'moving_piston') return oldBlock.name === 'piston_extension'
      if (block.name === 'repeater') return oldBlock.name === 'powered_repeater'
      if (block.name === 'comparator') return oldBlock.name === 'powered_comparator'
      if (block.name === 'lily_pad') return oldBlock.name === 'waterlily'
      if (block.name === 'dark_prismarine') return oldBlock.name === 'prismarine'
      if (block.name === 'prismarine_bricks') return oldBlock.name === 'prismarine'
      if (block.name === 'damaged_anvil') return oldBlock.name === 'anvil'
      if (block.name === 'chipped_anvil') return oldBlock.name === 'anvil'
      if (block.name === 'shulker_box') return oldBlock.name === 'white_shulker_box'
      if (block.name === 'slime_block') return oldBlock.name === 'slime'

      // Fallback to just removing the underscore and see if it works
      return oldBlock.name === block.name.replace(/[_-]/g, '')
    })

    // We couldn't find the block in the old mcdata, assume it's a new block
    if (oldBlockAttempt) {
      console.log(chalk.yellow(`      Merged ${chalk.cyan(block.name)} with ${chalk.blue(oldBlockAttempt.name)} (Manual check)`))

      // Merge values
      block.displayName = oldBlockAttempt.displayName
      block.stackSize = oldBlockAttempt.stackSize
      block.transparent = oldBlockAttempt.transparent
      block.filterLight = oldBlockAttempt.filterLight
      block.emitLight = oldBlockAttempt.emitLight
      block.boundingBox = oldBlockAttempt.boundingBox
      block.material = oldBlockAttempt.material
      block.harvestTools = convertHarvestTools(oldBlockAttempt.harvestTools)
      continue
    }

    // The block variable is now a new block. We require the user or the wiki to give us the data
    // Group the block maybe (*_coral_block, *_coal_wall_fan, *_wall_fan)

    // Get block data from wiki

    try {
      console.log(chalk.yellow(`      Extracting ${chalk.cyan(block.name)} from minecraft wiki. `))

      const blockData = await wiki.getBlockInfo(block.name.replace('wall_', '').replace('tall_', ''))

      block.transparent = blockData.transparent
      block.stackSize = blockData.stackSize
      block.filterLight = blockData.filterLight
      block.emitLight = blockData.emitLight
      block.boundingBox = blockData.boundingBox
      block.material = blockData.material
      block.harvestTools = blockData.harvestTools

      if (block.harvestTools) {
        Object.keys(block.harvestTools).forEach(key => {
          delete block.harvestTools[key]
          block.harvestTools[getItemIdFromName(key)] = true
        })
      }
    } catch (e) {
      console.log(e)
      console.log(chalk.red(`      ${e.toString()}`))
    }
  }

  fs.writeFileSync(blocksPath, JSON.stringify(blocks, null, 2))
}
