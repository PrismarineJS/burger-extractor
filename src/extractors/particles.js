// Particle extractor

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

module.exports = ({ particletypes }, outputDirectory) => new Promise((resolve, reject) => {
  console.log(chalk.green('    Extracting particles data'))
  const extracted = particletypes.map((name, id) => ({ id, name }))

  try {
    fs.writeFileSync(path.join(outputDirectory, 'particles.json'), JSON.stringify(extracted, null, 2))
    resolve()
  } catch (e) {
    reject(e)
  }
})
