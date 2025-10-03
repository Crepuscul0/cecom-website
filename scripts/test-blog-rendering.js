#!/usr/bin/env node

const { markdownToHTML, isMarkdown } = require('../src/utils/markdown.ts')

// Test markdown content (similar to what's in the database)
const testMarkdown = `# SA-2023-088 - Diffie-Hellman Key allows long exponents (CVE-2022-40735)

## Resumen de la Vulnerabilidad

Long exponents are permitted under the Diffie-Hellman Key Agreement Protocol, making some calculations needlessly expensive.

### Información de la Vulnerabilidad

- **CVE ID:** CVE-2022-40735
- **Security Advisory:** SA-2023-088
- **Fecha de Publicación:** 29/7/2025

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](https://example.com).*`

async function test() {
  console.log('�� Testing Markdown to HTML Conversion\n')
  console.log('=' .repeat(50))
  
  // Test 1: Detect markdown
  console.log('\n✅ Test 1: Detect Markdown')
  console.log('Is Markdown?', isMarkdown(testMarkdown))
  
  // Test 2: Convert to HTML
  console.log('\n✅ Test 2: Convert to HTML')
  const html = await markdownToHTML(testMarkdown)
  console.log('HTML Output (first 300 chars):')
  console.log(html.substring(0, 300))
  console.log('...\n')
  
  // Test 3: Detect HTML
  console.log('✅ Test 3: Detect HTML')
  console.log('Is Markdown?', isMarkdown(html))
  console.log('(Should be false)')
  
  // Test 4: HTML passthrough
  console.log('\n✅ Test 4: HTML Passthrough')
  const html2 = await markdownToHTML(html)
  console.log('Same content?', html === html2)
  console.log('(Should be true - HTML should pass through unchanged)')
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ All tests completed!')
}

test().catch(console.error)
