import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../../infrastructure/database/data-source';
import { seedIam, seedBootstrapAdmin } from './iam.seed';

dotenv.config();

async function main(): Promise<void> {
  console.log('🌱 Starting seed...\n');

  await AppDataSource.initialize();
  console.log('✓ Database connected\n');

  try {
    await seedIam(AppDataSource);
    await seedBootstrapAdmin(AppDataSource);
    console.log('\n✅ Seed completed successfully');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

main();
