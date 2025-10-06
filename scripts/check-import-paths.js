const fs = require('fs');
const path = require('path');

function checkImportPaths() {
  const projectRoot = process.cwd();
  console.log('📁 Directorio actual:', projectRoot);
  
  const apiDir = path.join(projectRoot, 'pages', 'api');
  
  console.log('\n🔍 Verificando rutas de importación...\n');
  
  function checkFile(filePath) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const importLines = content.split('\n').filter(line => line.includes('import') && line.includes('lib/db'));
      
      if (importLines.length > 0) {
        console.log(`📄 ${path.relative(projectRoot, filePath)}:`);
        importLines.forEach(line => {
          console.log(`   ${line.trim()}`);
        });
      }
    }
  }
  
  function traverseDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverseDirectory(fullPath);
      } else if (item.endsWith('.js')) {
        checkFile(fullPath);
      }
    });
  }
  
  traverseDirectory(apiDir);
}

checkImportPaths();