/*
  # Update Gifaa tenant proxy secret

  1. Changes
    - Updates the `proxy_secret` column for the gifaa tenant
    - Aligns the stored secret with the value sent by the Cloudflare Worker
    - Old value: 'gifaa-proxy-secret-change-me'
    - New value: 'gifaa_secret_123'

  2. Notes
    - Required to resolve 403 errors on proxied requests
    - The Cloudflare Worker sends x-secret: 'gifaa_secret_123'
*/

UPDATE gifaa_tenants
SET proxy_secret = 'gifaa_secret_123'
WHERE tenant_key = 'gifaa';