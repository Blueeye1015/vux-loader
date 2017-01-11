'use strict'

const path = require('path')
const utils = require('loader-utils')

module.exports = function (source) {
  this.cacheable()
  const config = utils.getLoaderConfig(this, "vux")
  if (!config.plugins || !config.plugins.length) {
    return source
  }

  if (config.plugins.length) {
    config.plugins.forEach(function (plugin) {
      // script-parser
      if (plugin.name === 'script-parser') {
        if (plugin.fn) {
          source = plugin.fn.call(plugin.fn, source)
        }
      }
    })
  }

  // const maps = utils.getLoaderConfig(this, "vuxMaps")
  const vuxConfig = utils.getLoaderConfig(this, "vux")
  const mapPath = path.resolve(vuxConfig.options.projectRoot, 'node_modules/vux/src/components/map.json')
  const maps = require(mapPath)

  if (config.options.useVuxUI && /}\s+from(.*?)'vux/.test(source)) {
    const parser = require('./libs/import-parser')
    source = parser(source, function (opts) {
      let str = ''
      opts.components.forEach(function (component) {
        str += `import ${component.newName} from 'vux/${maps[component.originalName]}'\n`
      })
      return str
    }, 'vux')
  }

  return source
}

function camelCaseToDash(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}