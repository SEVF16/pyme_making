-- Migration: Seed System-Level Security Policies for Users Module
-- Date: 2025-10-31
-- Description: Crea configuraciones de seguridad a nivel SYSTEM para políticas de usuarios

-- 1. Password Policy (System Level)
INSERT INTO configurations (
  id,
  scope,
  scope_id,
  company_id,
  category,
  config_key,
  config_value,
  schema,
  version,
  is_active,
  description,
  metadata,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'system',
  NULL,
  NULL,
  'security',
  'users.password_policy',
  '{
    "minLength": 8,
    "requireLowercase": true,
    "requireUppercase": true,
    "requireNumbers": true,
    "requireSpecialChars": true,
    "specialChars": "@$!%*?&",
    "maxAgeDays": 90
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "minLength": {
        "type": "number",
        "minimum": 6,
        "maximum": 128,
        "description": "Longitud mínima de la contraseña"
      },
      "requireLowercase": {
        "type": "boolean",
        "description": "Requiere al menos una letra minúscula"
      },
      "requireUppercase": {
        "type": "boolean",
        "description": "Requiere al menos una letra mayúscula"
      },
      "requireNumbers": {
        "type": "boolean",
        "description": "Requiere al menos un número"
      },
      "requireSpecialChars": {
        "type": "boolean",
        "description": "Requiere al menos un carácter especial"
      },
      "specialChars": {
        "type": "string",
        "description": "Lista de caracteres especiales permitidos"
      },
      "maxAgeDays": {
        "type": "number",
        "minimum": 0,
        "description": "Días antes de que expire la contraseña (0 = nunca expira)"
      }
    },
    "required": ["minLength", "requireLowercase", "requireUppercase", "requireNumbers", "requireSpecialChars"]
  }'::jsonb,
  1,
  true,
  'Política de contraseñas estándar del sistema',
  '{
    "module": "users",
    "configuredBy": "system",
    "version": "1.0.0"
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (scope, config_key, COALESCE(scope_id, '00000000-0000-0000-0000-000000000000'))
DO NOTHING;

-- 2. Session Policy (System Level)
INSERT INTO configurations (
  id,
  scope,
  scope_id,
  company_id,
  category,
  config_key,
  config_value,
  schema,
  version,
  is_active,
  description,
  metadata,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'system',
  NULL,
  NULL,
  'security',
  'users.session_policy',
  '{
    "sessionTimeout": "24h",
    "maxConcurrentSessions": 3,
    "refreshTokenExpiry": "7d"
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "sessionTimeout": {
        "type": "string",
        "pattern": "^[0-9]+(s|m|h|d)$",
        "description": "Duración del token JWT"
      },
      "maxConcurrentSessions": {
        "type": "number",
        "minimum": 1,
        "maximum": 10,
        "description": "Máximo de sesiones concurrentes"
      },
      "refreshTokenExpiry": {
        "type": "string",
        "pattern": "^[0-9]+(s|m|h|d)$",
        "description": "Duración del refresh token"
      }
    },
    "required": ["sessionTimeout"]
  }'::jsonb,
  1,
  true,
  'Política de sesiones estándar del sistema',
  '{
    "module": "users",
    "configuredBy": "system",
    "version": "1.0.0"
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (scope, config_key, COALESCE(scope_id, '00000000-0000-0000-0000-000000000000'))
DO NOTHING;

-- 3. Email Verification Config (System Level)
INSERT INTO configurations (
  id,
  scope,
  scope_id,
  company_id,
  category,
  config_key,
  config_value,
  schema,
  version,
  is_active,
  description,
  metadata,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'system',
  NULL,
  NULL,
  'security',
  'users.email_verification',
  '{
    "tokenExpiryHours": 24,
    "requireVerification": true,
    "resendCooldownMinutes": 5
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "tokenExpiryHours": {
        "type": "number",
        "minimum": 1,
        "maximum": 168,
        "description": "Horas antes de que expire el token de verificación"
      },
      "requireVerification": {
        "type": "boolean",
        "description": "Si se requiere verificación de email"
      },
      "resendCooldownMinutes": {
        "type": "number",
        "minimum": 1,
        "maximum": 60,
        "description": "Minutos entre reenvíos"
      }
    },
    "required": ["tokenExpiryHours", "requireVerification"]
  }'::jsonb,
  1,
  true,
  'Configuración de verificación de email estándar',
  '{
    "module": "users",
    "configuredBy": "system",
    "version": "1.0.0"
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (scope, config_key, COALESCE(scope_id, '00000000-0000-0000-0000-000000000000'))
DO NOTHING;

-- 4. Password Reset Config (System Level)
INSERT INTO configurations (
  id,
  scope,
  scope_id,
  company_id,
  category,
  config_key,
  config_value,
  schema,
  version,
  is_active,
  description,
  metadata,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'system',
  NULL,
  NULL,
  'security',
  'users.password_reset',
  '{
    "tokenExpiryHours": 1,
    "maxAttemptsPerDay": 3,
    "cooldownMinutes": 15
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "tokenExpiryHours": {
        "type": "number",
        "minimum": 0.5,
        "maximum": 24,
        "description": "Horas antes de que expire el token de reset"
      },
      "maxAttemptsPerDay": {
        "type": "number",
        "minimum": 1,
        "maximum": 10,
        "description": "Máximo de intentos de reset por día"
      },
      "cooldownMinutes": {
        "type": "number",
        "minimum": 5,
        "maximum": 120,
        "description": "Tiempo de espera entre intentos"
      }
    },
    "required": ["tokenExpiryHours", "maxAttemptsPerDay"]
  }'::jsonb,
  1,
  true,
  'Configuración de reset de contraseña estándar',
  '{
    "module": "users",
    "configuredBy": "system",
    "version": "1.0.0"
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (scope, config_key, COALESCE(scope_id, '00000000-0000-0000-0000-000000000000'))
DO NOTHING;

-- 5. Login Attempts Config (System Level) - Futuro
INSERT INTO configurations (
  id,
  scope,
  scope_id,
  company_id,
  category,
  config_key,
  config_value,
  schema,
  version,
  is_active,
  description,
  metadata,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'system',
  NULL,
  NULL,
  'security',
  'users.login_attempts',
  '{
    "maxAttempts": 5,
    "lockoutDurationMinutes": 30,
    "resetAfterMinutes": 60
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "maxAttempts": {
        "type": "number",
        "minimum": 3,
        "maximum": 10,
        "description": "Máximo de intentos de login fallidos"
      },
      "lockoutDurationMinutes": {
        "type": "number",
        "minimum": 5,
        "maximum": 1440,
        "description": "Duración del bloqueo en minutos"
      },
      "resetAfterMinutes": {
        "type": "number",
        "minimum": 30,
        "maximum": 1440,
        "description": "Tiempo para resetear contador"
      }
    },
    "required": ["maxAttempts", "lockoutDurationMinutes"]
  }'::jsonb,
  1,
  true,
  'Configuración de intentos de login (pendiente implementación)',
  '{
    "module": "users",
    "configuredBy": "system",
    "version": "1.0.0",
    "status": "pending_implementation"
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (scope, config_key, COALESCE(scope_id, '00000000-0000-0000-0000-000000000000'))
DO NOTHING;

-- Verificar que se crearon las configuraciones
SELECT
  config_key,
  scope,
  category,
  is_active,
  description
FROM configurations
WHERE config_key LIKE 'users.%'
  AND scope = 'system'
ORDER BY config_key;
