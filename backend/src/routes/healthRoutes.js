import express from 'express';
import os from 'os';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Personal Device Assistant Backend',
    timestamp: new Date().toISOString()
  });
});

router.get('/metrics', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'healthy',
    system: {
      platform: os.platform(),
      arch: os.arch(),
      uptimeSeconds: Math.floor(os.uptime()),
      processUptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      cpuCount: os.cpus().length,
      loadAverage: os.loadavg(),
      totalMemoryMB: Math.round(os.totalmem() / (1024 * 1024)),
      freeMemoryMB: Math.round(os.freemem() / (1024 * 1024))
    },
    processMemory: {
      rssMB: Math.round(memoryUsage.rss / (1024 * 1024)),
      heapTotalMB: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
      heapUsedMB: Math.round(memoryUsage.heapUsed / (1024 * 1024))
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
