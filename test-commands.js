#!/usr/bin/env node

// Comprehensive Terminal Command Test Suite
// Tests all commands for completeness and functionality

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the commands file
const commandsPath = path.join(__dirname, 'client/src/lib/commands.ts');
const commandsContent = fs.readFileSync(commandsPath, 'utf8');

console.log('🔍 RogueSim Terminal Command Analysis');
console.log('=====================================\n');

// Extract all command definitions
const commandRegex = /(\w+):\s*{[\s\S]*?execute:\s*\([^)]*\):\s*CommandResult\s*=>\s*{([\s\S]*?)}\s*(?:,\s*unlockLevel:|}\s*,)/g;
const commands = [];
let match;

while ((match = commandRegex.exec(commandsContent)) !== null) {
  const commandName = match[1];
  const executeBody = match[2];
  
  commands.push({
    name: commandName,
    body: executeBody.trim()
  });
}

console.log(`Found ${commands.length} commands to analyze:\n`);

// Test categories
const issues = {
  incomplete: [],
  missingOutput: [],
  noReturnStatement: [],
  errorHandling: [],
  healthyCommands: []
};

// Analyze each command
commands.forEach(cmd => {
  const { name, body } = cmd;
  
  // Check for basic return statement
  const hasReturn = body.includes('return {');
  
  // Check for output array
  const hasOutput = body.includes('output:') || body.includes('output [');
  
  // Check for proper error handling
  const hasErrorHandling = body.includes('error') || body.includes('ERROR') || body.includes('success: false');
  
  // Check for incomplete implementation markers
  const isIncomplete = body.includes('TODO') || body.includes('FIXME') || body.includes('incomplete') || 
                      body.length < 50 || body.includes('placeholder');
  
  // Categorize command
  if (isIncomplete) {
    issues.incomplete.push(name);
  } else if (!hasReturn) {
    issues.noReturnStatement.push(name);
  } else if (!hasOutput) {
    issues.missingOutput.push(name);
  } else if (!hasErrorHandling) {
    issues.errorHandling.push(name);
  } else {
    issues.healthyCommands.push(name);
  }
});

// Report results
console.log('📊 COMMAND HEALTH REPORT');
console.log('========================\n');

if (issues.incomplete.length > 0) {
  console.log('❌ INCOMPLETE COMMANDS:', issues.incomplete.length);
  issues.incomplete.forEach(cmd => console.log(`   • ${cmd}`));
  console.log('');
}

if (issues.noReturnStatement.length > 0) {
  console.log('⚠️  MISSING RETURN STATEMENTS:', issues.noReturnStatement.length);
  issues.noReturnStatement.forEach(cmd => console.log(`   • ${cmd}`));
  console.log('');
}

if (issues.missingOutput.length > 0) {
  console.log('⚠️  MISSING OUTPUT ARRAYS:', issues.missingOutput.length);
  issues.missingOutput.forEach(cmd => console.log(`   • ${cmd}`));
  console.log('');
}

if (issues.errorHandling.length > 0) {
  console.log('⚠️  WEAK ERROR HANDLING:', issues.errorHandling.length);
  issues.errorHandling.forEach(cmd => console.log(`   • ${cmd}`));
  console.log('');
}

console.log('✅ HEALTHY COMMANDS:', issues.healthyCommands.length);
issues.healthyCommands.slice(0, 10).forEach(cmd => console.log(`   • ${cmd}`));
if (issues.healthyCommands.length > 10) {
  console.log(`   ... and ${issues.healthyCommands.length - 10} more`);
}
console.log('');

// Calculate health score
const totalIssues = issues.incomplete.length + issues.noReturnStatement.length + 
                   issues.missingOutput.length + issues.errorHandling.length;
const healthScore = Math.round((issues.healthyCommands.length / commands.length) * 100);

console.log('📈 OVERALL HEALTH SCORE');
console.log('=======================');
console.log(`Commands analyzed: ${commands.length}`);
console.log(`Healthy commands: ${issues.healthyCommands.length}`);
console.log(`Commands with issues: ${totalIssues}`);
console.log(`Health Score: ${healthScore}%`);

if (healthScore >= 90) {
  console.log('🎉 Excellent! Command system is very healthy.');
} else if (healthScore >= 75) {
  console.log('👍 Good! Minor issues to address.');
} else if (healthScore >= 50) {
  console.log('⚠️  Moderate issues need attention.');
} else {
  console.log('🚨 Critical issues require immediate fixing.');
}

console.log('\n📋 DETAILED COMMAND LIST');
console.log('========================');
commands.forEach((cmd, index) => {
  const status = issues.healthyCommands.includes(cmd.name) ? '✅' :
                issues.incomplete.includes(cmd.name) ? '❌' : '⚠️';
  console.log(`${index + 1}. ${status} ${cmd.name}`);
});