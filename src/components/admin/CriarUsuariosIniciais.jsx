import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Users } from 'lucide-react';
import { createInitialUsers } from '@/api/auth';
import { toast } from 'sonner';

export default function CriarUsuariosIniciais() {
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState(null);

  const handleCriarUsuarios = async () => {
    setLoading(true);
    setResultados(null);

    try {
      const resultados = await createInitialUsers();
      setResultados(resultados);
      
      const sucessos = resultados.filter(r => r.status === 'criado').length;
      const erros = resultados.filter(r => r.status === 'erro').length;
      const jaExistem = resultados.filter(r => r.status === 'já existe').length;

      if (sucessos > 0) {
        toast.success(`${sucessos} usuário(s) criado(s) com sucesso!`);
      }
      if (jaExistem > 0) {
        toast.info(`${jaExistem} usuário(s) já existiam`);
      }
      if (erros > 0) {
        toast.error(`${erros} erro(s) ao criar usuário(s)`);
      }
    } catch (error) {
      console.error('Erro ao criar usuários:', error);
      toast.error('Erro ao criar usuários. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const usuariosIniciais = [
    {
      email: 'admin@fittrainer.com',
      senha: 'admin123',
      nome: 'Administrador',
      role: 'admin',
      tipo_perfil: 'personal_trainer'
    },
    {
      email: 'trainer@fittrainer.com',
      senha: 'trainer123',
      nome: 'Personal Trainer',
      role: 'user',
      tipo_perfil: 'personal_trainer'
    },
    {
      email: 'cliente@fittrainer.com',
      senha: 'cliente123',
      nome: 'Cliente Teste',
      role: 'user',
      tipo_perfil: 'cliente'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Criar Usuários Iniciais
        </CardTitle>
        <CardDescription>
          Cria os usuários padrão do sistema. Execute apenas uma vez.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Usuários que serão criados:</h4>
          <div className="space-y-2">
            {usuariosIniciais.map((user, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{user.nome}</p>
                    <p className="text-xs text-slate-600">{user.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Senha: <span className="font-mono">{user.senha}</span>
                    </p>
                  </div>
                  <div className="text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleCriarUsuarios}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando usuários...
            </>
          ) : (
            'Criar Usuários Iniciais'
          )}
        </Button>

        {resultados && (
          <div className="space-y-2 mt-4">
            <h4 className="font-semibold text-sm">Resultados:</h4>
            {resultados.map((resultado, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  resultado.status === 'criado'
                    ? 'bg-green-50 border-green-200'
                    : resultado.status === 'já existe'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{resultado.email}</p>
                  <p className="text-xs text-slate-600">{resultado.message}</p>
                </div>
                <div>
                  {resultado.status === 'criado' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {resultado.status === 'já existe' && (
                    <CheckCircle className="w-5 h-5 text-yellow-600" />
                  )}
                  {resultado.status === 'erro' && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


