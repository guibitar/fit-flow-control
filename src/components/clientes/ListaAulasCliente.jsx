
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, Edit, XCircle, Eye, User } from "lucide-react";
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

import AgendarAulaForm from "@/components/calendario/AgendarAulaForm";
import TreinoVisualizacao from "@/components/treinos/TreinoVisualizacao";

export default function ListaAulasCliente({ clienteId, clienteNome, open, onClose }) {
  const queryClient = useQueryClient();
  const [aulaEditando, setAulaEditando] = useState(null);
  const [showFormEditar, setShowFormEditar] = useState(false);
  const [aulaParaCancelar, setAulaParaCancelar] = useState(null);
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [showTreino, setShowTreino] = useState(false);

  const { data: aulas = [], isLoading } = useQuery({
    queryKey: ['aulas-cliente-lista', clienteId],
    queryFn: async () => {
      const todasAulas = await base44.entities.Aula.list('-data');
      return todasAulas.filter(aula => 
        aula.alunos?.some(aluno => aluno.cliente_id === clienteId)
      );
    },
    initialData: [],
    enabled: open && !!clienteId,
  });

  const { data: treinos = [] } = useQuery({
    queryKey: ['treinos-aulas-cliente'],
    queryFn: () => base44.entities.Treino.list(),
    initialData: [],
  });

  const updateAulaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Aula.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aulas-cliente-lista', clienteId] });
      queryClient.invalidateQueries({ queryKey: ['aulas-cliente', clienteId] });
      queryClient.invalidateQueries({ queryKey: ['aulas'] });
      setShowFormEditar(false);
      setAulaEditando(null);
      setAulaParaCancelar(null);
    },
  });

  const handleEditar = (aula) => {
    setAulaEditando(aula);
    setShowFormEditar(true);
  };

  const handleSubmitEdicao = (data) => {
    if (aulaEditando) {
      updateAulaMutation.mutate({ id: aulaEditando.id, data });
    }
  };

  const confirmarCancelamento = () => {
    if (aulaParaCancelar) {
      updateAulaMutation.mutate({
        id: aulaParaCancelar.id,
        data: { ...aulaParaCancelar, status: 'cancelada' }
      });
    }
  };

  const handleVerTreino = (treinoId) => {
    const treino = treinos.find(t => t.id === treinoId);
    if (treino) {
      setTreinoSelecionado(treino);
      setShowTreino(true);
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

  const aulasPassadas = aulas.filter(a => {
    const [ano, mes, dia] = a.data.split('-').map(Number);
    const dataAula = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    dataAula.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);
    return dataAula < hoje;
  });

  const aulasFuturas = aulas.filter(a => {
    const [ano, mes, dia] = a.data.split('-').map(Number);
    const dataAula = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    dataAula.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);
    return dataAula >= hoje;
  });

  return (
    <>
      <Dialog open={open && !showFormEditar} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-green-600" />
              Aulas de {clienteNome}
            </DialogTitle>
            <p className="text-sm text-slate-600">
              {aulasFuturas.length} aula(s) futura(s) • {aulasPassadas.length} aula(s) passada(s)
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : aulas.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="font-semibold text-slate-900 mb-2">
                  Nenhuma aula agendada
                </h3>
                <p className="text-sm text-slate-600">
                  Este cliente ainda não possui aulas agendadas
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Aulas Futuras */}
                {aulasFuturas.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      Próximas Aulas ({aulasFuturas.length})
                    </h3>
                    <div className="space-y-3">
                      {aulasFuturas.map((aula) => {
                        const alunoNaAula = aula.alunos?.find(a => a.cliente_id === clienteId);
                        const [ano, mes, dia] = aula.data.split('-').map(Number);
                        const dataAula = new Date(ano, mes - 1, dia);
                        
                        return (
                          <Card key={aula.id} className={`border-2 ${
                            aula.status === 'agendada' ? 'border-blue-200 bg-blue-50' :
                            aula.status === 'realizada' ? 'border-green-200 bg-green-50' :
                            'border-red-200 bg-red-50'
                          }`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CalendarDays className="w-4 h-4 text-slate-600" />
                                    <span className="font-bold text-slate-900">
                                      {format(dataAula, "dd/MM/yyyy - EEEE", { locale: ptBR })}
                                    </span>
                                    <Badge className={getStatusColor(aula.status)}>
                                      {getStatusLabel(aula.status)}
                                    </Badge>
                                  </div>

                                  <div className="space-y-1 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3 h-3" />
                                      <span>{aula.horario} ({aula.duracao_minutos} min)</span>
                                    </div>
                                    {aula.local && (
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3" />
                                        <span>{aula.local}</span>
                                      </div>
                                    )}
                                    {alunoNaAula?.treino_titulo && (
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">📋 Treino:</span>
                                        <button
                                          onClick={() => handleVerTreino(alunoNaAula.treino_id)}
                                          className="text-blue-600 hover:text-blue-700 hover:underline"
                                        >
                                          {alunoNaAula.treino_titulo}
                                        </button>
                                      </div>
                                    )}
                                    {aula.alunos?.length > 1 && (
                                      <div className="flex items-center gap-2">
                                        <User className="w-3 h-3" />
                                        <span>Aula em grupo ({aula.alunos.length} alunos)</span>
                                      </div>
                                    )}
                                  </div>

                                  {aula.observacoes && (
                                    <p className="mt-2 text-xs text-slate-600 bg-white p-2 rounded border">
                                      <strong>Obs:</strong> {aula.observacoes}
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-col gap-2 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditar(aula)}
                                    className="hover:bg-green-50 hover:text-green-700"
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Editar
                                  </Button>
                                  {aula.status === 'agendada' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setAulaParaCancelar(aula)}
                                      className="hover:bg-red-50 hover:text-red-700"
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Cancelar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Aulas Passadas */}
                {aulasPassadas.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Aulas Anteriores ({aulasPassadas.length})
                    </h3>
                    <div className="space-y-3">
                      {aulasPassadas.slice(0, 5).map((aula) => {
                        const alunoNaAula = aula.alunos?.find(a => a.cliente_id === clienteId);
                        const [ano, mes, dia] = aula.data.split('-').map(Number);
                        const dataAula = new Date(ano, mes - 1, dia);
                        
                        return (
                          <Card key={aula.id} className="border-slate-200 bg-slate-50 opacity-75">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm text-slate-700">
                                      {format(dataAula, "dd/MM/yyyy", { locale: ptBR })}
                                    </span>
                                    <span className="text-xs text-slate-500">{aula.horario}</span>
                                    <Badge className={getStatusColor(aula.status)}>
                                      {getStatusLabel(aula.status)}
                                    </Badge>
                                  </div>
                                  {alunoNaAula?.treino_titulo && (
                                    <p className="text-xs text-slate-600">
                                      📋 {alunoNaAula.treino_titulo}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditar(aula)}
                                  className="hover:bg-slate-200"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                      {aulasPassadas.length > 5 && (
                        <p className="text-xs text-slate-500 text-center">
                          +{aulasPassadas.length - 5} aulas anteriores
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showFormEditar && (
        <AgendarAulaForm
          aula={aulaEditando}
          open={showFormEditar}
          onClose={() => {
            setShowFormEditar(false);
            setAulaEditando(null);
          }}
          onSubmit={handleSubmitEdicao}
        />
      )}

      <TreinoVisualizacao
        treino={treinoSelecionado}
        open={showTreino}
        onClose={() => {
          setShowTreino(false);
          setTreinoSelecionado(null);
        }}
      />

      <AlertDialog open={!!aulaParaCancelar} onOpenChange={() => setAulaParaCancelar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a aula do dia{" "}
              {aulaParaCancelar && format(new Date(aulaParaCancelar.data), "dd/MM/yyyy", { locale: ptBR })}{" "}
              às {aulaParaCancelar?.horario}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarCancelamento}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
