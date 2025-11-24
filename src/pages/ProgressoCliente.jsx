
import React, { useState } from "react";
import { Cliente, ProgressoCliente as ProgressoClienteAPI, Avaliacao, HistoricoTreino } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, TrendingUp, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, parseISO } from "date-fns";
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

import GraficoEvolucao from "../components/progresso/GraficoEvolucao";
import FormularioProgresso from "../components/progresso/FormularioProgresso";
import TimelineProgresso from "../components/progresso/TimelineProgresso";
import ComparacaoMetas from "../components/progresso/ComparacaoMetas";
import HistoricoTreinos from "../components/progresso/HistoricoTreinos";

export default function ProgressoCliente() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const clienteId = urlParams.get('cliente_id');

  const [showFormulario, setShowFormulario] = useState(false);
  const [progressoEditando, setProgressoEditando] = useState(null);
  const [progressoParaExcluir, setProgressoParaExcluir] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('graficos');

  const { data: cliente } = useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: () => Cliente.get(clienteId),
    enabled: !!clienteId && !authLoading && isAuthenticated,
  });

  const { data: progressos = [] } = useQuery({
    queryKey: ['progressos-cliente', clienteId],
    queryFn: () => ProgressoClienteAPI.filter({ cliente_id: parseInt(clienteId) }),
    enabled: !!clienteId && !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: avaliacoes = [] } = useQuery({
    queryKey: ['avaliacoes-cliente', clienteId],
    queryFn: () => Avaliacao.filter({ cliente_id: parseInt(clienteId) }),
    enabled: !!clienteId && !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: historicoTreinos = [] } = useQuery({
    queryKey: ['historico-treinos-cliente', clienteId],
    queryFn: () => HistoricoTreino.filter({ cliente_id: parseInt(clienteId) }),
    enabled: !!clienteId && !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const createProgressoMutation = useMutation({
    mutationFn: (data) => ProgressoClienteAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progressos-cliente', clienteId] });
      queryClient.invalidateQueries({ queryKey: ['progressos'] });
      queryClient.refetchQueries({ queryKey: ['progressos-cliente', clienteId] });
      setShowFormulario(false);
      setProgressoEditando(null);
    },
  });

  const updateProgressoMutation = useMutation({
    mutationFn: ({ id, data }) => ProgressoClienteAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progressos-cliente', clienteId] });
      queryClient.invalidateQueries({ queryKey: ['progressos'] });
      queryClient.refetchQueries({ queryKey: ['progressos-cliente', clienteId] });
      setShowFormulario(false);
      setProgressoEditando(null);
    },
  });

  const deleteProgressoMutation = useMutation({
    mutationFn: (id) => ProgressoClienteAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progressos-cliente', clienteId] });
      queryClient.invalidateQueries({ queryKey: ['progressos'] });
      queryClient.refetchQueries({ queryKey: ['progressos-cliente', clienteId] });
      setProgressoParaExcluir(null);
    },
  });

  const handleSubmit = (data) => {
    const dataToSubmit = {
      ...data,
      cliente_id: clienteId,
      cliente_nome: cliente?.nome || ""
    };

    if (progressoEditando) {
      updateProgressoMutation.mutate({ id: progressoEditando.id, data: dataToSubmit });
    } else {
      createProgressoMutation.mutate(dataToSubmit);
    }
  };

  const handleEditar = (progresso) => {
    setProgressoEditando(progresso);
    setShowFormulario(true);
  };

  const confirmarExclusao = () => {
    if (progressoParaExcluir) {
      deleteProgressoMutation.mutate(progressoParaExcluir.id);
    }
  };

  if (!cliente) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Carregando...</p>
      </div>
    );
  }

  // Calcular estatísticas
  const ultimoProgresso = progressos[0];
  const primeiroProgresso = progressos[progressos.length - 1];
  const primeiraAvaliacao = avaliacoes[avaliacoes.length - 1];

  const pesoInicial = primeiraAvaliacao?.peso || primeiroProgresso?.peso;
  const pesoAtual = ultimoProgresso?.peso || avaliacoes[0]?.peso;
  const variacaoPeso = pesoInicial && pesoAtual ? pesoAtual - pesoInicial : null;

  const gorduraInicial = primeiraAvaliacao?.percentual_gordura || primeiroProgresso?.percentual_gordura;
  const gorduraAtual = ultimoProgresso?.percentual_gordura || avaliacoes[0]?.percentual_gordura;
  const variacaoGordura = gorduraInicial && gorduraAtual ? gorduraAtual - gorduraInicial : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Progresso"))}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Progresso: {cliente.nome}
              </h1>
              <p className="text-sm md:text-base text-slate-600">
                {cliente.objetivo || 'Sem objetivo definido'}
              </p>
            </div>
            <Button
              onClick={() => {
                setProgressoEditando(null);
                setShowFormulario(true);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Registro
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Total de Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{progressos.length}</p>
            </CardContent>
          </Card>

          {pesoInicial && pesoAtual && (
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">Evolução de Peso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900">{pesoAtual}</p>
                  <span className="text-sm text-slate-600">kg</span>
                </div>
                {variacaoPeso !== null && (
                  <div className={`flex items-center gap-1 mt-2 ${
                    variacaoPeso < 0 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${variacaoPeso < 0 ? 'rotate-180' : ''}`} />
                    <span className="text-sm font-semibold">
                      {variacaoPeso > 0 ? '+' : ''}{variacaoPeso.toFixed(1)} kg desde o início
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {gorduraInicial && gorduraAtual && (
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">% Gordura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900">{gorduraAtual}</p>
                  <span className="text-sm text-slate-600">%</span>
                </div>
                {variacaoGordura !== null && (
                  <div className={`flex items-center gap-1 mt-2 ${
                    variacaoGordura < 0 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${variacaoGordura < 0 ? 'rotate-180' : ''}`} />
                    <span className="text-sm font-semibold">
                      {variacaoGordura > 0 ? '+' : ''}{variacaoGordura.toFixed(1)}% desde o início
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Treinos Executados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{historicoTreinos.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            variant={abaAtiva === 'graficos' ? 'default' : 'outline'}
            onClick={() => setAbaAtiva('graficos')}
            className={abaAtiva === 'graficos' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            📊 Gráficos
          </Button>
          <Button
            variant={abaAtiva === 'timeline' ? 'default' : 'outline'}
            onClick={() => setAbaAtiva('timeline')}
            className={abaAtiva === 'timeline' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            📅 Timeline
          </Button>
          <Button
            variant={abaAtiva === 'metas' ? 'default' : 'outline'}
            onClick={() => setAbaAtiva('metas')}
            className={abaAtiva === 'metas' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            🎯 Metas
          </Button>
          <Button
            variant={abaAtiva === 'treinos' ? 'default' : 'outline'}
            onClick={() => setAbaAtiva('treinos')}
            className={abaAtiva === 'treinos' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            🏋️ Histórico de Treinos
          </Button>
        </div>

        {/* Conteúdo das Abas */}
        {abaAtiva === 'graficos' && (
          <GraficoEvolucao 
            progressos={progressos} 
            avaliacoes={avaliacoes}
          />
        )}

        {abaAtiva === 'timeline' && (
          <TimelineProgresso
            progressos={progressos}
            avaliacoes={avaliacoes}
            onEditar={handleEditar}
            onExcluir={(progresso) => setProgressoParaExcluir(progresso)}
          />
        )}

        {abaAtiva === 'metas' && (
          <ComparacaoMetas
            cliente={cliente}
            progressos={progressos}
            avaliacoes={avaliacoes}
          />
        )}

        {abaAtiva === 'treinos' && (
          <HistoricoTreinos historicos={historicoTreinos} />
        )}
      </div>

      {/* Formulário de Progresso */}
      {showFormulario && (
        <FormularioProgresso
          progresso={progressoEditando}
          open={showFormulario}
          onClose={() => {
            setShowFormulario(false);
            setProgressoEditando(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {/* Dialog de Exclusão */}
      <AlertDialog open={!!progressoParaExcluir} onOpenChange={() => setProgressoParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro de progresso? Esta ação não pode ser desfeita.
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
