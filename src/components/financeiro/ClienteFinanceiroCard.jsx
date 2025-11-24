import React, { useState } from "react";
import { Aula, TransacaoFinanceira } from "@/api/entities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, DollarSign, Check, Calendar, Clock, MapPin, XCircle } from "lucide-react";
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

import LancarPagamentoForm from "./LancarPagamentoForm";

export default function ClienteFinanceiroCard({ cliente, aulas, transacoes }) {
  const queryClient = useQueryClient();
  const [expandido, setExpandido] = useState(false);
  const [showPagamentoForm, setShowPagamentoForm] = useState(false);
  const [aulaParaCancelar, setAulaParaCancelar] = useState(null);
  const [processandoCheckIn, setProcessandoCheckIn] = useState(false);

  const updateAulaMutation = useMutation({
    mutationFn: ({ id, data }) => Aula.update(id, data),
  });

  const createTransacaoMutation = useMutation({
    mutationFn: (data) => TransacaoFinanceira.create(data),
  });

  const deleteTransacoesMutation = useMutation({
    mutationFn: async (aulaId) => {
      // Buscar todas as transações e deletar as que são desta aula
      const todasTransacoes = await TransacaoFinanceira.list();
      const transacoesDaAula = todasTransacoes.filter(t => t.aula_id === aulaId);
      
      // Deletar cada transação
      await Promise.all(
        transacoesDaAula.map(t => TransacaoFinanceira.delete(t.id))
      );
    }
  });

  const cancelarAulaMutation = useMutation({
    mutationFn: ({ id, data }) => Aula.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aulas'] });
      queryClient.refetchQueries({ queryKey: ['aulas'] });
      setAulaParaCancelar(null);
    },
  });

  const handleCheckIn = async (aula, aluno) => {
    setProcessandoCheckIn(true);
    const now = new Date();
    const horarioCheckIn = format(now, "HH:mm");
    const localCheckIn = aula.local || "Academia";

    try {
      // 1. Atualizar aula com check-in
      const alunosAtualizados = aula.alunos.map(a => {
        if (a.cliente_id === aluno.cliente_id) {
          return {
            ...a,
            check_in_realizado: true,
            check_in_horario: horarioCheckIn,
            check_in_local: localCheckIn,
            valor_aula_registrado: cliente.valor_aula || 0
          };
        }
        return a;
      });

      await updateAulaMutation.mutateAsync({
        id: aula.id,
        data: { ...aula, alunos: alunosAtualizados }
      });

      // 2. Criar transação financeira
      const transacao = {
        cliente_id: parseInt(cliente.id),
        cliente_nome: cliente.nome || '',
        tipo_transacao: "aula_realizada",
        data_transacao: new Date(aula.data + ' ' + aula.horario).toISOString(),
        valor: parseFloat(cliente.valor_aula || 0),
        descricao: `Aula realizada - ${format(new Date(aula.data), "dd/MM/yyyy", { locale: ptBR })} às ${aula.horario}`,
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
    } finally {
      setProcessandoCheckIn(false);
    }
  };

  const handleCancelarAula = async () => {
    if (aulaParaCancelar) {
      try {
        // 1. Deletar transações associadas à aula
        await deleteTransacoesMutation.mutateAsync(aulaParaCancelar.id);
        
        // 2. Atualizar status da aula para cancelada
        await cancelarAulaMutation.mutateAsync({
          id: aulaParaCancelar.id,
          data: { ...aulaParaCancelar, status: 'cancelada' }
        });

        // 3. Invalidar queries
        queryClient.invalidateQueries({ queryKey: ['transacoes'] });
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
        queryClient.refetchQueries({ queryKey: ['transacoes'] });
      } catch (error) {
        console.error("Erro ao cancelar aula:", error);
      }
    }
  };

  const handlePagamento = async (pagamento) => {
    try {
      await createTransacaoMutation.mutateAsync(pagamento);
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.refetchQueries({ queryKey: ['transacoes'] });
      setShowPagamentoForm(false);
    } catch (error) {
      console.error("Erro ao lançar pagamento:", error);
    }
  };

  // Calcular saldo a pagar
  const saldoAPagar = transacoes.reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);

  // Filtrar TODAS as aulas deste cliente (agendadas e realizadas)
  const aulasDoCliente = aulas.filter(a => 
    a.alunos?.some(aluno => aluno.cliente_id === cliente.id) &&
    a.status !== 'cancelada'
  );

  // Separar aulas por status
  const aulasAgendadas = aulasDoCliente.filter(a => {
    const aluno = a.alunos?.find(al => al.cliente_id === cliente.id);
    return !aluno?.check_in_realizado;
  });

  const aulasRealizadas = aulasDoCliente.filter(a => {
    const aluno = a.alunos?.find(al => al.cliente_id === cliente.id);
    return aluno?.check_in_realizado;
  });

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow border-2">
        <CardHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {cliente.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-lg">{cliente.nome}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={saldoAPagar > 0 ? "destructive" : "default"}
                    className={saldoAPagar > 0 ? "" : "bg-green-600"}
                  >
                    Saldo: R$ {saldoAPagar.toFixed(2)}
                  </Badge>
                  {cliente.valor_aula && (
                    <Badge variant="outline" className="text-xs">
                      Aula: R$ {parseFloat(cliente.valor_aula || 0).toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setShowPagamentoForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Pagamento
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpandido(!expandido)}
              >
                {expandido ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {expandido && (
          <CardContent className="p-4 space-y-4">
            {/* Aulas Agendadas (sem check-in) */}
            {aulasAgendadas.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Aulas Agendadas ({aulasAgendadas.length})
                </h4>
                <div className="space-y-2">
                  {aulasAgendadas.map((aula) => {
                    const aluno = aula.alunos.find(a => a.cliente_id === cliente.id);
                    const isPast = new Date(aula.data) < new Date();
                    return (
                      <div key={aula.id} className={`p-3 rounded-lg border-2 ${
                        isPast ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Calendar className="w-3 h-3 text-slate-600 flex-shrink-0" />
                              <span className="font-medium text-sm">
                                {format(new Date(aula.data), "dd/MM/yyyy - EEEE", { locale: ptBR })}
                              </span>
                              <span className="text-xs text-slate-600">{aula.horario}</span>
                              {isPast && (
                                <Badge className="bg-orange-600 text-white text-[10px]">
                                  Pendente
                                </Badge>
                              )}
                            </div>
                            {aula.local && (
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <MapPin className="w-3 h-3" />
                                {aula.local}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleCheckIn(aula, aluno)}
                              className={isPast ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}
                              disabled={processandoCheckIn}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              {processandoCheckIn ? "..." : "Check-in"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAulaParaCancelar(aula)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={processandoCheckIn}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Aulas com Check-in Realizado */}
            {aulasRealizadas.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Aulas Realizadas ({aulasRealizadas.length})
                </h4>
                <div className="space-y-2">
                  {aulasRealizadas.slice(0, 5).map((aula) => {
                    const aluno = aula.alunos.find(a => a.cliente_id === cliente.id);
                    return (
                      <div key={aula.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {format(new Date(aula.data), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                              <Badge className="bg-green-600 text-white text-[10px]">
                                Check-in: {aluno.check_in_horario}
                              </Badge>
                            </div>
                            {aluno.valor_aula_registrado && (
                              <p className="text-xs text-slate-600">
                                Valor: R$ {parseFloat(aluno.valor_aula_registrado || 0).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {aulasRealizadas.length > 5 && (
                    <p className="text-xs text-slate-500 text-center">
                      +{aulasRealizadas.length - 5} aulas realizadas
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Sem aulas */}
            {aulasAgendadas.length === 0 && aulasRealizadas.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-sm">
                <p>Nenhuma aula agendada para este cliente</p>
              </div>
            )}

            {/* Histórico de Transações */}
            {transacoes.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-3">
                  Últimas Transações
                </h4>
                <div className="space-y-1">
                  {transacoes.slice(0, 5).map((transacao) => (
                    <div 
                      key={transacao.id} 
                      className={`p-2 rounded text-xs flex items-center justify-between ${
                        transacao.tipo_transacao === 'pagamento' 
                          ? 'bg-green-50 text-green-800' 
                          : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{transacao.descricao || transacao.referencia || 'Transação'}</p>
                        <p className="text-[10px] opacity-75">
                          {format(new Date(transacao.data_transacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <span className={`font-bold ${parseFloat(transacao.valor || 0) < 0 ? 'text-green-700' : 'text-blue-700'}`}>
                        {parseFloat(transacao.valor || 0) < 0 ? '-' : '+'} R$ {Math.abs(parseFloat(transacao.valor || 0)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <LancarPagamentoForm
        open={showPagamentoForm}
        onClose={() => setShowPagamentoForm(false)}
        cliente={cliente}
        onSubmit={handlePagamento}
      />

      <AlertDialog open={!!aulaParaCancelar} onOpenChange={() => setAulaParaCancelar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a aula do dia{" "}
              {aulaParaCancelar && format(new Date(aulaParaCancelar.data), "dd/MM/yyyy", { locale: ptBR })}{" "}
              às {aulaParaCancelar?.horario}?
              <br /><br />
              <strong className="text-red-600">As transações financeiras associadas a esta aula serão removidas.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelarAula}
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