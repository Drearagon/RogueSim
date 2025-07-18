#!/usr/bin/env node

// Simple Node.js health check script for Docker containers
// This script tests the /api/health endpoint and exits with appropriate codes

const http = require('http');
const url = require('url');

// Configuration
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 5000;
const HEALTH_PATH = '/api/health';
const TIMEOUT = 5000; // 5 second timeout

// Create health check request
const healthCheckUrl = `http://${HOST}:${PORT}${HEALTH_PATH}`;

console.log(`Health check: ${healthCheckUrl}`);

const request = http.get(healthCheckUrl, { timeout: TIMEOUT }, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200 && response.status === 'healthy') {
                console.log('✓ Health check passed');
                process.exit(0);
            } else {
                console.log(`✗ Health check failed: HTTP ${res.statusCode}, status: ${response.status}`);
                process.exit(1);
            }
        } catch (error) {
            console.log(`✗ Health check failed: Invalid JSON response`);
            process.exit(1);
        }
    });
});

request.on('error', (error) => {
    console.log(`✗ Health check failed: ${error.message}`);
    process.exit(1);
});

request.on('timeout', () => {
    console.log('✗ Health check failed: Request timeout');
    request.destroy();
    process.exit(1);
});

// Set overall timeout
setTimeout(() => {
    console.log('✗ Health check failed: Overall timeout');
    process.exit(1);
}, TIMEOUT + 1000);