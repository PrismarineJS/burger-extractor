
// Entity metadata extractor

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const fetch = require('node-fetch')

async function getMappingUrlForVersion(version) {
  const versionManifestResponse = await fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json')
  const versionManifest = await versionManifestResponse.json()
  const versionPackageResponse = await fetch(versionManifest.versions.find(versionItem => versionItem.id === version).url)
  const versionPackage = await versionPackageResponse.json()
  return versionPackage.downloads.client_mappings?.url
}


async function getObfuscationMap(version) {
  const mappingsUrl = await getMappingUrlForVersion(version)
  if (!mappingsUrl) return
  const obfuscationMap = {}
  const response = await fetch(mappingsUrl)
  const mappingsText = await response.text()
  let currentClass = null
  for (const line of mappingsText.split('\n')) {
    if (line.startsWith('#')) {
      // it's a comment, ignore this
    // field mapping
    } else if (line.startsWith('    ')) {
      const [ mojangFullName, obfuscatedName ] = line.slice(4).split(' -> ')

      // if it's a method parse it differently
      if (mojangFullName.includes('(')) {
        const mojangName = mojangFullName.split(' ').pop()
        // kinda cheaty but we only ever care about methods with no arguments
        if (mojangFullName.endsWith('()'))
          obfuscationMap[currentClass].methods[obfuscatedName] = mojangName
      } else {
        // get something like "DATA_FLAGS_ID" instead of "net.minecraft.network.syncher.EntityDataAccessor DATA_FLAGS_ID"
        const mojangName = mojangFullName.split(' ').pop()
        obfuscationMap[currentClass].fields[obfuscatedName] = mojangName
      }
    // class mapping
    } else if (line.endsWith(':') && line.includes(' -> ')) {
      const [ mojangFullName, obfuscatedName ] = line.slice(0, -1).split(' -> ')

      // remove the trailing $ sign from the obfuscated name
      const cleanerObfuscatedName = obfuscatedName.replace(/\$$/g, '')

      // get something like "Bee" instead of "net.minecraft.world.entity.animal.Bee"
      const mojangName = mojangFullName.split('.').pop()

      obfuscationMap[cleanerObfuscatedName] = {
        name: mojangName,
        fields: {},
        methods: {}
      }

      // remember the current class so the fields can set to obfuscationMap[currentClass].fields
      currentClass = cleanerObfuscatedName
    }
  }
  return obfuscationMap
}


function getEntityParent(entities, entityName) {
  const entityMetadata = entities[entityName].metadata
  const firstMetadata = entityMetadata[0]
  if (firstMetadata.entity)
    return firstMetadata.entity
}

function getEntityMetadata(entities, entityName) {
  const entityMetadata = entities[entityName].metadata
  const entityUsefulMetadata = []
  for (const metadataItem of entityMetadata) {
    if (metadataItem.data) {
      for (const metadataAttribute of metadataItem.data)
        entityUsefulMetadata.push({
          key: metadataAttribute.index,
          type: metadataAttribute.serializer_id,
        })
    }
  }
  return entityUsefulMetadata
}

function prettifyMojangField(mojangName) {
  // mojang names are like "DATA_AIR_SUPPLY_ID" and thats ugly
  let betterName = mojangName
  if (betterName.startsWith('DATA_')) {
    betterName = betterName.slice(5)
  }

  // remove the weird "Id" from the end of names
  if (betterName.endsWith('_ID'))
    betterName = betterName.slice(0, -3)
  // remove the weird "id" from the front of names
  if (betterName.startsWith('ID_'))
    betterName = betterName.slice(3)

  // convert snake case to camel case
  betterName = betterName.toLowerCase().replace(
    /(_[a-z])/g,
    (group) => group.toUpperCase()
      .replace('_', '')
  )
  return betterName.trim()
}

function prettifyMojangMethod(mojangName) {
  let betterName = mojangName
  if (betterName.endsWith('()'))
    betterName = betterName.slice(0, -2)
  return betterName
}

function getEntityMetadataNames(entities, entityName, obfuscationMap) {
  const entityMetadata = entities[entityName].metadata
  const mappedMetadataNames = {}
  for (const metadataItem of entityMetadata) {
    if (metadataItem.data) {
      const obfuscatedClass = metadataItem.class

      // the bitfield is always either named "flags" or is the first byte, hopefully mojang doesn't change this
      let bitfieldIndex = null

      // search for the attribute named "flags"
      for (const metadataAttribute of metadataItem.data) {
        const obfuscatedField = metadataAttribute.field
        const mojangField = obfuscationMap[obfuscatedClass].fields[obfuscatedField]
        let prettyMojangName = prettifyMojangField(mojangField)
        mappedMetadataNames[metadataAttribute.index] = prettyMojangName
        if (prettyMojangName === 'flags')
          bitfieldIndex = metadataAttribute.index
      }

      if (bitfieldIndex === null) {
        // since there's no attribute named flags, just get the index of the first byte since it's probably the bitfield
        for (const metadataAttribute of metadataItem.data) {
          if (metadataAttribute.serializer === 'Byte') {
            bitfieldIndex = metadataAttribute.index
            break
          }
        }
      }

      if (metadataItem.bitfields && bitfieldIndex !== null) {
        let cleanBitfield = {}
        for (const bitfieldItem of metadataItem.bitfields) {
          const mojangBitfieldItemName = obfuscationMap[bitfieldItem.class ?? obfuscatedClass].methods[bitfieldItem.method]
          if (!mojangBitfieldItemName) {
            console.log(`${obfuscatedClass} ${bitfieldItem.method} not found in obfuscation map`, obfuscationMap[obfuscatedClass].methods)
            continue
          }
          const bitfieldItemName = prettifyMojangMethod(mojangBitfieldItemName)
          const bitfieldHexValue = '0x' + bitfieldItem.mask.toString(16)
          cleanBitfield[bitfieldHexValue] = bitfieldItemName
        }

        // mojang made the player bitfield annoying to get so it's just hardcoded here until mojang changes it
        if (Object.keys(cleanBitfield).length === 0 && entityName === 'player') {
          cleanBitfield = {
            '0x01': 'capeEnabled',
            '0x02': 'jacketEnabled',
            '0x04': 'leftSleeveEnabled',
            '0x08': 'rightSleeveEnabled',
            '0x10': 'leftPantsEnabled',
            '0x20': 'rightPantsEnabled',
            '0x40': 'hatEnabled'
          }
        }
        mappedMetadataNames[bitfieldIndex] = cleanBitfield
      }


    }
  }
  return mappedMetadataNames
}


module.exports = ({ entities, version }, outputDirectory) => new Promise(async (resolve, reject) => {
  console.log(chalk.green('    Extracting entity metadata'))

  const obfuscationMap = await getObfuscationMap(version.id)
  if (!obfuscationMap) {
    console.log('Could not get obfuscation map for this version')
    return resolve()
  }

  const extracted = {}

  // Extract data
  for (const entityName in entities.entity) {
    const entityParent = getEntityParent(entities.entity, entityName)
    const entityMetadata = getEntityMetadata(entities.entity, entityName)
    const entityMetadataNames = getEntityMetadataNames(entities.entity, entityName, obfuscationMap)
    extracted[entityName] = {
      parent: entityParent,
      metadata: entityMetadata.map(({ key, type }) => ({
        metadata: entityMetadataNames[key],
        key,
        type
      }))
    }
  }

  try {
    fs.writeFileSync(path.join(outputDirectory, 'entitymetadata.json'), JSON.stringify(extracted, null, 2))
    resolve()
  } catch (e) {
    reject(e)
  }
})
