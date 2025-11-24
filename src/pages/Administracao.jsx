import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CriarUsuariosIniciais from "@/components/admin/CriarUsuariosIniciais";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Search, 
  Edit, 
  Mail,
  Calendar,
  Clock,
  Filter,
  Terminal,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Administracao() {
  const queryClient = useQueryClient();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConviteModal, setShowConviteModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [tipoConvite, setTipoConvite] = useState("");

  const [conviteForm, setConviteForm] = useState({
    nome: "",
    email: "",
    tipo_perfil: "",
    mensagem: ""
  });

  const [testadorAPI, setTestadorAPI] = useState({
    baseUrl: "",
    apiKey: "",
    clientEmail: "",
    endpoint: "auth",
    resultado: null,
    loading: false,
    copied: false
  });

  useEffect(() => {
    // Atualizar data do último acesso quando o componente carregar
    if (currentUser) {
      User.updateMe({
        ultimo_login: new Date().toISOString()
      }).catch(err => console.error('Erro ao atualizar último acesso:', err));
    }
  }, [currentUser]);

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios-admin'],
    queryFn: () => User.list('-created_at'),
    initialData: [],
    enabled: !authLoading && currentUser?.role === 'admin',
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-admin'] });
      queryClient.refetchQueries({ queryKey: ['usuarios-admin'] });
      setShowEditModal(false);
      setUsuarioEditando(null);
    },
  });

  const enviarConviteMutation = useMutation({
    mutationFn: async (dados) => {
      // Por enquanto, apenas criar o usuário sem enviar email
      // TODO: Implementar envio de email quando tiver integração
      const novoUsuario = await User.create({
        email: dados.email,
        senha: Math.random().toString(36).slice(-8), // Senha temporária
        nome: dados.nome,
        tipo_perfil: dados.tipo_perfil,
        role: 'user',
        status: 'ativo'
      });

      // TODO: Enviar email com credenciais quando tiver integração de email
      const mensagemEmail = `
Olá ${dados.nome}!

Você foi convidado para se juntar ao FitTrainer Pro como ${
  dados.tipo_perfil === 'personal_trainer' ? 'Personal Trainer' : 'Cliente'
}.

${dados.mensagem || ''}

Para completar seu cadastro, acesse o sistema e faça seu login.

Atenciosamente,
Equipe FitTrainer Pro
      `;

      console.log('Email que seria enviado:', {
        to: dados.email,
        subject: `Convite para FitTrainer Pro - ${dados.tipo_perfil === 'personal_trainer' ? 'Personal Trainer' : 'Cliente'}`,
        body: mensagemEmail
      });

      return novoUsuario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-admin'] });
      setShowConviteModal(false);
      setConviteForm({ nome: "", email: "", tipo_perfil: "", mensagem: "" });
      setTipoConvite("");
      alert("Usuário criado com sucesso! (Email não enviado - funcionalidade a ser implementada)");
    },
  });

  const usuariosFiltrados = usuarios.filter(user => {
    const matchSearch = searchTerm === "" || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filtroTipo === "" || user.tipo_perfil === filtroTipo;
    return matchSearch && matchTipo;
  });

  const abrirEditarPerfil = (usuario) => {
    setUsuarioEditando(usuario);
    setShowEditModal(true);
  };

  const salvarPerfil = () => {
    if (usuarioEditando.email === "mitsuoyoda@gmail.com" && usuarioEditando.tipo_perfil !== "administrador") {
      alert("Não é possível remover privilégios de administrador deste usuário");
      return;
    }

    updateUserMutation.mutate({
      id: usuarioEditando.id,
      data: { tipo_perfil: usuarioEditando.tipo_perfil }
    });
  };

  const abrirConvite = (tipo) => {
    setTipoConvite(tipo);
    setConviteForm({ ...conviteForm, tipo_perfil: tipo });
    setShowConviteModal(true);
  };

  const enviarConvite = () => {
    if (!conviteForm.nome || !conviteForm.email) {
      alert("Preencha nome e e-mail");
      return;
    }
    enviarConviteMutation.mutate(conviteForm);
  };

  const testarEndpoint = async () => {
    if (!testadorAPI.baseUrl) {
      alert("Por favor, insira a URL base da API");
      return;
    }

    setTestadorAPI({ ...testadorAPI, loading: true, resultado: null });

    try {
      let url = testadorAPI.baseUrl;
      let headers = {
        'Content-Type': 'application/json',
        'X-Client-Email': testadorAPI.clientEmail || 'teste@exemplo.com'
      };
      let body = null;

      if (testadorAPI.endpoint === 'auth') {
        body = JSON.stringify({ email: testadorAPI.clientEmail || 'teste@exemplo.com' });
      }

      const response = await fetch(url, {
        method: testadorAPI.endpoint === 'auth' ? 'POST' : 'GET',
        headers,
        ...(body && { body })
      });

      const data = await response.json();

      setTestadorAPI({
        ...testadorAPI,
        loading: false,
        resultado: {
          status: response.status,
          statusText: response.ok ? 'Sucesso' : 'Erro',
          data: data
        }
      });
    } catch (error) {
      setTestadorAPI({
        ...testadorAPI,
        loading: false,
        resultado: {
          status: 0,
          statusText: 'Erro de Conexão',
          data: { error: error.message }
        }
      });
    }
  };

  const copiarConfiguracoes = () => {
    const config = `// Configuração da API do Fitlow Pro
const FITLOW_PRO_API_URL = "${testadorAPI.baseUrl}";
const FITLOW_PRO_API_KEY = "${testadorAPI.apiKey || 'SUA_CHAVE_AQUI'}";

// Exemplo de uso:
const headers = {
  'Content-Type': 'application/json',
  'X-Client-Email': 'email@cliente.com'
};

fetch(FITLOW_PRO_API_URL, { headers })
  .then(res => res.json())
  .then(data => console.log(data));`;

    navigator.clipboard.writeText(config);
    setTestadorAPI({ ...testadorAPI, copied: true });
    setTimeout(() => {
      setTestadorAPI(prev => ({ ...prev, copied: false }));
    }, 2000);
  };

  const totalUsuarios = usuarios.length;
  const novosUsuarios = usuarios.filter(u => {
    const created = new Date(u.created_at || u.created_date);
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    return created > seteDiasAtras;
  }).length;

  const usuariosAtivosHoje = usuarios.filter(u => {
    if (!u.ultimo_login) return false;
    const ultimoAcesso = new Date(u.ultimo_login);
    const hoje = new Date();
    return ultimoAcesso.toDateString() === hoje.toDateString();
  }).length;

  if (authLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
            <p className="text-slate-600">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Acesso Negado</h2>
            <p className="text-slate-600">
              Você não tem permissão para acessar esta área.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Administração
          </h1>
          <p className="text-slate-600">Gerencie usuários, perfis e convites do sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="w-8 h-8 text-white/80" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{totalUsuarios}</p>
              <p className="text-blue-100 text-sm mt-2">Cadastrados no sistema</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-sm font-medium">Novos Usuários</CardTitle>
                <UserPlus className="w-8 h-8 text-white/80" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{novosUsuarios}</p>
              <p className="text-green-100 text-sm mt-2">Últimos 7 dias</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-none shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-sm font-medium">Ativos Hoje</CardTitle>
                <Clock className="w-8 h-8 text-white/80" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{usuariosAtivosHoje}</p>
              <p className="text-purple-100 text-sm mt-2">Acessaram hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Componente para criar usuários iniciais */}
        <CriarUsuariosIniciais />

        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-orange-600" />
              Testador de API Externa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                <p className="font-semibold mb-2">📋 Informações para Configuração da API:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li><strong>URL Base:</strong> https://[ID_DO_APP].base44.com/functions/[NOME_FUNCAO]</li>
                  <li><strong>Chave de API:</strong> Disponível em Secrets (FITLOW_PRO_API_KEY)</li>
                  <li><strong>Header obrigatório:</strong> X-Client-Email (email do cliente)</li>
                  <li><strong>Endpoints disponíveis:</strong> apiClientAuth, apiClientWorkouts, apiClientMessages, apiClientAppointments, apiClientAssessments</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL Base da API *</Label>
                  <Input
                    placeholder="https://[id].base44.com/functions/apiClientAuth"
                    value={testadorAPI.baseUrl}
                    onChange={(e) => setTestadorAPI({...testadorAPI, baseUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chave de API (opcional)</Label>
                  <Input
                    placeholder="SUA_CHAVE_API"
                    value={testadorAPI.apiKey}
                    onChange={(e) => setTestadorAPI({...testadorAPI, apiKey: e.target.value})}
                    type="password"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email do Cliente para Teste *</Label>
                  <Input
                    placeholder="cliente@exemplo.com"
                    value={testadorAPI.clientEmail}
                    onChange={(e) => setTestadorAPI({...testadorAPI, clientEmail: e.target.value})}
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Endpoint</Label>
                  <Select 
                    value={testadorAPI.endpoint} 
                    onValueChange={(value) => setTestadorAPI({...testadorAPI, endpoint: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auth">🔐 Autenticação (POST)</SelectItem>
                      <SelectItem value="workouts">💪 Treinos (GET)</SelectItem>
                      <SelectItem value="messages">💬 Mensagens (GET)</SelectItem>
                      <SelectItem value="appointments">📅 Agendamentos (GET)</SelectItem>
                      <SelectItem value="assessments">📊 Avaliações (GET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={testarEndpoint}
                  disabled={testadorAPI.loading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {testadorAPI.loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Terminal className="w-4 h-4 mr-2" />
                      Testar Endpoint
                    </>
                  )}
                </Button>
                <Button
                  onClick={copiarConfiguracoes}
                  variant="outline"
                  className="border-orange-200 hover:bg-orange-50"
                >
                  {testadorAPI.copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Configurações
                    </>
                  )}
                </Button>
              </div>

              {testadorAPI.resultado && (
                <div className={`rounded-lg border p-4 ${
                  testadorAPI.resultado.status === 200 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3 mb-3">
                    {testadorAPI.resultado.status === 200 ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        testadorAPI.resultado.status === 200 ? 'text-green-900' : 'text-red-900'
                      }`}>
                        Status: {testadorAPI.resultado.status} - {testadorAPI.resultado.statusText}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded p-3 mt-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Resposta:</p>
                    <pre className="text-xs text-slate-800 overflow-x-auto">
                      {JSON.stringify(testadorAPI.resultado.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gerenciar Usuários
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => abrirConvite("personal_trainer")}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convidar Personal
                </Button>
                <Button
                  onClick={() => abrirConvite("cliente")}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convidar Cliente
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todos os perfis</SelectItem>
                  <SelectItem value="administrador">👨‍💼 Administrador</SelectItem>
                  <SelectItem value="personal_trainer">💪 Personal Trainer</SelectItem>
                  <SelectItem value="cliente">🧑 Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosFiltrados.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.full_name}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Badge className={
                          usuario.tipo_perfil === 'administrador' ? 'bg-red-100 text-red-700' :
                          usuario.tipo_perfil === 'personal_trainer' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }>
                          {usuario.tipo_perfil === 'administrador' && '👨‍💼 Admin'}
                          {usuario.tipo_perfil === 'personal_trainer' && '💪 Personal'}
                          {usuario.tipo_perfil === 'cliente' && '🧑 Cliente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {format(new Date(usuario.created_at || usuario.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {usuario.ultimo_login 
                          ? format(new Date(usuario.ultimo_login), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : 'Nunca'
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirEditarPerfil(usuario)}
                          className="hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {usuariosFiltrados.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Nenhum usuário encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil do Usuário</DialogTitle>
          </DialogHeader>
          {usuarioEditando && (
            <div className="space-y-4">
              <div>
                <Label>Usuário</Label>
                <p className="font-semibold text-slate-900">{usuarioEditando.full_name}</p>
                <p className="text-sm text-slate-600">{usuarioEditando.email}</p>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Perfil</Label>
                <Select 
                  value={usuarioEditando.tipo_perfil || "personal_trainer"} 
                  onValueChange={(value) => setUsuarioEditando({...usuarioEditando, tipo_perfil: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrador">👨‍💼 Administrador</SelectItem>
                    <SelectItem value="personal_trainer">💪 Personal Trainer</SelectItem>
                    <SelectItem value="cliente">🧑 Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {usuarioEditando.email === "mitsuoyoda@gmail.com" && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <p className="text-xs text-amber-900">
                    ⚠️ Este é o usuário administrador principal. As permissões de administrador não podem ser removidas.
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={salvarPerfil}
                  disabled={updateUserMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateUserMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showConviteModal} onOpenChange={setShowConviteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Enviar Convite - {tipoConvite === 'personal_trainer' ? 'Personal Trainer' : 'Cliente'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                value={conviteForm.nome}
                onChange={(e) => setConviteForm({...conviteForm, nome: e.target.value})}
                placeholder="Nome do convidado"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={conviteForm.email}
                onChange={(e) => setConviteForm({...conviteForm, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Mensagem Personalizada (opcional)</Label>
              <Textarea
                value={conviteForm.mensagem}
                onChange={(e) => setConviteForm({...conviteForm, mensagem: e.target.value})}
                placeholder="Adicione uma mensagem personalizada ao convite..."
                rows={3}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-xs text-blue-900">
                💡 Um e-mail de convite será enviado com instruções para completar o cadastro no sistema.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowConviteModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={enviarConvite}
                disabled={enviarConviteMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                {enviarConviteMutation.isPending ? "Enviando..." : "Enviar Convite"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}