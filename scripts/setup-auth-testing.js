#!/usr/bin/env node

/**
 * 🔧 Authentication Testing Setup Script
 * 
 * This script helps you set up authentication testing for localhost
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔧 Kitebuddy Authentication Testing Setup\n');

// Check if .env exists
const envPath = path.join(projectRoot, '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Kitebuddy Environment Variables
# Get these from your Supabase project dashboard

# Supabase Configuration
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Marine Weather Provider
# MARINE_PROVIDER=stormglass
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created!');
} else {
  console.log('✅ .env file already exists');
}

console.log('\n📋 Next Steps:\n');

console.log('1. 🔑 Get your Supabase credentials:');
console.log('   - Go to https://supabase.com/dashboard');
console.log('   - Select your project (or create a new one)');
console.log('   - Go to Settings > API');
console.log('   - Copy the Project URL and anon public key\n');

console.log('2. 📝 Update your .env file:');
console.log('   - Replace "your-project-id.supabase.co" with your actual URL');
console.log('   - Replace "your-anon-key-here" with your actual anon key\n');

console.log('3. 🌐 Configure Supabase for localhost:');
console.log('   - Go to Authentication > URL Configuration');
console.log('   - Add these URLs:');
console.log('     • Site URL: http://localhost:4321');
console.log('     • Redirect URLs: http://localhost:4321/auth/callback\n');

console.log('4. 🗄️ Set up your database:');
console.log('   - Go to SQL Editor in Supabase');
console.log('   - Run this SQL:');
console.log(`
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
`);

console.log('5. 🚀 Test the setup:');
console.log('   - Run: node scripts/testSupabase.js');
console.log('   - Start your dev server: npm run dev');
console.log('   - Go to http://localhost:4321');
console.log('   - Click "Sign up" to test registration\n');

console.log('6. 🔧 Alternative: Use ngrok for public URL:');
console.log('   - Install ngrok: https://ngrok.com/download');
console.log('   - Run: ngrok http 4321');
console.log('   - Use the public URL in Supabase settings\n');

console.log('🎉 You\'re ready to test authentication!\n');

// Check if Supabase credentials are set
if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasUrl = envContent.includes('https://') && !envContent.includes('your-project-id');
  const hasKey = envContent.includes('eyJ') && !envContent.includes('your-anon-key');
  
  if (hasUrl && hasKey) {
    console.log('✅ Supabase credentials appear to be configured!');
    console.log('   You can now test authentication on localhost.');
  } else {
    console.log('⚠️  Please update your .env file with real Supabase credentials.');
  }
}
