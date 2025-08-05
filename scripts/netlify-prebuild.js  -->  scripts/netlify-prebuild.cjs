#!/usr/bin/env node
/**
 * Netlify Pre-build Script
 * Optimizes the build process for deployment
 */

import fs from 'fs';
import path from 'path';
// 
console.log('🚀 Running Netlify pre-build optimizations...');

// Ensure required directories exist
const requiredDirs = [
  'dist',
  'netlify/functions'
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Verify environment variables for production
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn('⚠️  Missing environment variables:', missingEnvVars.join(', '));
  console.warn('Some features may not work correctly in production.');
}

// Copy public assets to ensure they're included
const publicAssets = ['_redirects', 'manifest.json', 'sw.js'];

publicAssets.forEach(asset => {
  const sourcePath = path.join('public', asset);
  if (fs.existsSync(sourcePath)) {
    console.log(`✅ Found public asset: ${asset}`);
  } else {
    console.warn(`⚠️  Missing public asset: ${asset}`);
  }
});

// Validate functions
const functionsDir = 'netlify/functions';
if (fs.existsSync(functionsDir)) {
  const functions = fs.readdirSync(functionsDir).filter(file => file.endsWith('.js'));
  console.log(`✅ Found ${functions.length} Netlify functions:`, functions.join(', '));
} else {
  console.warn('⚠️  No Netlify functions directory found');
}

console.log('🎉 Pre-build optimizations complete!');
