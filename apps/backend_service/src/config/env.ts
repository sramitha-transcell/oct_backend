import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

// Load main .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

export interface MicroserviceConfig {
    PORT: number;
    SERVICE_NAME?: string;
    [key: string]: any;
}

export interface GlobalEnvConfig {
    // Current microservice identifier
    SERVICE_NAME: string;
    PORT: number;

    // Common configurations (kept outside)
    DB_CONNECTION_STRING: string;
    JWT_SECRET: string;
    EXPIRY_TIME: string;
    SSO_ENCRYPTION_KEY: string;
    OTP_EXPIRY_MINUTES: number;
    DEFAULT_OTP: string;
    B2_ENDPOINT?: string;
    B2_KEY_ID?: string;
    B2_APPLICATION_KEY?: string;
    B2_REGION?: string;
    B2_BUCKET?: string;

    // Optional API URL to fetch env from
    ENV_API_URL?: string;

    // Microservices configuration object: maintained as an object for each microservice
    SERVICES: {
        backend_service: MicroserviceConfig;
        [serviceName: string]: MicroserviceConfig;
    };

    [key: string]: any;
}

const currentServiceName = process.env.SERVICE_NAME || "backend_service";
const backendServicePort = parseInt(
    process.env.BACKEND_SERVICE_PORT || process.env.PORT || "3001",
    10
);

export let GlobalEnv: GlobalEnvConfig = {
    SERVICE_NAME: currentServiceName,
    PORT: backendServicePort,

    // Common configurations (outside)
    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || "mongodb+srv://oct_admin:transcell@oct.dmlydcw.mongodb.net/oct",
    JWT_SECRET: process.env.JWT_SECRET || "yNVrBBM+oAOWOEcXPFjJuvXXpUq/4XR1KuSGX/i+slF+oE/geu2uW25PXjfWS9pwjmTry3WXn7q0DH7I+vNSjw==",
    EXPIRY_TIME: process.env.EXPIRY_TIME || "3d",
    SSO_ENCRYPTION_KEY: process.env.SSO_ENCRYPTION_KEY || "0123456789abcdxy0123456789abcdxy",
    OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || "10", 10),
    DEFAULT_OTP: process.env.DEFAULT_OTP || "888999",
    B2_ENDPOINT: process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com",
    B2_KEY_ID: process.env.B2_KEY_ID || process.env.B2_ACCESS_KEY_ID || "0055e2e57684ed60000000001",
    B2_APPLICATION_KEY: process.env.B2_APPLICATION_KEY || process.env.B2_SECRET_ACCESS_KEY || "K005GRuQEdbOc6gpS1jD3BLZoCF8leQ",
    B2_REGION: process.env.B2_REGION || "us-east-005",
    B2_BUCKET: process.env.B2_BUCKET || "transcell",
    ENV_API_URL: process.env.ENV_API_URL || "",

    // Object for each microservice with its own port
    SERVICES: {
        backend_service: {
            PORT: backendServicePort,
            SERVICE_NAME: "backend_service"
        }
    }
};

/**
 * Add / update environment configuration in env.ts
 */
export function setEnv(env_data: Partial<GlobalEnvConfig>) {
    const mergedServices = {
        ...GlobalEnv.SERVICES,
        ...(env_data.SERVICES || {})
    };

    const serviceName = env_data.SERVICE_NAME || GlobalEnv.SERVICE_NAME || "backend_service";
    const serviceConfig = mergedServices[serviceName];
    const resolvedPort = serviceConfig?.PORT || env_data.PORT || GlobalEnv.PORT;

    GlobalEnv = {
        ...GlobalEnv,
        ...env_data,
        PORT: resolvedPort,
        SERVICES: mergedServices
    };
}

export default GlobalEnv;
