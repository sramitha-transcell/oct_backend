interface GlobalEnvConfig {
    PORT: number;
    DB_CONNECTION_STRING: string;
    JWT_SECRET: string;
    EXPIRY_TIME: string;
    SSO_ENCRYPTION_KEY: string;
    OTP_EXPIRY_MINUTES: number;
    DEFAULT_OTP: string;
}

export let GlobalEnv: GlobalEnvConfig = {
    PORT: 3001,
    DB_CONNECTION_STRING: "mongodb+srv://oct_admin:transcell@oct.dmlydcw.mongodb.net/oct",
    JWT_SECRET: "yNVrBBM+oAOWOEcXPFjJuvXXpUq/4XR1KuSGX/i+slF+oE/geu2uW25PXjfWS9pwjmTry3WXn7q0DH7I+vNSjw==",
    EXPIRY_TIME: "3d",
    SSO_ENCRYPTION_KEY: "0123456789abcdxy0123456789abcdxy",
    OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || "10"),
    DEFAULT_OTP: "888999",
};

export function setEnv(env_data: GlobalEnvConfig) {
    GlobalEnv = { ...GlobalEnv, ...env_data };
}