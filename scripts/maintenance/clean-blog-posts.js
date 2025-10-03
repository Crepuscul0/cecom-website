const fs = require('fs');
const path = require('path');

// Read the current blog posts
const postsPath = path.join(__dirname, '../data/blog/posts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

// Function to clean content - remove CECOM-specific sections
function cleanContent(content) {
  // Split content into lines
  const lines = content.split('\n');
  const cleanedLines = [];
  let skipSection = false;
  
  for (const line of lines) {
    // Skip CECOM-specific sections
    if (line.includes('## Detalles Técnicos') && line.includes('Como distribuidor autorizado')) {
      skipSection = true;
      continue;
    }
    
    if (line.includes('## Recomendaciones de CECOM') || 
        line.includes('## ¿Necesita Ayuda?') ||
        line.includes('**Contacto CECOM:**')) {
      skipSection = true;
      continue;
    }
    
    // Stop skipping when we hit a new section or the end reference
    if (line.startsWith('---') || line.includes('*Para más detalles técnicos')) {
      skipSection = false;
      cleanedLines.push(line);
      continue;
    }
    
    // Skip lines that are part of CECOM sections
    if (skipSection) {
      continue;
    }
    
    // Remove CECOM-specific text from technical details
    if (line.includes('Esta vulnerabilidad ha sido identificada por Extreme Networks y afecta a productos específicos de su portafolio. Como distribuidor autorizado de Extreme Networks en República Dominicana, CECOM recomienda revisar inmediatamente si sus equipos están afectados.')) {
      continue;
    }
    
    cleanedLines.push(line);
  }
  
  return cleanedLines.join('\n').trim();
}

// Clean all posts
const cleanedPosts = posts.map(post => ({
  ...post,
  content: cleanContent(post.content)
}));

// Write back to file
fs.writeFileSync(postsPath, JSON.stringify(cleanedPosts, null, 2));

console.log(`Cleaned ${cleanedPosts.length} blog posts`);
