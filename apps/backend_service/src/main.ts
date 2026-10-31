import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors";
import logger from "morgan";
import router from './router'

import { GlobalEnv } from './config/env'
import { generateRandomAlphanumeric, connectWithRetry } from '@oct-backend/shared-utils';



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
    console.log("Backend_Application: ", GlobalEnv);
    const nums = await generateRandomAlphanumeric(8)
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
    app.use(logger(customLogger));

    app.get('/', (req: any, res: any) => {
      res.send({ message: 'Backend Application Working fine' });
    });
    // app.get('/logs', logsAuth, live_logs);


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
    console.log("App Error =====>>>>", err)
    process.exit(1)
  }
};

const app = express()
init(app)