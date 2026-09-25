import { v4 as uuidv4 } from 'uuid';

export const requestLogger = (req, res, next) => {
  const traceId = req.headers['x-trace-id'] || uuidv4().slice(0, 8);
  req.traceId = traceId;
  res.setHeader('X-Trace-Id', traceId);

  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const isError = status >= 400;
    
    if (process.env.NODE_ENV !== 'test') {
      const logMsg = `[${new Date().toISOString()}] [${traceId}] ${method} ${originalUrl} -> ${status} (${duration}ms)`;
      if (isError) {
        console.warn(`\x1b[33m${logMsg}\x1b[0m`);
      } else {
        console.log(`\x1b[32m${logMsg}\x1b[0m`);
      }
    }
  });

  next();
};
