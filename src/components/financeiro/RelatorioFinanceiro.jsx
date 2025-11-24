import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RelatorioFinanceiro({ open, onClose, transacoes, clientes }) {
  const [dataInicio, setDataInicio] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [dataFim, setDataFim] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  // Filtrar transações por período
  const transacoesFiltradas = transacoes.filter(t => {
    const dataTransacao = new Date(t.data_transacao);
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    return dataTransacao >= inicio && dataTransacao <= fim;
  });

  // Calcular totais
  const totalAulas = transacoesFiltradas
    .filter(t => t.tipo_transacao === 'aula_realizada')
    .reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);

  const totalPagamentos = Math.abs(transacoesFiltradas
    .filter(t => t.tipo_transacao === 'pagamento')
    .reduce((acc, t) => acc + parseFloat(t.valor || 0), 0));

  const saldoPendente = totalAulas - totalPagamentos;

  // Agrupar por cliente
  const transacoesPorCliente = {};
  transacoesFiltradas.forEach(t => {
    if (!transacoesPorCliente[t.cliente_id]) {
      transacoesPorCliente[t.cliente_id] = {
        cliente_nome: t.cliente_nome,
        aulas: 0,
        valor_aulas: 0,
        pagamentos: 0,
        saldo: 0
      };
    }

    if (t.tipo_transacao === 'aula_realizada') {
      transacoesPorCliente[t.cliente_id].aulas++;
      transacoesPorCliente[t.cliente_id].valor_aulas += parseFloat(t.valor || 0);
    } else {
      transacoesPorCliente[t.cliente_id].pagamentos += Math.abs(parseFloat(t.valor || 0));
    }

    transacoesPorCliente[t.cliente_id].saldo = 
      transacoesPorCliente[t.cliente_id].valor_aulas - 
      transacoesPorCliente[t.cliente_id].pagamentos;
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Relatório Financeiro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filtros de Período */}
          <Card className="bg-slate-50">
            <CardContent className="p-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Resumo */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total em Aulas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">R$ {totalAulas.toFixed(2)}</p>
                <p className="text-sm opacity-75 mt-1">
                  {transacoesFiltradas.filter(t => t.tipo_transacao === 'aula_realizada').length} aulas realizadas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Total Recebido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">R$ {totalPagamentos.toFixed(2)}</p>
                <p className="text-sm opacity-75 mt-1">
                  {transacoesFiltradas.filter(t => t.tipo_transacao === 'pagamento').length} pagamentos
                </p>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br ${
              saldoPendente > 0 ? 'from-orange-500 to-orange-600' : 'from-purple-500 to-purple-600'
            } border-none text-white`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Saldo Pendente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">R$ {saldoPendente.toFixed(2)}</p>
                <p className="text-sm opacity-75 mt-1">
                  {saldoPendente > 0 ? 'A receber' : 'Quitado'}
                </p>
              </CardContent>
            </Card>
          </div>


          {/* Detalhamento por Cliente */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Detalhamento por Cliente</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {Object.entries(transacoesPorCliente).map(([clienteId, dados]) => (
                  <div key={clienteId} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">{dados.cliente_nome}</h4>
                      <Badge 
                        variant={dados.saldo > 0 ? "destructive" : "default"}
                        className={dados.saldo > 0 ? "" : "bg-green-600"}
                      >
                        Saldo: R$ {dados.saldo.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                      <div>
                        <p className="font-medium">Aulas</p>
                        <p>{dados.aulas} aulas</p>
                      </div>
                      <div>
                        <p className="font-medium">Total Aulas</p>
                        <p>R$ {dados.valor_aulas.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-medium">Pagamentos</p>
                        <p>R$ {dados.pagamentos.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lista de Transações */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">
                Todas as Transações ({transacoesFiltradas.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 max-h-80 overflow-y-auto">
              <div className="space-y-2">
                {transacoesFiltradas.map((transacao) => (
                  <div 
                    key={transacao.id}
                    className={`p-3 rounded-lg ${
                      transacao.tipo_transacao === 'pagamento' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900">
                          {transacao.cliente_nome}
                        </p>
                        <p className="text-xs text-slate-600">{transacao.descricao || transacao.referencia || 'Transação'}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {format(new Date(transacao.data_transacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          parseFloat(transacao.valor || 0) < 0 ? 'text-green-700' : 'text-blue-700'
                        }`}>
                          {parseFloat(transacao.valor || 0) < 0 ? '-' : '+'} R$ {Math.abs(parseFloat(transacao.valor || 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}