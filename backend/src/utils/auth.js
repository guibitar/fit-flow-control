/**
 * Utilitários de autenticação para o backend
 * Usa SHA-256 (mesmo do frontend para compatibilidade)
 */

import crypto from 'crypto';

/**
 * Gera hash SHA-256 da senha
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} Hash da senha em hexadecimal
 */
export async function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
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


