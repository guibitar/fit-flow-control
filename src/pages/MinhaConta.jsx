
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  LogOut, 
  MessageSquare, 
  AlertTriangle,
  Send,
  Dumbbell,
  Save,
  Edit
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MinhaConta() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [editandoDados, setEditandoDados] = useState(false);
  const [showExcluirDialog, setShowExcluirDialog] = useState(false);
  const [showConfirmacaoExclusao, setShowConfirmacaoExclusao] = useState(false);
  const [confirmacaoTexto, setConfirmacaoTexto] = useState("");
  const [showAlterarSenha, setShowAlterarSenha] = useState(false);
  const [tipoMensagem, setTipoMensagem] = useState("");

  const [dadosUsuario, setDadosUsuario] = useState({
    full_name: "",
    telefone: "",
    data_nascimento: "",
  });

  const [senhaForm, setSenhaForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: ""
  });

  const [mensagemForm, setMensagemForm] = useState({
    tipo: "",
    assunto: "",
    mensagem: ""
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        setDadosUsuario({
          full_name: user.full_name || "",
          telefone: user.telefone || "",
          data_nascimento: user.data_nascimento || "",
        });
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  const { data: personalTrainer } = useQuery({
    queryKey: ['personal-trainer', currentUser?.personal_responsavel_id],
    queryFn: async () => {
      if (!currentUser?.personal_responsavel_id) return null;
      const usuarios = await base44.entities.User.list();
      return usuarios.find(u => u.id === currentUser.personal_responsavel_id);
    },
    enabled: !!currentUser?.personal_responsavel_id,
  });

  const updateDadosMutation = useMutation({
    mutationFn: async (data) => {
      return base44.auth.updateMe(data);
    },
    onSuccess: async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      setEditandoDados(false);
      alert("Dados atualizados com sucesso!");
    },
  });

  const enviarMensagemMutation = useMutation({
    mutationFn: async (dados) => {
      if (!personalTrainer) {
        throw new Error("Personal trainer não encontrado");
      }

      const tipoLabel = dados.tipo === 'sugestao' ? 'Sugestão' : 'Reclamação';
      const mensagemEmail = `
${tipoLabel} de ${currentUser.full_name}

Assunto: ${dados.assunto}

Mensagem:
${dados.mensagem}

---
Cliente: ${currentUser.full_name}
E-mail: ${currentUser.email}
Data: ${new Date().toLocaleString('pt-BR')}
      `;

      return base44.integrations.Core.SendEmail({
        to: personalTrainer.email,
        subject: `[FitTrainer Pro] ${tipoLabel}: ${dados.assunto}`,
        body: mensagemEmail,
        from_name: `${currentUser.full_name} (Cliente)`
      });
    },
    onSuccess: () => {
      setMensagemForm({ tipo: "", assunto: "", mensagem: "" });
      setTipoMensagem("");
      alert("Mensagem enviada com sucesso!");
    },
  });

  const excluirContaMutation = useMutation({
    mutationFn: async () => {
      // Notificar personal trainer
      if (personalTrainer) {
        await base44.integrations.Core.SendEmail({
          to: personalTrainer.email,
          subject: "[FitTrainer Pro] Cliente excluiu a conta",
          body: `
O cliente ${currentUser.full_name} (${currentUser.email}) excluiu a conta do sistema.

Os treinos criados para este cliente permanecem disponíveis em sua biblioteca para uso futuro com outros clientes.

Data: ${new Date().toLocaleString('pt-BR')}
          `,
          from_name: "FitTrainer Pro Sistema"
        });
      }

      // Excluir conta do usuário
      await base44.entities.User.delete(currentUser.id);
      
      // Fazer logout e redirecionar
      window.location.href = '/';
    },
  });

  const handleSalvarDados = () => {
    updateDadosMutation.mutate(dadosUsuario);
  };

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  const handleEnviarMensagem = () => {
    if (!mensagemForm.assunto || !mensagemForm.mensagem) {
      alert("Preencha o assunto e a mensagem");
      return;
    }
    enviarMensagemMutation.mutate(mensagemForm);
  };

  const handleExcluirConta = () => {
    if (confirmacaoTexto.toUpperCase() !== "EXCLUIR") {
      alert('Por favor, digite "EXCLUIR" para confirmar');
      return;
    }
    excluirContaMutation.mutate();
  };

  if (!currentUser) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Minha Conta</h1>
          <p className="text-slate-600">Gerencie seus dados e configurações</p>
        </div>

        {/* Meus Dados */}
        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-200">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Meus Dados
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditandoDados(!editandoDados)}
              >
                <Edit className="w-4 h-4 mr-2" />
                {editandoDados ? "Cancelar" : "Editar"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={dadosUsuario.full_name}
                  onChange={(e) => setDadosUsuario({...dadosUsuario, full_name: e.target.value})}
                  disabled={!editandoDados}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  value={currentUser.email}
                  disabled
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={dadosUsuario.telefone}
                  onChange={(e) => setDadosUsuario({...dadosUsuario, telefone: e.target.value})}
                  disabled={!editandoDados}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={dadosUsuario.data_nascimento}
                  onChange={(e) => setDadosUsuario({...dadosUsuario, data_nascimento: e.target.value})}
                  disabled={!editandoDados}
                />
              </div>
            </div>

            {editandoDados && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleSalvarDados}
                  disabled={updateDadosMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateDadosMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meu Personal Trainer */}
        {currentUser.personal_responsavel_id && (
          <Card className="shadow-lg">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Meu Personal Trainer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {personalTrainer ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">
                      {personalTrainer.full_name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{personalTrainer.full_name}</h3>
                    <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {personalTrainer.email}
                    </p>
                    {personalTrainer.telefone && (
                      <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4" />
                        {personalTrainer.telefone}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">Você ainda não possui um personal trainer vinculado.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Comunicação */}
        {currentUser.personal_responsavel_id && personalTrainer && (
          <Card className="shadow-lg">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comunicação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {!tipoMensagem ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => {
                      setTipoMensagem("sugestao");
                      setMensagemForm({...mensagemForm, tipo: "sugestao"});
                    }}
                    className="bg-green-600 hover:bg-green-700 h-24 flex flex-col gap-2"
                  >
                    <Send className="w-6 h-6" />
                    <span>Enviar Sugestão</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setTipoMensagem("reclamacao");
                      setMensagemForm({...mensagemForm, tipo: "reclamacao"});
                    }}
                    className="bg-orange-600 hover:bg-orange-700 h-24 flex flex-col gap-2"
                  >
                    <AlertTriangle className="w-6 h-6" />
                    <span>Enviar Reclamação</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      {tipoMensagem === "sugestao" ? "📝 Enviar Sugestão" : "📢 Enviar Reclamação"}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTipoMensagem("");
                        setMensagemForm({ tipo: "", assunto: "", mensagem: "" });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Assunto *</Label>
                    <Input
                      value={mensagemForm.assunto}
                      onChange={(e) => setMensagemForm({...mensagemForm, assunto: e.target.value})}
                      placeholder="Digite o assunto"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mensagem *</Label>
                    <Textarea
                      value={mensagemForm.mensagem}
                      onChange={(e) => setMensagemForm({...mensagemForm, mensagem: e.target.value})}
                      placeholder="Descreva sua sugestão ou reclamação..."
                      rows={6}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-sm text-blue-900">
                      💡 Sua mensagem será enviada para {personalTrainer.full_name}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleEnviarMensagem}
                      disabled={enviarMensagemMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {enviarMensagemMutation.isPending ? "Enviando..." : "Enviar Mensagem"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sessão */}
        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              Sessão
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Desconectar da conta</p>
                <p className="text-sm text-slate-600">Encerrar sua sessão atual</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-slate-300 hover:bg-slate-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Zona de Perigo */}
        <Card className="shadow-lg border-red-200">
          <CardHeader className="border-b border-red-200 bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Excluir minha conta</p>
                <p className="text-sm text-slate-600">Esta ação é irreversível e permanente</p>
              </div>
              <Button
                onClick={() => setShowExcluirDialog(true)}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Excluir Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Aviso de Exclusão */}
      <AlertDialog open={showExcluirDialog} onOpenChange={setShowExcluirDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              Atenção! Exclusão de Conta
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left">
              <p className="font-semibold text-slate-900">Antes de continuar, saiba que:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span>⚠️</span>
                  <span>Sua conta será permanentemente excluída</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>⚠️</span>
                  <span>Todos os seus dados pessoais serão removidos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>⚠️</span>
                  <span>Você não poderá recuperar esses dados posteriormente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>⚠️</span>
                  <span>Seu personal trainer será notificado</span>
                </li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mt-4">
                <p className="text-sm text-blue-900">
                  💡 <strong>Nota:</strong> Os treinos criados pelo seu personal trainer serão mantidos como modelos para uso futuro.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar, quero manter minha conta</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowExcluirDialog(false);
                setShowConfirmacaoExclusao(true);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Continuar com a exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação Final */}
      <AlertDialog open={showConfirmacaoExclusao} onOpenChange={setShowConfirmacaoExclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Você tem certeza absoluta?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-left">
              <p className="font-semibold text-slate-900">
                Esta é sua última chance de cancelar. Esta ação NÃO pode ser desfeita.
              </p>
              
              <div className="space-y-2">
                <Label>Digite "EXCLUIR" para confirmar:</Label>
                <Input
                  value={confirmacaoTexto}
                  onChange={(e) => setConfirmacaoTexto(e.target.value)}
                  placeholder="Digite EXCLUIR"
                  className="font-mono"
                />
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-sm text-red-900 font-semibold">
                  ⚠️ Após confirmar, sua conta será excluída imediatamente e você será desconectado do sistema.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmacaoTexto("")}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluirConta}
              disabled={confirmacaoTexto.toUpperCase() !== "EXCLUIR" || excluirContaMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {excluirContaMutation.isPending ? "Excluindo..." : "Sim, excluir minha conta permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
