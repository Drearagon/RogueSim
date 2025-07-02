#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function seedBattlePass() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🎮 Seeding Battle Pass data...');

    // First, let's create the battle pass tables manually to ensure they exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS battle_passes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        season_number INTEGER NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        free_tier_rewards JSONB NOT NULL DEFAULT '[]',
        premium_tier_rewards JSONB NOT NULL DEFAULT '[]',
        max_level INTEGER NOT NULL DEFAULT 100,
        premium_price INTEGER NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_battle_passes (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        battle_pass_id INTEGER NOT NULL REFERENCES battle_passes(id),
        current_level INTEGER NOT NULL DEFAULT 1,
        experience INTEGER NOT NULL DEFAULT 0,
        has_premium BOOLEAN NOT NULL DEFAULT false,
        purchase_date TIMESTAMP,
        stripe_payment_intent_id VARCHAR,
        claimed_rewards JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cosmetics (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        rarity VARCHAR(20) NOT NULL DEFAULT 'common',
        data JSONB NOT NULL,
        is_premium_only BOOLEAN NOT NULL DEFAULT false,
        battle_pass_id INTEGER REFERENCES battle_passes(id),
        unlock_level INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_cosmetics (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        cosmetic_id INTEGER NOT NULL REFERENCES cosmetics(id),
        equipped_at TIMESTAMP,
        unlocked_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS battle_pass_commands (
        id SERIAL PRIMARY KEY,
        command_name VARCHAR(50) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        description TEXT,
        battle_pass_id INTEGER NOT NULL REFERENCES battle_passes(id),
        unlock_level INTEGER NOT NULL,
        is_premium_only BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_premium_commands (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        command_name VARCHAR(50) NOT NULL,
        battle_pass_id INTEGER NOT NULL REFERENCES battle_passes(id),
        unlocked_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Battle Pass tables created/verified');

    // Create sample battle pass
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // 3 months duration

    const freeTierRewards = Array.from({ length: 100 }, (_, i) => ({
      level: i + 1,
      type: i % 10 === 9 ? 'cosmetic' : i % 5 === 4 ? 'command' : 'credits',
      name: i % 10 === 9 ? `Terminal Theme ${Math.floor(i / 10) + 1}` : 
            i % 5 === 4 ? `Advanced Command ${Math.floor(i / 5) + 1}` : 
            `${(i + 1) * 50} Credits`,
      value: i % 10 === 9 ? `theme_${i}` : 
             i % 5 === 4 ? `cmd_${i}` : 
             (i + 1) * 50,
      rarity: i % 20 === 19 ? 'epic' : i % 10 === 9 ? 'rare' : 'common'
    }));

    const premiumTierRewards = Array.from({ length: 100 }, (_, i) => ({
      level: i + 1,
      type: i % 8 === 7 ? 'cosmetic' : i % 4 === 3 ? 'command' : i % 3 === 2 ? 'avatar' : 'credits',
      name: i % 8 === 7 ? `Elite Skin ${Math.floor(i / 8) + 1}` : 
            i % 4 === 3 ? `Premium Command ${Math.floor(i / 4) + 1}` : 
            i % 3 === 2 ? `Avatar Frame ${Math.floor(i / 3) + 1}` : 
            `${(i + 1) * 100} Premium Credits`,
      value: i % 8 === 7 ? `elite_skin_${i}` : 
             i % 4 === 3 ? `premium_cmd_${i}` : 
             i % 3 === 2 ? `avatar_${i}` : 
             (i + 1) * 100,
      rarity: i % 15 === 14 ? 'legendary' : i % 8 === 7 ? 'epic' : i % 4 === 3 ? 'rare' : 'common'
    }));

    const battlePassResult = await pool.query(`
      INSERT INTO battle_passes (
        name, description, season_number, start_date, end_date, 
        free_tier_rewards, premium_tier_rewards, max_level, premium_price, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT DO NOTHING
      RETURNING id;
    `, [
      'Cyberpunk Uprising',
      'Hack your way through the corporate firewall and claim legendary rewards',
      1,
      startDate,
      endDate,
      JSON.stringify(freeTierRewards),
      JSON.stringify(premiumTierRewards),
      100,
      999, // $9.99 in cents
      true
    ]);

    let battlePassId = battlePassResult.rows[0]?.id;
    
    if (!battlePassId) {
      // If insert failed due to conflict, get existing battle pass
      const existingResult = await pool.query('SELECT id FROM battle_passes WHERE is_active = true LIMIT 1');
      battlePassId = existingResult.rows[0]?.id;
    }

    if (battlePassId) {
      console.log(`✅ Battle Pass created/found with ID: ${battlePassId}`);

      // Create sample cosmetics
      const cosmetics = [
        {
          name: 'Neon Terminal Theme',
          description: 'Electric blue terminal with neon effects',
          type: 'terminal_theme',
          rarity: 'rare',
          data: { colors: { background: '#001122', text: '#00ffff', accent: '#ff00ff' } },
          isPremiumOnly: false,
          unlockLevel: 5
        },
        {
          name: 'Elite Hacker Avatar',
          description: 'Premium avatar with animated effects',
          type: 'avatar',
          rarity: 'epic',
          data: { image: 'elite_hacker.png', animation: 'glow' },
          isPremiumOnly: true,
          unlockLevel: 10
        },
        {
          name: 'Matrix Rain Background',
          description: 'Iconic falling code background effect',
          type: 'background',
          rarity: 'legendary',
          data: { effect: 'matrix_rain', speed: 'medium', color: '#00ff00' },
          isPremiumOnly: true,
          unlockLevel: 25
        },
        {
          name: 'Hacker Badge',
          description: 'Show off your elite status',
          type: 'badge',
          rarity: 'common',
          data: { icon: 'skull', color: '#ff0000' },
          isPremiumOnly: false,
          unlockLevel: 1
        },
        {
          name: 'Victory Emote',
          description: 'Celebrate successful hacks',
          type: 'emote',
          rarity: 'rare',
          data: { animation: 'victory_dance', duration: 3 },
          isPremiumOnly: true,
          unlockLevel: 15
        }
      ];

      for (const cosmetic of cosmetics) {
        await pool.query(`
          INSERT INTO cosmetics (
            name, description, type, rarity, data, is_premium_only, 
            battle_pass_id, unlock_level
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT DO NOTHING;
        `, [
          cosmetic.name,
          cosmetic.description,
          cosmetic.type,
          cosmetic.rarity,
          JSON.stringify(cosmetic.data),
          cosmetic.isPremiumOnly,
          battlePassId,
          cosmetic.unlockLevel
        ]);
      }

      console.log('✅ Sample cosmetics created');

      // Create premium commands
      const premiumCommands = [
        {
          commandName: 'quantum_decrypt',
          displayName: 'Quantum Decrypt',
          description: 'Advanced quantum-based decryption algorithm',
          unlockLevel: 5,
          isPremiumOnly: true
        },
        {
          commandName: 'neural_scan',
          displayName: 'Neural Network Scan',
          description: 'AI-powered deep network scanning',
          unlockLevel: 10,
          isPremiumOnly: true
        },
        {
          commandName: 'temporal_exploit',
          displayName: 'Temporal Exploit',
          description: 'Time-based vulnerability exploitation',
          unlockLevel: 20,
          isPremiumOnly: true
        },
        {
          commandName: 'shadow_clone',
          displayName: 'Shadow Clone',
          description: 'Create decoy processes to avoid detection',
          unlockLevel: 15,
          isPremiumOnly: true
        },
        {
          commandName: 'data_singularity',
          displayName: 'Data Singularity',
          description: 'Ultimate data extraction technique',
          unlockLevel: 50,
          isPremiumOnly: true
        }
      ];

      for (const command of premiumCommands) {
        await pool.query(`
          INSERT INTO battle_pass_commands (
            command_name, display_name, description, battle_pass_id, 
            unlock_level, is_premium_only
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING;
        `, [
          command.commandName,
          command.displayName,
          command.description,
          battlePassId,
          command.unlockLevel,
          command.isPremiumOnly
        ]);
      }

      console.log('✅ Premium commands created');
    }

    console.log('🎮 Battle Pass seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding battle pass:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeding
if (require.main === module) {
  seedBattlePass()
    .then(() => {
      console.log('✅ Database seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedBattlePass };