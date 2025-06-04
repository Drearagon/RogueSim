const fs = require('fs');

try {
  console.log('🔍 COMMAND UNLOCK SYSTEM VALIDATION\n');
  
  // Read commands file
  const commandsContent = fs.readFileSync('client/src/lib/commands.ts', 'utf8');
  
  // Extract command definitions
  const commandsMatch = commandsContent.match(/export const commands.*?= \{([\s\S]*)\};?\s*$/);
  if (!commandsMatch) {
    console.log('❌ Could not find commands export');
    return;
  }

  // Find all command definitions
  const commands = commandsMatch[1].match(/^\s{2}[a-zA-Z_][a-zA-Z0-9_]*:\s*\{/gm);
  if (!commands) {
    console.log('❌ No commands found');
    return;
  }

  const commandNames = commands.map(c => {
    const match = c.match(/^\s{2}([a-zA-Z_][a-zA-Z0-9_]*):/);
    return match ? match[1] : null;
  }).filter(Boolean);

  console.log(`📊 Total commands found: ${commandNames.length}\n`);

  // Categorize commands by unlock level
  const categories = {
    alwaysAvailable: [],
    level0: [],
    level1: [],
    level2: [],
    level3: [],
    shopExclusive: [],
    factionExclusive: [],
    noUnlockLevel: []
  };

  commandNames.forEach(cmdName => {
    const cmdRegex = new RegExp(`${cmdName}:\\s*\\{[\\s\\S]*?unlockLevel:\\s*(\\d+|999)[\\s\\S]*?\\}`, 'g');
    const match = commandsContent.match(cmdRegex);
    
    if (match) {
      const unlockLevelMatch = match[0].match(/unlockLevel:\s*(\d+)/);
      if (unlockLevelMatch) {
        const level = parseInt(unlockLevelMatch[1]);
        if (level === 999) {
          if (match[0].includes('Shop exclusive') || match[0].includes('shop')) {
            categories.shopExclusive.push(cmdName);
          } else {
            categories.factionExclusive.push(cmdName);
          }
        } else if (level === 0) {
          categories.level0.push(cmdName);
        } else if (level === 1) {
          categories.level1.push(cmdName);
        } else if (level === 2) {
          categories.level2.push(cmdName);
        } else if (level === 3) {
          categories.level3.push(cmdName);
        }
      }
    } else {
      // Check if it's always available
      const alwaysAvailable = ['help', 'clear', 'status', 'shop', 'devmode', 'easter', 'reset_shop', 'tutorial', 'settings', 'multiplayer', 'leaderboard', 'man'];
      if (alwaysAvailable.includes(cmdName)) {
        categories.alwaysAvailable.push(cmdName);
      } else {
        categories.noUnlockLevel.push(cmdName);
      }
    }
  });

  // Display categorization
  console.log('📋 COMMAND CATEGORIZATION:\n');
  
  console.log('🟢 Always Available Commands:');
  categories.alwaysAvailable.forEach(cmd => console.log(`  • ${cmd}`));
  console.log();

  console.log('🔵 Level 0 (Starter) Commands:');
  categories.level0.forEach(cmd => console.log(`  • ${cmd}`));
  console.log();

  console.log('🟡 Level 1 Commands:');
  categories.level1.forEach(cmd => console.log(`  • ${cmd}`));
  console.log();

  console.log('🟠 Level 2 Commands:');
  categories.level2.forEach(cmd => console.log(`  • ${cmd}`));
  console.log();

  console.log('🔴 Level 3 Commands:');
  categories.level3.forEach(cmd => console.log(`  • ${cmd}`));
  console.log();

  console.log('🛒 Shop Exclusive Commands:');
  categories.shopExclusive.forEach(cmd => console.log(`  • ${cmd}`));
  console.log();

  console.log('🏴 Faction Exclusive Commands:');
  categories.factionExclusive.forEach(cmd => console.log(`  • ${cmd}`));
  console.log();

  if (categories.noUnlockLevel.length > 0) {
    console.log('⚠️  Commands Missing unlockLevel:');
    categories.noUnlockLevel.forEach(cmd => console.log(`  • ${cmd}`));
    console.log();
  }

  // Read shop items to verify unlocks
  console.log('🛍️  SHOP ITEM VALIDATION:\n');
  
  try {
    const shopItemsContent = fs.readFileSync('client/src/lib/shop/items.ts', 'utf8');
    const unlockMatches = shopItemsContent.match(/unlocks:\s*\[(.*?)\]/gs);
    
    if (unlockMatches) {
      const allShopUnlocks = [];
      unlockMatches.forEach(match => {
        const commands = match.match(/'([^']+)'/g);
        if (commands) {
          commands.forEach(cmd => {
            const cleanCmd = cmd.replace(/'/g, '');
            allShopUnlocks.push(cleanCmd);
          });
        }
      });

      console.log('Shop items unlock these commands:');
      [...new Set(allShopUnlocks)].forEach(cmd => {
        const exists = commandNames.includes(cmd);
        console.log(`  ${exists ? '✅' : '❌'} ${cmd} ${exists ? '' : '(COMMAND NOT FOUND)'}`);
      });
      console.log();

      // Check if shop exclusive commands have corresponding shop items
      console.log('Shop exclusive commands validation:');
      categories.shopExclusive.forEach(cmd => {
        const hasShopItem = allShopUnlocks.includes(cmd);
        console.log(`  ${hasShopItem ? '✅' : '❌'} ${cmd} ${hasShopItem ? '' : '(NO SHOP ITEM UNLOCKS THIS)'}`);
      });
    }
  } catch (error) {
    console.log('⚠️  Could not read shop items file');
  }

  console.log('\n📈 SUMMARY:');
  console.log(`  • Always Available: ${categories.alwaysAvailable.length}`);
  console.log(`  • Level 0 (Starter): ${categories.level0.length}`);
  console.log(`  • Level 1: ${categories.level1.length}`);
  console.log(`  • Level 2: ${categories.level2.length}`);
  console.log(`  • Level 3: ${categories.level3.length}`);
  console.log(`  • Shop Exclusive: ${categories.shopExclusive.length}`);
  console.log(`  • Faction Exclusive: ${categories.factionExclusive.length}`);
  console.log(`  • Missing unlockLevel: ${categories.noUnlockLevel.length}`);
  
  console.log('\n✅ Command unlock system validation complete!');
  
} catch (error) {
  console.log('❌ Error:', error.message);
} 