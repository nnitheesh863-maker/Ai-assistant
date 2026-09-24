import os from 'os';

export function getSystemInformation() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = Math.round((usedMem / totalMem) * 100);
  const cpus = os.cpus();
  const uptimeSeconds = os.uptime();
  const uptimeHours = (uptimeSeconds / 3600).toFixed(1);

  return {
    os: `${os.type()} ${os.release()} (${os.arch()})`,
    platform: os.platform(),
    hostname: os.hostname(),
    cpuModel: cpus[0]?.model || 'Generic CPU',
    cpuCores: cpus.length,
    memory: {
      totalMB: Math.round(totalMem / (1024 * 1024)),
      freeMB: Math.round(freeMem / (1024 * 1024)),
      usagePercent: `${memUsagePercent}%`
    },
    uptime: `${uptimeHours} hours`,
    nodeVersion: process.version
  };
}
