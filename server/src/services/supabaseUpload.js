import { createClient } from '@supabase/supabase-js';

let client;

function getClient() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for uploads.');
  }
  client = createClient(url, key);
  return client;
}

const BUCKET = 'uploads';

/**
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @param {string} originalName
 * @returns {Promise<string>} public URL
 */
export async function uploadImageBuffer(buffer, mimetype, originalName) {
  const ext =
    (originalName && originalName.includes('.') && originalName.split('.').pop()) ||
    (mimetype === 'image/png' ? 'png' : mimetype === 'image/webp' ? 'webp' : 'jpg');
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = getClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mimetype || 'image/jpeg',
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('Could not get public URL for upload.');
  }
  return data.publicUrl;
}
