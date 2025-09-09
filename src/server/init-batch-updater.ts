import { BatchUpdater } from './batch-updater';

let batchUpdater: BatchUpdater | null = null;

export function initializeBatchUpdater(): void {
  try {
    batchUpdater = new BatchUpdater();
    batchUpdater.startScheduler();
    console.log('🚀 Batch updater initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize batch updater:', error);
  }
}

export function getBatchUpdater(): BatchUpdater | null {
  return batchUpdater;
}

// Initialize when this module is imported
initializeBatchUpdater();
