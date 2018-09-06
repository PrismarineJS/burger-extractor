const WikiTextParser = require('parse-wikitext')
const wikiTextParser = new WikiTextParser('minecraft.gamepedia.com')

const wikitypeToBoundingBox = {
  'solid block': 'block',
  'non-solid block': 'empty',
  'plant': 'empty',
  'fluid': 'empty',
  'non-solid': 'empty',
  'technical': 'block',
  'solid': ' block',
  'ingredient<br>block': 'block',
  'nonsolid block': 'empty',
  'block entity': ' block',
  'item': 'empty',
  'foodstuff': 'empty',
  'tile entity': 'block',
  'tool': 'empty',
  'food': 'empty',
  'semi-solid': 'block',
  'light-emitting block': 'block',
  'plants': 'empty',
  'block': 'block',
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
      const infoBox = wikiTextParser.parseInfoBox(sectionObject['content'])

      // Get filter light
      let filterLight = 15
      if (infoBox.values.transparent && infoBox.values.transparent.toLowerCase() !== 'no') {
        let t = infoBox.values.transparent.toLowerCase()
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
        let n = parseInt(infoBox.values.light.split(',')[1])
        if (!isNaN(n) && n !== null) emitLight = n
      }

      resolve({
        transparent: infoBox.values.transparent !== 'No',
        filterLight: filterLight,
        emitLight: emitLight,
        boundingBox: infoBox.values.type ? wikitypeToBoundingBox[infoBox.values.type.trim().toLowerCase()] : 'block'
      })
    })
  })
}

module.exports = {
  getBlockInfo
}
