import parse5 from 'parse5'
import { map } from 'unist-util-map'
import { fromParse5 } from 'hast-util-from-parse5'

import { torchlight, Block } from '@torchlight-api/torchlight-cli'

export default function plugin (options = {}) {
  torchlight.init(options.config)

  return tree => transform(tree, options)
}

function transform (tree, options) {
  const blocks = []

  const withPlaceholders = map(tree, node => {
    if (!isBlockCode(node)) {
      return node
    }

    const block = new Block({
      language: node.lang,
      code: node.value
    })

    blocks.push(block)

    node.data = node.data ?? {}
    node.data.torchlight = block

    return node
  })

  return torchlight.highlight(blocks).then(() => {
    return map(withPlaceholders, node => {
      if (!node?.data?.torchlight) {
        return node
      }

      const block = node.data.torchlight
      const hast = fromParse5(parse5.parse(block.highlighted))

      // The fragment that is returned from the API gets wrapped in a
      // document and body, so we need to find the actual content
      // inside all of the wrappers.
      const highlighted = hast.children.pop().children.find(child => child.tagName === 'body').children

      const code = h('code', {
        className: `language-${block.language}`
      }, highlighted)

      return h('pre', {
        className: [block.classes],
        style: block.styles
      }, [code])
    })
  })
}

const h = (type, attrs = {}, children = []) => {
  return {
    type: 'element',
    tagName: type,
    data: {
      hName: type,
      hProperties: attrs,
      hChildren: children
    },
    properties: attrs,
    children
  }
}

function isBlockCode (node) {
  return node.type === 'code' || node.tagName === 'code'
}
