import * as dotenv from "dotenv";

dotenv.config({ path: ".env", quiet: true });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  baseURL: process.env.BASE_URL ?? "https://opensource-demo.orangehrmlive.com",
  adminUsername: requireEnv("ORANGE_USERNAME"),
  adminPassword: requireEnv("ORANGE_PASSWORD"),
};
