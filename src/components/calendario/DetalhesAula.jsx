
import React, { useState } from "react";
import { Treino, Cliente, Aula, TransacaoFinanceira } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MapPin, Edit, XCircle, User, Eye, X, Check, Video, Send } from "lucide-react";

import TreinoVisualizacao from "@/components/treinos/TreinoVisualizacao";
import CompartilharTreino from "@/components/calendario/CompartilharTreino";

export default function DetalhesAula({ dia, aulas, onEditar, onCancelar, onFechar }) {
  const queryClient = useQueryClient();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [showTreino, setShowTreino] = useState(false);
  const [showCompartilhar, setShowCompartilhar] = useState(false);
  const [treinoParaCompartilhar, setTreinoParaCompartilhar] = useState(null);
  const [clienteParaCompartilhar, setClienteParaCompartilhar] = useState(null);

  const { data: treinos = [] } = useQuery({
    queryKey: ['treinos-detalhes'],
    queryFn: () => Treino.list('-created_at'),
    initialData: [],
    enabled: !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => Cliente.list('-created_at'),
    initialData: [],
    enabled: !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  const updateAulaMutation = useMutation({
    mutationFn: ({ id, data }) => Aula.update(id, data),
  });

  const createTransacaoMutation = useMutation({
    mutationFn: (data) => TransacaoFinanceira.create(data),
  });

  const handleCheckIn = async (aula, aluno) => {
    const cliente = clientes.find(c => c.id === aluno.cliente_id);
    const now = new Date();
    const horarioCheckIn = format(now, "HH:mm");
    const localCheckIn = aula.local || "Academia";

    // Atualizar aula com check-in
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
      // 1. Atualizar aula
      await updateAulaMutation.mutateAsync({
        id: aula.id,
        data: { ...aula, alunos: alunosAtualizados }
      });

      // 2. Criar transação financeira - CORRIGIR DATA
      const [ano, mes, diaAula] = aula.data.split('-').map(Number);
      const dataAula = new Date(ano, mes - 1, diaAula);
      const [hora, minuto] = aula.horario.split(':').map(Number);
      dataAula.setHours(hora, minuto, 0, 0);

      const transacao = {
        cliente_id: parseInt(aluno.cliente_id),
        tipo_transacao: "aula_realizada",
        data_transacao: dataAula.toISOString(),
        valor: cliente?.valor_aula || 0,
        descricao: `Aula realizada - ${format(dataAula, "dd/MM/yyyy", { locale: ptBR })} às ${aula.horario}`,
        aula_id: parseInt(aula.id)
      };

      await createTransacaoMutation.mutateAsync(transacao);

      // 3. Invalidar todas as queries necessárias
      queryClient.invalidateQueries({ queryKey: ['aulas'] });
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.refetchQueries({ queryKey: ['aulas'] });
      queryClient.refetchQueries({ queryKey: ['transacoes'] });
    } catch (error) {
      console.error("Erro ao realizar check-in:", error);
    }
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

  const handleVerTreino = (treinoId) => {
    const treino = treinos.find(t => t.id === treinoId);
    if (treino) {
      setTreinoSelecionado(treino);
      setShowTreino(true);
    }
  };

  const handleCompartilharTreino = (treinoId, clienteId) => {
    const treino = treinos.find(t => t.id === treinoId);
    const cliente = clientes.find(c => c.id === clienteId);
    
    if (treino && cliente) {
      setTreinoParaCompartilhar(treino);
      setClienteParaCompartilhar(cliente);
      setShowCompartilhar(true);
    }
  };

  return (
    <>
      <Card className="shadow-lg sticky top-4">
        <CardHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">
                {format(dia, "d 'de' MMMM", { locale: ptBR })}
              </CardTitle>
              <p className="text-sm text-slate-600 capitalize">
                {format(dia, "EEEE", { locale: ptBR })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onFechar}
              className="hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {aulas.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">Nenhuma aula agendada para este dia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aulas.map((aula) => (
                <Card key={aula.id} className={`border-2 ${
                  aula.status === 'agendada' ? 'border-blue-200 bg-blue-50' :
                  aula.status === 'realizada' ? 'border-green-200 bg-green-50' :
                  'border-red-200 bg-red-50'
                }`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <span className="font-bold text-slate-900">{aula.horario}</span>
                        <Badge className={getStatusColor(aula.status)}>
                          {getStatusLabel(aula.status)}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-600">{aula.duracao_minutos} min</span>
                    </div>

                    {/* Tipo e Local/Link da Aula */}
                    <div className="flex items-center gap-2 text-sm">
                      {aula.tipo_aula === 'online' ? (
                        <>
                          <Video className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-purple-700">Aula Online</span>
                          {aula.link_online && (
                            <a 
                              href={aula.link_online} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 underline text-xs ml-2"
                            >
                              Acessar link
                            </a>
                          )}
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 text-slate-600" />
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
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm text-slate-900 truncate">
                                {aluno.cliente_nome}
                              </p>
                              {aluno.treino_titulo && (
                                <p className="text-xs text-slate-600 truncate">
                                  📋 {aluno.treino_titulo}
                                </p>
                              )}
                              {aluno.check_in_realizado && (
                                <Badge className="bg-green-600 text-white text-[10px] mt-1">
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
                                  className="hover:bg-blue-100 hover:text-blue-700"
                                  title="Ver treino"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCompartilharTreino(aluno.treino_id, aluno.cliente_id)}
                                  className="hover:bg-green-100 hover:text-green-700"
                                  title="Compartilhar treino"
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {!aluno.check_in_realizado && aula.status !== 'cancelada' && (
                              <Button
                                size="sm"
                                onClick={() => handleCheckIn(aula, aluno)}
                                className="bg-orange-600 hover:bg-orange-700"
                                disabled={updateAulaMutation.isPending || createTransacaoMutation.isPending}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                {updateAulaMutation.isPending || createTransacaoMutation.isPending ? "..." : "Check-in"}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {aula.observacoes && (
                      <div className="p-2 bg-white rounded border text-xs text-slate-700">
                        <span className="font-semibold">Obs:</span> {aula.observacoes}
                      </div>
                    )}

                    {aula.status !== 'cancelada' && (
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditar(aula)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        {aula.status === 'agendada' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCancelar(aula.id)}
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
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

      <TreinoVisualizacao
        treino={treinoSelecionado}
        open={showTreino}
        onClose={() => {
          setShowTreino(false);
          setTreinoSelecionado(null);
        }}
      />

      <CompartilharTreino
        treino={treinoParaCompartilhar}
        cliente={clienteParaCompartilhar}
        open={showCompartilhar}
        onClose={() => {
          setShowCompartilhar(false);
          setTreinoParaCompartilhar(null);
          setClienteParaCompartilhar(null);
        }}
      />
    </>
  );
}
