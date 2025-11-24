/**
 * Utilitários de autenticação
 * Sistema de hash de senhas usando Web Crypto API
 */

/**
 * Gera um hash SHA-256 da senha
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} Hash da senha em hexadecimal
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verifica se a senha corresponde ao hash
 * @param {string} password - Senha em texto plano
 * @param {string} hash - Hash armazenado
 * @returns {Promise<boolean>} True se a senha corresponde
 */
export async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Gera um token simples para sessão
 * @returns {string} Token de sessão
 */
export function generateSessionToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
}


