import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";

export default function DetalhamentoFinanceiro({ 
  open, 
  onClose, 
  tipo, 
  transacoes, 
  clientes 
}) {
  const getTitulo = () => {
    const titulos = {
      'total_receber': '💰 Total a Receber - Detalhamento',
      'total_recebido': '✅ Total Recebido - Detalhamento',
      'saldo_pendente': '⚠️ Saldo Pendente - Detalhamento',
      'clientes_debito': '👥 Clientes com Débito - Detalhamento'
    };
    return titulos[tipo] || 'Detalhamento Financeiro';
  };

  const getIcon = () => {
    const icons = {
      'total_receber': <DollarSign className="w-6 h-6 text-blue-600" />,
      'total_recebido': <TrendingUp className="w-6 h-6 text-green-600" />,
      'saldo_pendente': <Calendar className="w-6 h-6 text-orange-600" />,
      'clientes_debito': <Users className="w-6 h-6 text-red-600" />
    };
    return icons[tipo] || <DollarSign className="w-6 h-6" />;
  };

  const renderConteudo = () => {
    if (tipo === 'total_receber') {
      const aulasRealizadas = transacoes.filter(t => t.tipo_transacao === 'aula_realizada');
      const total = aulasRealizadas.reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);

      return (
        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-blue-700 mb-1">Valor Total a Receber</p>
                <p className="text-4xl font-bold text-blue-900">R$ {total.toFixed(2)}</p>
                <p className="text-xs text-blue-600 mt-1">{aulasRealizadas.length} aula(s) realizada(s)</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900">Detalhamento por Aula:</h4>
            {aulasRealizadas.map((transacao) => (
              <Card key={transacao.id} className="bg-blue-50 border border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900">{transacao.cliente_nome}</p>
                      <p className="text-xs text-slate-600 mt-1">{transacao.descricao || transacao.referencia || 'Transação'}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {format(new Date(transacao.data_transacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-600 text-white">
                        + R$ {parseFloat(transacao.valor || 0).toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    if (tipo === 'total_recebido') {
      const pagamentos = transacoes.filter(t => t.tipo_transacao === 'pagamento');
      const total = Math.abs(pagamentos.reduce((acc, t) => acc + parseFloat(t.valor || 0), 0));

      const metodosLabels = {
        dinheiro: '💵 Dinheiro',
        pix: '📱 PIX',
        cartao_credito: '💳 Cartão Crédito',
        cartao_debito: '💳 Cartão Débito',
        transferencia: '🏦 Transferência',
        nao_informado: '❓ Não Informado'
      };

      // Agrupar por método de pagamento
      const porMetodo = {};
      pagamentos.forEach(p => {
        const metodo = p.metodo_pagamento || 'nao_informado';
        if (!porMetodo[metodo]) {
          porMetodo[metodo] = { total: 0, quantidade: 0, transacoes: [] };
        }
        porMetodo[metodo].total += Math.abs(parseFloat(p.valor || 0));
        porMetodo[metodo].quantidade += 1;
        porMetodo[metodo].transacoes.push(p);
      });

      return (
        <div className="space-y-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-green-700 mb-1">Valor Total Recebido</p>
                <p className="text-4xl font-bold text-green-900">R$ {total.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">{pagamentos.length} pagamento(s) recebido(s)</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Por Método de Pagamento:</h4>
            {Object.entries(porMetodo).map(([metodo, dados]) => (
              <div key={metodo} className="space-y-2">
                <Card className="bg-green-100 border-green-300">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">
                          {metodosLabels[metodo] || '❓ Não Informado'}
                        </p>
                        <p className="text-xs text-slate-600">{dados.quantidade} pagamento(s)</p>
                      </div>
                      <Badge className="bg-green-600 text-white">
                        R$ {dados.total.toFixed(2)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="ml-4 space-y-1">
                  {dados.transacoes.map((transacao) => (
                    <Card key={transacao.id} className="bg-white border border-green-200">
                      <CardContent className="p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-900">{transacao.cliente_nome}</p>
                            <p className="text-[10px] text-slate-500">
                              {format(new Date(transacao.data_transacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-green-700">
                            R$ {Math.abs(parseFloat(transacao.valor || 0)).toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (tipo === 'saldo_pendente') {
      const totalAulas = transacoes
        .filter(t => t.tipo_transacao === 'aula_realizada')
        .reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);
      
      const totalPago = Math.abs(transacoes
        .filter(t => t.tipo_transacao === 'pagamento')
        .reduce((acc, t) => acc + parseFloat(t.valor || 0), 0));
      
      const saldo = totalAulas - totalPago;

      // Agrupar por cliente
      const porCliente = {};
      transacoes.forEach(t => {
        if (!porCliente[t.cliente_id]) {
          porCliente[t.cliente_id] = {
            nome: t.cliente_nome,
            aulas: 0,
            pagamentos: 0,
            saldo: 0
          };
        }
        if (t.tipo_transacao === 'aula_realizada') {
          porCliente[t.cliente_id].aulas += parseFloat(t.valor || 0);
        } else {
          porCliente[t.cliente_id].pagamentos += Math.abs(parseFloat(t.valor || 0));
        }
        porCliente[t.cliente_id].saldo = porCliente[t.cliente_id].aulas - porCliente[t.cliente_id].pagamentos;
      });

      const clientesComSaldo = Object.values(porCliente).filter(c => c.saldo > 0);

      return (
        <div className="space-y-4">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-orange-700 mb-1">Saldo Pendente Total</p>
                <p className="text-4xl font-bold text-orange-900">R$ {saldo.toFixed(2)}</p>
                <p className="text-xs text-orange-600 mt-1">
                  R$ {totalAulas.toFixed(2)} (aulas) - R$ {totalPago.toFixed(2)} (pago)
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900">Clientes com Saldo Pendente:</h4>
            {clientesComSaldo.length === 0 ? (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <p className="text-green-700">✅ Nenhum cliente com saldo pendente!</p>
                </CardContent>
              </Card>
            ) : (
              clientesComSaldo.map((cliente, index) => (
                <Card key={index} className="bg-orange-50 border border-orange-200">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900">{cliente.nome}</p>
                        <div className="mt-2 space-y-1 text-xs text-slate-600">
                          <p>💰 Total em aulas: R$ {cliente.aulas.toFixed(2)}</p>
                          <p>✅ Total pago: R$ {cliente.pagamentos.toFixed(2)}</p>
                        </div>
                      </div>
                      <Badge className="bg-orange-600 text-white">
                        Deve: R$ {cliente.saldo.toFixed(2)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      );
    }

    if (tipo === 'clientes_debito') {
      // Agrupar transações por cliente
      const porCliente = {};
      transacoes.forEach(t => {
        if (!porCliente[t.cliente_id]) {
          porCliente[t.cliente_id] = {
            nome: t.cliente_nome,
            saldo: 0,
            aulas: [],
            pagamentos: []
          };
        }
        porCliente[t.cliente_id].saldo += parseFloat(t.valor || 0);
        if (t.tipo_transacao === 'aula_realizada') {
          porCliente[t.cliente_id].aulas.push(t);
        } else {
          porCliente[t.cliente_id].pagamentos.push(t);
        }
      });

      const clientesComDebito = Object.entries(porCliente)
        .filter(([_, dados]) => dados.saldo > 0)
        .sort(([_, a], [__, b]) => b.saldo - a.saldo);

      return (
        <div className="space-y-4">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-red-700 mb-1">Clientes com Débito</p>
                <p className="text-4xl font-bold text-red-900">{clientesComDebito.length}</p>
                <p className="text-xs text-red-600 mt-1">
                  Total devido: R$ {clientesComDebito.reduce((acc, [_, c]) => acc + c.saldo, 0).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Lista de Clientes:</h4>
            {clientesComDebito.length === 0 ? (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <p className="text-green-700">✅ Nenhum cliente com débito!</p>
                </CardContent>
              </Card>
            ) : (
              clientesComDebito.map(([clienteId, dados]) => (
                <Card key={clienteId} className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-slate-900">{dados.nome}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          {dados.aulas.length} aula(s) realizada(s)
                        </p>
                      </div>
                      <Badge className="bg-red-600 text-white text-base">
                        R$ {dados.saldo.toFixed(2)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs">
                        <p className="font-semibold text-slate-700 mb-1">Aulas realizadas:</p>
                        {dados.aulas.slice(0, 3).map((aula) => (
                          <div key={aula.id} className="bg-white p-2 rounded border border-red-200 mb-1">
                            <div className="flex justify-between">
                              <span className="text-slate-600">{aula.descricao || aula.referencia || 'Aula realizada'}</span>
                              <span className="font-bold text-blue-700">+ R$ {parseFloat(aula.valor || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                        {dados.aulas.length > 3 && (
                          <p className="text-[10px] text-slate-500 text-center mt-1">
                            +{dados.aulas.length - 3} aula(s)
                          </p>
                        )}
                      </div>

                      {dados.pagamentos.length > 0 && (
                        <div className="text-xs">
                          <p className="font-semibold text-slate-700 mb-1">Pagamentos:</p>
                          {dados.pagamentos.map((pag) => (
                            <div key={pag.id} className="bg-white p-2 rounded border border-green-200 mb-1">
                              <div className="flex justify-between">
                                <span className="text-slate-600">
                                  {format(new Date(pag.data_transacao), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                                <span className="font-bold text-green-700">- R$ {Math.abs(pag.valor).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getIcon()}
            {getTitulo()}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {renderConteudo()}
        </div>
      </DialogContent>
    </Dialog>
  );
}