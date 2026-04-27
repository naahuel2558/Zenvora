const SUPABASE_URL = 'https://rxgdlkqhrbjusysbowos.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TgTCGUGTPenkrmDxzlb_rA_c_vpqjSQ';

// No necesitamos importar el cliente aquÃ­ si usamos el CDN de Supabase en el HTML,
// pero vamos a centralizar la configuraciÃ³n.

export const supabaseConfig = {
    url: SUPABASE_URL,
    key: SUPABASE_KEY
};
