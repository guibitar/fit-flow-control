import React, { useState } from "react";
import { Cliente, Treino, Avaliacao, Aula, TransacaoFinanceira } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Dumbbell, TrendingUp, Calendar, Edit, Trash2, Eye, Check, Send, Video, MapPin, Clock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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

import TreinoVisualizacao from "../components/treinos/TreinoVisualizacao";
import CompartilharAgenda from "../components/agenda/CompartilharAgenda";
import CompartilharTreino from "../components/calendario/CompartilharTreino";
import AgendarAulaForm from "../components/calendario/AgendarAulaForm";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [showTreinoVisualizacao, setShowTreinoVisualizacao] = useState(false);
  const [treinoParaExcluir, setTreinoParaExcluir] = useState(null);
  const [showCompartilharAgenda, setShowCompartilharAgenda] = useState(false);
  const [showCompartilharTreino, setShowCompartilharTreino] = useState(false);
  const [treinoParaCompartilhar, setTreinoParaCompartilhar] = useState(null);
  const [clienteParaCompartilhar, setClienteParaCompartilhar] = useState(null);
  const [showEditarAula, setShowEditarAula] = useState(false);
  const [aulaEditando, setAulaEditando] = useState(null);

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => Cliente.list('-created_at'),
    initialData: [],
    enabled: !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: treinos = [] } = useQuery({
    queryKey: ['treinos'],
    queryFn: () => Treino.list('-created_at'),
    initialData: [],
    enabled: !authLoading && isAuthenticated,
    staleTime: 0, // Always refetch
    cacheTime: 0, // No cache
    refetchOnMount: true, // Refetch on component mount
    refetchOnWindowFocus: false, // Prevent refetching on window focus
  });

  const { data: avaliacoes = [] } = useQuery({
    queryKey: ['avaliacoes'],
    queryFn: () => Avaliacao.list('-data_avaliacao'),
    initialData: [],
    enabled: !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: aulas = [] } = useQuery({
    queryKey: ['aulas'],
    queryFn: () => Aula.list('-data'),
    initialData: [],
    enabled: !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Detectar mudanças no calendário após exportação
  const [temMudancas, setTemMudancas] = React.useState(false);

  React.useEffect(() => {
    const ultimaExportacao = localStorage.getItem('ultima_exportacao_calendario');
    if (ultimaExportacao && aulas.length > 0) {
      const hashAulas = JSON.stringify(aulas.map(a => ({ id: a.id, data: a.data, status: a.status, updated_at: a.updated_at })));
      const hashSalvo = localStorage.getItem('hash_aulas_exportadas');
      
      if (hashSalvo && hashAulas !== hashSalvo) {
        setTemMudancas(true);
      }
    }
  }, [aulas]);

  const deleteTreinoMutation = useMutation({
    mutationFn: (id) => Treino.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      queryClient.refetchQueries({ queryKey: ['treinos'] }); // Explicitly refetch
      setTreinoParaExcluir(null);
    },
  });

  const updateAulaMutation = useMutation({
    mutationFn: ({ id, data }) => Aula.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aulas'] });
    },
  });

  const createTransacaoMutation = useMutation({
    mutationFn: (data) => TransacaoFinanceira.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
    },
  });

  const clientesAtivos = clientes.filter(c => c.status === 'ativo').length;
  const treinosEnviados = treinos.length;

  // Aulas de hoje
  const hoje = new Date().toISOString().split('T')[0];
  const aulasHoje = aulas.filter(aula => aula.data === hoje && aula.status !== 'cancelada');

  // Calcular próximas ações pendentes
  // Ações pendentes: aulas agendadas futuras + aulas de hoje não realizadas
  const hojeDate = new Date();
  hojeDate.setHours(0, 0, 0, 0);
  
  const proximasAcoes = aulas.filter(aula => {
    if (aula.status === 'cancelada' || aula.status === 'realizada') return false;
    
    // Aulas de hoje que ainda não foram realizadas
    if (aula.data === hoje) return true;
    
    // Aulas futuras
    const [ano, mes, dia] = aula.data.split('-').map(Number);
    const dataAula = new Date(ano, mes - 1, dia);
    dataAula.setHours(0, 0, 0, 0);
    
    return dataAula >= hojeDate;
  }).length;

  const abrirTreino = (treino) => {
    setTreinoSelecionado(treino);
    setShowTreinoVisualizacao(true);
  };

  const confirmarExclusao = () => {
    if (treinoParaExcluir) {
      deleteTreinoMutation.mutate(treinoParaExcluir.id);
    }
  };

  const handleCheckIn = async (aula, aluno) => {
    const cliente = clientes.find(c => c.id === aluno.cliente_id);
    const now = new Date();
    const horarioCheckIn = format(now, "HH:mm");
    const localCheckIn = aula.local || "Academia";

    const alunosAtualizados = aula.alunos.map(a => {
      if (a.cliente_id === aluno.cliente_id) {
        return {
          ...a,
          check_in_realizado: true,
          check_in_horario: horarioCheckIn,
          check_in_local: localCheckIn,
          valor_aula_registrado: cliente?.valor_aula || 0
        };
      }
      return a;
    });

    try {
      await updateAulaMutation.mutateAsync({
        id: aula.id,
        data: { ...aula, alunos: alunosAtualizados }
      });

      const [ano, mes, diaAula] = aula.data.split('-').map(Number);
      const dataAula = new Date(ano, mes - 1, diaAula);
      const [hora, minuto] = aula.horario.split(':').map(Number);
      dataAula.setHours(hora, minuto, 0, 0);

      const transacao = {
        cliente_id: parseInt(aluno.cliente_id),
        tipo_transacao: "aula_realizada",
        data_transacao: dataAula.toISOString(),
        valor: parseFloat(cliente?.valor_aula || 0),
        descricao: `Aula realizada - ${format(dataAula, "dd/MM/yyyy", { locale: ptBR })} às ${aula.horario}`,
        aula_id: parseInt(aula.id)
      };

      await createTransacaoMutation.mutateAsync(transacao);
    } catch (error) {
      console.error("Erro ao realizar check-in:", error);
    }
  };

  const handleVerTreino = (treinoId) => {
    const treino = treinos.find(t => t.id === treinoId);
    if (treino) {
      setTreinoSelecionado(treino);
      setShowTreinoVisualizacao(true);
    }
  };

  const handleCompartilharTreino = (treinoId, clienteId) => {
    const treino = treinos.find(t => t.id === treinoId);
    const cliente = clientes.find(c => c.id === clienteId);
    
    if (treino && cliente) {
      setTreinoParaCompartilhar(treino);
      setClienteParaCompartilhar(cliente);
      setShowCompartilharTreino(true);
    }
  };

  const handleEditarAula = (aula) => {
    setAulaEditando(aula);
    setShowEditarAula(true);
  };

  const handleCancelarAula = (aulaId) => {
    if (confirm("Deseja realmente cancelar esta aula?")) {
      const aula = aulasHoje.find(a => a.id === aulaId);
      updateAulaMutation.mutate({ 
        id: aulaId, 
        data: { ...aula, status: 'cancelada' }
      });
    }
  };

  const handleSalvarAula = (data) => {
    if (aulaEditando) {
      updateAulaMutation.mutate({ id: aulaEditando.id, data });
    }
    setShowEditarAula(false);
    setAulaEditando(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      agendada: 'bg-blue-100 text-blue-700',
      realizada: 'bg-green-100 text-green-700',
      cancelada: 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.agendada;
  };

  const getStatusLabel = (status) => {
    const labels = {
      agendada: 'Agendada',
      realizada: 'Realizada',
      cancelada: 'Cancelada'
    };
    return labels[status] || status;
  };

  return (
    <div className="p-3 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 lg:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 md:mb-2">Dashboard</h1>
            <p className="text-sm md:text-base text-slate-600">Bem-vindo ao seu painel de controle</p>
          </div>
          <Button
            onClick={() => {
              setShowCompartilharAgenda(true);
              setTemMudancas(false);
            }}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 min-h-[44px] relative"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Exportar Agenda
            {temMudancas && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 md:pb-3 p-3 md:p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-xs md:text-sm font-medium">Total de Clientes</CardTitle>
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white/80" />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <p className="text-2xl md:text-4xl font-bold text-white">{clientes.length}</p>
              <p className="text-blue-100 text-xs md:text-sm mt-1 md:mt-2">{clientesAtivos} ativos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 md:pb-3 p-3 md:p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-xs md:text-sm font-medium">Treinos Criados</CardTitle>
                <Dumbbell className="w-6 h-6 md:w-8 md:h-8 text-white/80" />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <p className="text-2xl md:text-4xl font-bold text-white">{treinosEnviados}</p>
              <p className="text-green-100 text-xs md:text-sm mt-1 md:mt-2">Este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 md:pb-3 p-3 md:p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-xs md:text-sm font-medium">Avaliações</CardTitle>
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white/80" />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <p className="text-2xl md:text-4xl font-bold text-white">{avaliacoes.length}</p>
              <p className="text-purple-100 text-xs md:text-sm mt-1 md:mt-2">Realizadas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 md:pb-3 p-3 md:p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-xs md:text-sm font-medium">Próximas Ações</CardTitle>
                <Calendar className="w-6 h-6 md:w-8 md:h-8 text-white/80" />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <p className="text-2xl md:text-4xl font-bold text-white">{proximasAcoes}</p>
              <p className="text-orange-100 text-xs md:text-sm mt-1 md:mt-2">Pendentes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="shadow-lg">
            <CardHeader className="border-b border-slate-200 p-4 md:p-6">
              <div className="flex justify-between items-center gap-3">
                <CardTitle className="text-base md:text-lg">Agendados para Hoje</CardTitle>
                <Link to={createPageUrl("Calendario")}>
                  <Button size="sm" variant="outline" className="min-h-[44px]">
                    Ver Calendário
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {aulasHoje.length === 0 ? (
                <div className="text-center py-6 md:py-8 text-slate-500">
                  <Calendar className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm md:text-base">Nenhuma aula agendada para hoje</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aulasHoje.map((aula) => (
                    <Card key={aula.id} className={`border-2 ${
                      aula.status === 'agendada' ? 'border-blue-200 bg-blue-50' :
                      aula.status === 'realizada' ? 'border-green-200 bg-green-50' :
                      'border-red-200 bg-red-50'
                    }`}>
                      <CardContent className="p-3 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-600" />
                            <span className="font-bold text-slate-900 text-sm">{aula.horario}</span>
                            <Badge className={getStatusColor(aula.status) + " text-xs"}>
                              {getStatusLabel(aula.status)}
                            </Badge>
                          </div>
                          <span className="text-xs text-slate-600">{aula.duracao_minutos} min</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          {aula.tipo_aula === 'online' ? (
                            <>
                              <Video className="w-3 h-3 text-purple-600" />
                              <span className="font-medium text-purple-700">Online</span>
                              {aula.link_online && (
                                <a 
                                  href={aula.link_online} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 underline"
                                >
                                  Acessar
                                </a>
                              )}
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3 h-3 text-slate-600" />
                              <span className="text-slate-700">{aula.local || 'Local não informado'}</span>
                            </>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-700 uppercase">
                            Alunos ({aula.alunos?.length || 0})
                          </p>
                          {aula.alunos?.map((aluno, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-3 h-3 text-slate-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-xs text-slate-900 truncate">
                                    {aluno.cliente_nome}
                                  </p>
                                  {aluno.treino_titulo && (
                                    <p className="text-[10px] text-slate-600 truncate">
                                      📋 {aluno.treino_titulo}
                                    </p>
                                  )}
                                  {aluno.check_in_realizado && (
                                    <Badge className="bg-green-600 text-white text-[9px] mt-1">
                                      ✓ Check-in: {aluno.check_in_horario}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                {aluno.treino_id && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleVerTreino(aluno.treino_id)}
                                      className="hover:bg-blue-100 hover:text-blue-700 h-7 w-7 p-0"
                                      title="Ver treino"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleCompartilharTreino(aluno.treino_id, aluno.cliente_id)}
                                      className="hover:bg-green-100 hover:text-green-700 h-7 w-7 p-0"
                                      title="Compartilhar treino"
                                    >
                                      <Send className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                                {!aluno.check_in_realizado && aula.status !== 'cancelada' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleCheckIn(aula, aluno)}
                                    className="bg-orange-600 hover:bg-orange-700 h-7 text-xs px-2"
                                    disabled={updateAulaMutation.isPending || createTransacaoMutation.isPending}
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    {updateAulaMutation.isPending || createTransacaoMutation.isPending ? "..." : "Check-in"}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {aula.observacoes && (
                          <div className="p-2 bg-white rounded border text-[10px] text-slate-700">
                            <span className="font-semibold">Obs:</span> {aula.observacoes}
                          </div>
                        )}

                        {aula.status !== 'cancelada' && (
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditarAula(aula)}
                              className="flex-1 h-8 text-xs"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                            {aula.status === 'agendada' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelarAula(aula.id)}
                                className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="border-b border-slate-200 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="text-base md:text-lg">Treinos Recentes</CardTitle>
                <Link to={createPageUrl("CriarTreino")}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto min-h-[44px]">
                    Criar Novo
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {treinos.length === 0 ? (
                <div className="text-center py-6 md:py-8 text-slate-500">
                  <Dumbbell className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm md:text-base">Nenhum treino criado ainda</p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {treinos.slice(0, 5).map((treino) => (
                    <div 
                      key={treino.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all group gap-2"
                    >
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <p className="font-medium text-slate-900 truncate text-sm md:text-base">{treino.titulo}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <p className="text-xs md:text-sm text-slate-500 truncate">{treino.cliente_nome}</p>
                          <span className="text-[10px] md:text-xs px-2 py-0.5 md:py-1 bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
                            {treino.tipo}
                          </span>
                          {treino.exercicios?.length > 0 && (
                            <span className="text-[10px] md:text-xs text-slate-500 whitespace-nowrap">
                              {treino.exercicios.length} exercícios
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 md:gap-2 w-full sm:w-auto justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => abrirTreino(treino)}
                          className="hover:bg-blue-100 hover:text-blue-700 min-w-[44px] min-h-[44px]"
                          title="Visualizar treino"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => navigate(createPageUrl("EditarTreino") + `?id=${treino.id}`)}
                          className="hover:bg-blue-100 hover:text-blue-700 min-w-[44px] min-h-[44px]"
                          title="Editar treino"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setTreinoParaExcluir(treino)}
                          className="hover:bg-red-100 hover:text-red-700 min-w-[44px] min-h-[44px]"
                          title="Excluir treino"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>


        </div>
      </div>

      <TreinoVisualizacao 
        treino={treinoSelecionado}
        open={showTreinoVisualizacao}
        onClose={() => {
          setShowTreinoVisualizacao(false);
          setTreinoSelecionado(null);
        }}
      />

      <CompartilharAgenda
        open={showCompartilharAgenda}
        onClose={() => setShowCompartilharAgenda(false)}
      />

      <CompartilharTreino
        treino={treinoParaCompartilhar}
        cliente={clienteParaCompartilhar}
        open={showCompartilharTreino}
        onClose={() => {
          setShowCompartilharTreino(false);
          setTreinoParaCompartilhar(null);
          setClienteParaCompartilhar(null);
        }}
      />

      {showEditarAula && (
        <AgendarAulaForm
          aula={aulaEditando}
          open={showEditarAula}
          onClose={() => {
            setShowEditarAula(false);
            setAulaEditando(null);
          }}
          onSubmit={handleSalvarAula}
        />
      )}

      <AlertDialog open={!!treinoParaExcluir} onOpenChange={() => setTreinoParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o treino "{treinoParaExcluir?.titulo}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}