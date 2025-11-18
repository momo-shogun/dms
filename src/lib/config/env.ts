// Environment Configuration

import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  DATABASE_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Document Management System'),
  NEXT_PUBLIC_API_URL: z.string().default('/api'),
  
  // File upload config
  MAX_FILE_SIZE: z.string().default('10MB'),
  ALLOWED_FILE_TYPES: z.string().default('pdf,doc,docx,txt,jpg,jpeg,png,gif'),
  
  // Storage config
  STORAGE_TYPE: z.enum(['local', 's3', 'cloudinary']).default('local'),
  
  // S3 Config (optional)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Email config (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
})

function getEnv() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES,
    STORAGE_TYPE: process.env.STORAGE_TYPE,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
  }

  const parsed = envSchema.safeParse(env)

  if (!parsed.success) {
    console.error('Environment validation failed:', parsed.error.format())
    process.exit(1)
  }

  return parsed.data
}

export const config = getEnv()

// Helper functions
export const isDevelopment = config.NODE_ENV === 'development'
export const isProduction = config.NODE_ENV === 'production'
export const isTest = config.NODE_ENV === 'test'

// File upload helpers
export const getMaxFileSize = () => {
  const size = config.MAX_FILE_SIZE
  const match = size.match(/^(\d+)(MB|GB|KB)$/i)
  
  if (!match) return 10 * 1024 * 1024 // Default 10MB
  
  const [, value, unit] = match
  const num = parseInt(value, 10)
  
  switch (unit.toUpperCase()) {
    case 'KB':
      return num * 1024
    case 'MB':
      return num * 1024 * 1024
    case 'GB':
      return num * 1024 * 1024 * 1024
    default:
      return 10 * 1024 * 1024
  }
}

export const getAllowedFileTypes = () => {
  return config.ALLOWED_FILE_TYPES.split(',').map(type => type.trim().toLowerCase())
}

export const isFileTypeAllowed = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase()
  if (!extension) return false
  
  const allowedTypes = getAllowedFileTypes()
  return allowedTypes.includes(extension)
}
