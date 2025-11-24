import { hashPassword } from '../utils/auth.js';
import Usuario from '../models/Usuario.js';
import { syncDatabase } from '../config/database.js';

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Sincronizar banco
    await syncDatabase(false);

    // Usuários iniciais
    const usuariosIniciais = [
      {
        email: 'admin@fittrainer.com',
        senha: 'admin123',
        nome: 'Administrador',
        role: 'admin',
        tipo_perfil: 'personal_trainer',
        status: 'ativo'
      },
      {
        email: 'trainer@fittrainer.com',
        senha: 'trainer123',
        nome: 'Personal Trainer',
        role: 'user',
        tipo_perfil: 'personal_trainer',
        status: 'ativo'
      },
      {
        email: 'cliente@fittrainer.com',
        senha: 'cliente123',
        nome: 'Cliente Teste',
        role: 'user',
        tipo_perfil: 'cliente',
        status: 'ativo'
      }
    ];

    for (const userData of usuariosIniciais) {
      // Verificar se já existe
      const existe = await Usuario.findOne({ where: { email: userData.email } });
      
      if (existe) {
        console.log(`⏭️  Usuário ${userData.email} já existe, pulando...`);
        continue;
      }

      // Hash da senha
      const senhaHash = await hashPassword(userData.senha);

      // Criar usuário
      await Usuario.create({
        email: userData.email,
        senha_hash: senhaHash,
        nome: userData.nome,
        full_name: userData.nome,
        role: userData.role,
        tipo_perfil: userData.tipo_perfil,
        status: userData.status
      });

      console.log(`✅ Usuário ${userData.email} criado com sucesso!`);
    }

    console.log('✅ Seed concluído!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seed();


