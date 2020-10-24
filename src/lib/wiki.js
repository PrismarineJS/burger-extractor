const WikiTextParser = require('parse-wikitext')
const wikiTextParser = new WikiTextParser('minecraft.gamepedia.com')

const wikitypeToBoundingBox = {
  'solid block': 'block',
  'non-solid block': 'empty',
  plant: 'empty',
  fluid: 'empty',
  'non-solid': 'empty',
  technical: 'block',
  solid: ' block',
  'ingredient<br>block': 'block',
  'nonsolid block': 'empty',
  'block entity': 'block',
  item: 'empty',
  foodstuff: 'empty',
  'tile entity': 'block',
  tool: 'empty',
  food: 'empty',
  'semi-solid': 'block',
  'light-emitting block': 'block',
  plants: 'empty',
  block: 'block',
  'non-solid; plant': 'empty',
  'wearable items; solid block': 'block',
  'solid, plants': 'block',
  'non-solid; plants': 'empty'
}

async function getBlockInfo (block) {
  return new Promise((resolve, reject) => {
    wikiTextParser.getArticle(block, (err, data) => {
      if (err) return reject(err)

      const sectionObject = wikiTextParser.pageToSectionObject(data)
      const infoBox = wikiTextParser.parseInfoBox(sectionObject.content)

      // Get filter light
      let filterLight = 15
      if (infoBox.values.transparent && infoBox.values.transparent.toLowerCase() !== 'no') {
        const t = infoBox.values.transparent.toLowerCase()
        if (t === 'yes') filterLight = 0
        if (t === 'partial <small>(blocks light)</small>') filterLight = 15
        if (t === 'partial <small>(-2 to light)</small>') filterLight = 2
        if (t === 'partial <small>(diffuses sky light)</small>') filterLight = 0
        if (t === "partial <small>(doesn't block light)</small>") filterLight = 0
        if (t === 'partial <sub>(when active)</sub>') filterLight = 0
        if (t === 'opaque, but lets light pass through') filterLight = 0
      }

      // Get emit light
      let emitLight = 0
      if (infoBox.values.light && infoBox.values.light.toLowerCase() !== 'no') {
        const n = parseInt(infoBox.values.light.split(',')[1])
        if (!isNaN(n) && n !== null) emitLight = n
      }

      resolve({
        material: getMaterial(infoBox.values.tool),
        harvestTools: toolToHarvestTools(infoBox.values.tool),
        stackSize: parseStackable(infoBox.values.stackable),
        transparent: infoBox.values.transparent !== 'No',
        filterLight: filterLight,
        emitLight: emitLight,
        boundingBox: infoBox.values.type ? wikitypeToBoundingBox[infoBox.values.type.trim().toLowerCase()] : 'block'
      })
    })
  })
}

// Copy pasted from the Prismarine minecraft-wiki-extractor. Not sure how it works, don't really care. It's just messy code, good luck trying to read this
const toolMaterials = ['wooden', 'golden', 'stone', 'iron', 'diamond']
function toolToHarvestTools (tool) {
  if (!tool) return

  tool = tool.toLowerCase().trim()

  if (['any', 'n/a', 'all', 'none', 'bucket'].indexOf(tool) !== -1) return

  if (['axe', 'shovel', 'pickaxe', 'spade', 'sword', 'shears'].indexOf(tool) !== -1) return

  if ([
    'axe', 'shovel', 'shears', 'spade',
    'pickaxe', 'wooden pickaxe', 'iron pickaxe', 'stone pickaxe', 'diamond pickaxe',
    'bucket', 'sword', 'wooden shovel'
  ].indexOf(tool) === -1) {
    console.log(`Missing tool ${tool}`) // this shouldn't happen
    return
  }

  const harvestTools = []

  if (tool === 'sword') tool = 'wooden sword' // for cobweb
  else if (tool === 'shears') harvestTools.push('shears')
  else {
    const parts = tool.split(' ')
    const material = parts[0]
    const toolName = parts[1]
    let adding = false
    toolMaterials.forEach((toolMaterial) => {
      if (toolMaterial === material) adding = true
      if (adding) harvestTools.push(`${toolMaterial}_${toolName}`)
    })
  }

  return harvestTools.reduce((acc, harvestTool) => {
    acc[harvestTool] = true
    return acc
  }, {})
}

function getMaterial (tool) {
  if (!tool) return
  if (tool === 'N/A') return
  if (tool === 'any' || tool === 'Any') return

  if (tool === 'shears') return 'plant'
  if (tool === 'Wooden pickaxe') return 'rock'
  if (tool === 'pickaxe' || tool === 'Pickaxe') return 'rock'

  console.log('Unknown material for tool:', tool)
  return 'UNKNOWN_MATERIAL'
}

function parseStackable (stackable) {
  if (stackable === undefined) return 0
  if (stackable.indexOf('N/A') > -1) return 0
  if (stackable.indexOf('No') > -1) return 1

  const regex = /Yes[,]? \(([0-9]+)\)/gm
  const match = regex.exec(stackable)

  if (match) return parseInt(match[1])
}

module.exports = {
  getBlockInfo
}
