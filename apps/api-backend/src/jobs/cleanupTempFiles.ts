/**
 * Cleanup Job for Temporary Upload Files
 * 
 * Automatically deletes old files from temporary upload directory
 * Runs daily at 3 AM to prevent disk space exhaustion
 * 
 * Features:
 * - Deletes files older than 24 hours
 * - Logs cleanup statistics
 * - Handles errors gracefully (permission denied, disk full, etc.)
 * - Alerts if excessive files accumulate
 * 
 * @requires node-cron - Install with: npm install node-cron @types/node-cron
 */

import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Configuration
const UPLOAD_TMP_DIR = process.env.UPLOAD_TMP_DIR || path.join(os.tmpdir(), 'lumira-uploads');
const MAX_AGE_HOURS = 24; // Delete files older than 24 hours
const CLEANUP_SCHEDULE = '0 3 * * *'; // Every day at 3 AM (cron format)
const ALERT_THRESHOLD = 1000; // Alert if more than 1000 files found

interface CleanupStats {
  filesFound: number;
  filesDeleted: number;
  filesSkipped: number;
  bytesFreed: number;
  errors: Array<{ file: string; error: string }>;
  duration: number;
}

/**
 * Cleanup old files from temporary upload directory
 * @returns Cleanup statistics
 */
export async function cleanupTempFiles(): Promise<CleanupStats> {
  const startTime = Date.now();
  const stats: CleanupStats = {
    filesFound: 0,
    filesDeleted: 0,
    filesSkipped: 0,
    bytesFreed: 0,
    errors: [],
    duration: 0
  };

  try {
    // Check if directory exists
    if (!fs.existsSync(UPLOAD_TMP_DIR)) {
      console.info(`[CLEANUP] Upload directory does not exist: ${UPLOAD_TMP_DIR}`);
      return stats;
    }

    // Read directory
    const files = await fs.promises.readdir(UPLOAD_TMP_DIR);
    stats.filesFound = files.length;

    console.info(`[CLEANUP] Starting cleanup: ${files.length} files found in ${UPLOAD_TMP_DIR}`);

    // Alert if excessive files accumulate
    if (files.length > ALERT_THRESHOLD) {
      console.warn(`[CLEANUP] ⚠️ WARNING: ${files.length} files found (threshold: ${ALERT_THRESHOLD})`);
      console.warn('[CLEANUP] Consider investigating why so many temp files are accumulating');
    }

    // Calculate cutoff time (files older than MAX_AGE_HOURS will be deleted)
    const cutoffTime = Date.now() - (MAX_AGE_HOURS * 60 * 60 * 1000);

    // Process each file
    for (const file of files) {
      const filePath = path.join(UPLOAD_TMP_DIR, file);

      try {
        // Get file stats
        const stat = await fs.promises.stat(filePath);

        // Skip directories
        if (stat.isDirectory()) {
          stats.filesSkipped++;
          continue;
        }

        // Check if file is old enough to delete
        const fileAge = Date.now() - stat.mtimeMs;
        const ageHours = Math.floor(fileAge / (60 * 60 * 1000));

        if (stat.mtimeMs < cutoffTime) {
          // File is old enough - delete it
          await fs.promises.unlink(filePath);
          stats.filesDeleted++;
          stats.bytesFreed += stat.size;
          
          console.debug(`[CLEANUP] Deleted: ${file} (age: ${ageHours}h, size: ${formatBytes(stat.size)})`);
        } else {
          // File is too recent - keep it
          stats.filesSkipped++;
        }
      } catch (error) {
        // Log error but continue with other files
        const errorMessage = error instanceof Error ? error.message : String(error);
        stats.errors.push({ file, error: errorMessage });
        
        if ((error as any).code === 'EACCES') {
          console.error(`[CLEANUP] Permission denied: ${file}`);
        } else if ((error as any).code === 'ENOENT') {
          console.warn(`[CLEANUP] File disappeared during cleanup: ${file}`);
        } else {
          console.error(`[CLEANUP] Error processing ${file}:`, errorMessage);
        }
      }
    }

    stats.duration = Date.now() - startTime;

    // Log summary
    console.info(`[CLEANUP] Cleanup complete:`, {
      filesFound: stats.filesFound,
      filesDeleted: stats.filesDeleted,
      filesSkipped: stats.filesSkipped,
      bytesFreed: formatBytes(stats.bytesFreed),
      errors: stats.errors.length,
      duration: `${stats.duration}ms`
    });

    // Alert if many errors occurred
    if (stats.errors.length > 10) {
      console.warn(`[CLEANUP] ⚠️ ${stats.errors.length} errors occurred during cleanup`);
    }

    return stats;
  } catch (error) {
    console.error('[CLEANUP] Fatal error during cleanup:', error);
    stats.duration = Date.now() - startTime;
    stats.errors.push({
      file: 'DIRECTORY',
      error: error instanceof Error ? error.message : String(error)
    });
    return stats;
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Start the cleanup cron job
 * Runs daily at 3 AM
 */
export function startCleanupJob(): void {
  console.info(`[CLEANUP] Scheduling cleanup job: ${CLEANUP_SCHEDULE} (daily at 3 AM)`);
  console.info(`[CLEANUP] Target directory: ${UPLOAD_TMP_DIR}`);
  console.info(`[CLEANUP] Max file age: ${MAX_AGE_HOURS} hours`);

  // Validate cron expression
  if (!cron.validate(CLEANUP_SCHEDULE)) {
    console.error(`[CLEANUP] Invalid cron schedule: ${CLEANUP_SCHEDULE}`);
    return;
  }

  // Schedule the job
  const job = cron.schedule(CLEANUP_SCHEDULE, async () => {
    console.info('[CLEANUP] 🧹 Starting scheduled cleanup job...');
    try {
      await cleanupTempFiles();
    } catch (error) {
      console.error('[CLEANUP] Unexpected error in scheduled job:', error);
    }
  }, {
    timezone: 'Europe/Paris' // Adjust to your timezone
  });

  // Run immediately on startup (optional - helps clean up from previous crashes)
  console.info('[CLEANUP] Running initial cleanup on startup...');
  cleanupTempFiles().catch(error => {
    console.error('[CLEANUP] Error in initial cleanup:', error);
  });

  console.info('[CLEANUP] ✅ Cleanup job started successfully');
}

/**
 * Manual cleanup trigger (for testing or emergency)
 * Can be called via admin API endpoint or CLI
 */
export async function triggerManualCleanup(): Promise<CleanupStats> {
  console.info('[CLEANUP] Manual cleanup triggered');
  return await cleanupTempFiles();
}

// Export for use in server.ts
export default {
  startCleanupJob,
  cleanupTempFiles,
  triggerManualCleanup
};
