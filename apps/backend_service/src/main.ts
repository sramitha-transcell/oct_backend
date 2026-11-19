import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors";
import logger from "morgan";
import axios from 'axios';
import router from './router';

import { GlobalEnv, setEnv } from './config/env';
import { generateRandomAlphanumeric, connectWithRetry, apiResponse } from '@oct-backend/shared-utils';

/**
 * Fetch environment configuration by API and add/merge it into env.ts.
 * Supports receiving common configs outside and microservice-specific objects in SERVICES.
 */
async function fetchEnvByApi(apiUrl?: string): Promise<void> {
  const url = apiUrl || GlobalEnv.ENV_API_URL || process.env.ENV_API_URL;
  if (!url) {
    console.log(`ℹ️ [Config] No ENV_API_URL provided; using local .env data.`);
    return;
  }

  try {
    console.log(`📡 [Config] Fetching environment configuration from API: ${url}...`);
    const response = await axios.get(url, { timeout: 8000 });
    const payload = response.data?.data || response.data;

    if (payload && typeof payload === 'object') {
      setEnv(payload);
      console.log(`✅ [Config] Successfully fetched env by API and updated env.ts`);
      console.log(`   Service: '${GlobalEnv.SERVICE_NAME}', Port: ${GlobalEnv.PORT}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [Config] Failed to fetch env from API (${err.message}). Using local fallback.`);
  }
}

export default async function init(app: any) {

  function customLogger(tokens: any, req: any, res: any) {
    const date = new Date().toISOString(); // Current timestamp
    const method = tokens.method(req, res); // HTTP method
    const url = tokens.url(req, res); // URL requested
    const httpVersion = "HTTP/" + req.httpVersion; // HTTP version
    const statusCode = res.statusCode; // HTTP status code

    // Construct custom log message
    return `date: ${date}, ${method} ${url} ${httpVersion} ${statusCode}`;
  }

  try {
    // 1. Fetch environment details by API and add to env.ts
    await fetchEnvByApi();

    console.log("Backend_Application: ", GlobalEnv);

    const nums = await generateRandomAlphanumeric(8);
    console.log(`Generated Random String: ${nums}`);

    if (GlobalEnv?.DB_CONNECTION_STRING) {
      console.log('Connecting to Database...');
      await connectWithRetry(GlobalEnv?.DB_CONNECTION_STRING);
      console.log('Database Connection Established');
    }
    app.use(cors());
    app.use(cookieParser());
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    app.use((err: any, req: any, res: any, next: any) => {
      if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({
          meta: {
            status: false,
            message: "Invalid JSON format: In Windows file paths, use forward slashes '/' (e.g. 'C:/Users/...') instead of unescaped backslashes '\\'."
          },
          error: {
            name: "JSONParseError",
            message: err.message
          }
        });
      }
      next(err);
    });
    app.use(logger(customLogger));

    app.get('/', (req: any, res: any) => {
      res.send({ message: 'Backend Application Working fine' });
    });

    /**
     * API in main to fetch the environment details
     * Returns common configs outside and microservice objects inside SERVICES.
     * Optional query param ?api_url=... to re-fetch live from a config API.
     */
    app.get('/api/v1/oct/backend/env', async (req: any, res: any) => {
      const externalApiUrl = req.query.api_url as string;
      if (externalApiUrl) {
        await fetchEnvByApi(externalApiUrl);
      }
      return res.status(200).json(
        apiResponse.SUCCESS_RESP(GlobalEnv, "Environment configuration details fetched successfully")
      );
    });

    app.use('/api/v1/oct/backend', router);
    app.use('/api/v1/transcell/backend', router);

    app.use((req: any, res: any) => {
      res.status(404).json({
        "meta": {
          "status": false,
          "message": "page not found"
        },
        "error": {
          "name": "page not found",
          "message": "Page not found"
        }
      });
    });

    const server = app.listen(GlobalEnv?.PORT || 3001, () => {
      console.log(`Backend_Application server listening on port : ${GlobalEnv?.PORT || 3001}`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${GlobalEnv?.PORT || 3001} is already in use by another process.`);
        console.error(`Please kill the process holding port ${GlobalEnv?.PORT || 3001} or change the PORT in config/env.ts.\n`);
      } else {
        console.error("Server error =====>>>>", err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.log("App Error =====>>>>", err);
    process.exit(1);
  }
}

const app = express();
init(app);
