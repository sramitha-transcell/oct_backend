import app, { initPromise } from '../apps/backend_service/src/main';

/**
 * Vercel Serverless Function entrypoint.
 * Awaits server initialization (DB connection, env sync) and forwards incoming requests to Express.
 */
export default async function handler(req: any, res: any) {
  if (initPromise) {
    await initPromise;
  }
  return app(req, res);
}
