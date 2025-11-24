import React, { useState } from "react";
import { Cliente, Aula, TransacaoFinanceira } from "@/api/entities";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, BarChart3, Search, X } from "lucide-react";

import ClienteFinanceiroCard from "@/components/financeiro/ClienteFinanceiroCard";
import RelatorioFinanceiro from "@/components/financeiro/RelatorioFinanceiro";
import DetalhamentoFinanceiro from "@/components/financeiro/DetalhamentoFinanceiro";

export default function Financeiro() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [detalhamento, setDetalhamento] = useState({ open: false, tipo: null });

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

  const { data: transacoes = [] } = useQuery({
    queryKey: ['transacoes'],
    queryFn: () => TransacaoFinanceira.list('-data_transacao'),
    initialData: [],
    enabled: !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Filtrar clientes ativos
  const clientesAtivos = clientes.filter(c => c.status === 'ativo');

  // Filtrar clientes por busca
  const clientesFiltrados = clientesAtivos.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular totais gerais
  const totalRecebiveis = transacoes
    .filter(t => t.tipo_transacao === 'aula_realizada')
    .reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);

  const totalRecebido = Math.abs(transacoes
    .filter(t => t.tipo_transacao === 'pagamento')
    .reduce((acc, t) => acc + parseFloat(t.valor || 0), 0));

  const saldoTotal = totalRecebiveis - totalRecebido;

  // Contar clientes com saldo pendente
  const clientesComDebito = {};
  transacoes.forEach(t => {
    if (!clientesComDebito[t.cliente_id]) {
      clientesComDebito[t.cliente_id] = 0;
    }
    clientesComDebito[t.cliente_id] += parseFloat(t.valor || 0);
  });

  const clientesComSaldo = Object.values(clientesComDebito).filter(saldo => saldo > 0).length;

  const abrirDetalhamento = (tipo) => {
    setDetalhamento({ open: true, tipo });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                Financeiro
              </h1>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                Controle financeiro completo de aulas e pagamentos
              </p>
            </div>
            <Button 
              onClick={() => setShowRelatorio(true)}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all w-full md:w-auto"
              size="lg"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Ver Relatório
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Cards de Resumo - AGORA CLICÁVEIS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card 
            className="bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-lg text-white cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
            onClick={() => abrirDetalhamento('total_receber')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total a Receber
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {totalRecebiveis.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-1">
                {transacoes.filter(t => t.tipo_transacao === 'aula_realizada').length} aulas
              </p>
              <p className="text-[10px] opacity-60 mt-2">👆 Clique para ver detalhes</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-green-500 to-green-600 border-none shadow-lg text-white cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
            onClick={() => abrirDetalhamento('total_recebido')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Recebido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {totalRecebido.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-1">
                {transacoes.filter(t => t.tipo_transacao === 'pagamento').length} pagamentos
              </p>
              <p className="text-[10px] opacity-60 mt-2">👆 Clique para ver detalhes</p>
            </CardContent>
          </Card>

          <Card 
            className={`bg-gradient-to-br ${
              saldoTotal > 0 ? 'from-orange-500 to-orange-600' : 'from-purple-500 to-purple-600'
            } border-none shadow-lg text-white cursor-pointer hover:shadow-xl hover:scale-105 transition-all`}
            onClick={() => abrirDetalhamento('saldo_pendente')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Saldo Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {saldoTotal.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-1">
                {saldoTotal > 0 ? 'A receber' : 'Quitado'}
              </p>
              <p className="text-[10px] opacity-60 mt-2">👆 Clique para ver detalhes</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-slate-700 to-slate-800 border-none shadow-lg text-white cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
            onClick={() => abrirDetalhamento('clientes_debito')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Clientes com Débito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{clientesComSaldo}</p>
              <p className="text-xs opacity-75 mt-1">
                de {clientesAtivos.length} clientes ativos
              </p>
              <p className="text-[10px] opacity-60 mt-2">👆 Clique para ver detalhes</p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Buscar cliente por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-white shadow-sm border-slate-300 h-12 text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="space-y-4">
          {clientesFiltrados.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente ativo"}
                </h3>
                <p className="text-slate-600">
                  {searchTerm ? "Tente ajustar sua busca" : "Cadastre clientes para começar o controle financeiro"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4 text-sm text-slate-600">
                Mostrando <span className="font-semibold text-slate-900">{clientesFiltrados.length}</span> {clientesFiltrados.length === 1 ? 'cliente' : 'clientes'}
              </div>
              {clientesFiltrados.map((cliente) => {
                const transacoesCliente = transacoes.filter(t => t.cliente_id === cliente.id);
                return (
                  <ClienteFinanceiroCard
                    key={cliente.id}
                    cliente={cliente}
                    aulas={aulas}
                    transacoes={transacoesCliente}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>

      <RelatorioFinanceiro
        open={showRelatorio}
        onClose={() => setShowRelatorio(false)}
        transacoes={transacoes}
        clientes={clientes}
      />

      <DetalhamentoFinanceiro
        open={detalhamento.open}
        onClose={() => setDetalhamento({ open: false, tipo: null })}
        tipo={detalhamento.tipo}
        transacoes={transacoes}
        clientes={clientes}
      />
    </div>
  );
}