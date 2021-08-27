import torchlight from '../index'
import { remark } from 'remark'
import html from 'remark-html'
import {mockApi} from '@torchlight-api/torchlight-cli/tests/support/helpers'

process.env.TORCHLIGHT_TOKEN = 'test'

test('it tests', async () => {

  const markdown = `this _is_ [test](https://www.google.com)
\`\`\`js
// hello
\`\`\`
`

  const mock = mockApi(data => {
    expect(data.blocks).toHaveLength(1)

    const block = data.blocks[0]

    expect(block.code).toEqual('// hello')
    expect(block.language).toEqual('js')

    return [{
      ...block,
      highlighted: 'highlighted',
      classes: 'classes',
      styles: 'style: 1;'
    }]
  })

  const result = await remark()
    .use(html)
    .use(torchlight)
    .process(markdown)

  expect(result.toString()).toMatchSnapshot()
  expect(mock).toHaveBeenCalledTimes(1);

})