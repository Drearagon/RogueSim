const fs = require('fs');

try {
  console.log('Reading commands.ts file...');
  const content = fs.readFileSync('client/src/lib/commands.ts', 'utf8');
  console.log(`File size: ${content.length} characters`);
  
  // Find the commands object definition
  const commandsMatch = content.match(/export const commands.*?= \{([\s\S]*)\};?\s*$/);
  if (!commandsMatch) {
    console.log('Could not find commands export');
    return;
  }
  
  const commandsContent = commandsMatch[1];
  
  // Look for command definitions at the top level (indented by 2 spaces, not more)
  const commands = commandsContent.match(/^\s{2}[a-zA-Z_][a-zA-Z0-9_]*:\s*\{/gm);
  console.log(`Found ${commands ? commands.length : 0} command definitions`);
  
  if (commands) {
    const commandNames = commands.map(c => {
      const match = c.match(/^\s{2}([a-zA-Z_][a-zA-Z0-9_]*):/);
      return match ? match[1] : null;
    }).filter(Boolean);
    
    const duplicates = commandNames.filter((name, i) => commandNames.indexOf(name) !== i);
    
    if (duplicates.length > 0) {
      console.log('\n❌ DUPLICATES FOUND:', [...new Set(duplicates)]);
      
      // Show where duplicates appear
      [...new Set(duplicates)].forEach(dup => {
        const indices = commandNames.map((name, i) => name === dup ? i + 1 : -1).filter(i => i !== -1);
        console.log(`  "${dup}" appears at positions: ${indices.join(', ')}`);
      });
    } else {
      console.log('\n✅ NO DUPLICATES - All commands are unique');
      console.log(`Total commands: ${commandNames.length}`);
    }
  } else {
    console.log('No command definitions found');
  }
} catch (e) {
  console.log('Error:', e.message);
} 