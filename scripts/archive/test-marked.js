const { marked } = require('marked')

const markdown = `# SA-2023-088 - Test Title

## Resumen de la Vulnerabilidad

This is a test paragraph with **bold** and *italic* text.

### Información de la Vulnerabilidad

- **CVE ID:** CVE-2022-40735
- **Security Advisory:** SA-2023-088

---

*Para más detalles técnicos, consulte el [aviso oficial](https://example.com).*`

async function test() {
  const html = await marked(markdown)
  console.log('Markdown input:')
  console.log(markdown)
  console.log('\n' + '='.repeat(50) + '\n')
  console.log('HTML output:')
  console.log(html)
}

test()
