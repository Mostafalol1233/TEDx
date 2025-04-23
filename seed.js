// Run the seed script using tsx
import { execSync } from 'child_process';

try {
  console.log('Running seed script...');
  execSync('npx tsx server/seed.ts', { stdio: 'inherit' });
  console.log('Seed script completed successfully!');
} catch (error) {
  console.error('Error running seed script:', error);
  process.exit(1);
}