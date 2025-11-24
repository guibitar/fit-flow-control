import React, { useState } from "react";
import { Cliente, ProgressoCliente, Avaliacao } from "@/api/entities";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Plus, Search, X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Progresso() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => Cliente.list('-created_at'),
    enabled: !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: progressos = [] } = useQuery({
    queryKey: ['progressos'],
    queryFn: () => ProgressoCliente.list('-data_registro'),
    enabled: !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: avaliacoes = [] } = useQuery({
    queryKey: ['avaliacoes'],
    queryFn: () => Avaliacao.list('-data_avaliacao'),
    enabled: !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const clientesAtivos = clientes.filter(c => c.status === 'ativo');

  const clientesFiltrados = clientesAtivos.filter(c => {
    const matchSearch = searchTerm === "" || 
      c.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFiltro = filtroCliente === "" || c.id === filtroCliente;
    return matchSearch && matchFiltro;
  });

  // Calcular estatísticas por cliente
  const getClienteStats = (clienteId) => {
    const progressosCliente = progressos.filter(p => p.cliente_id === clienteId);
    const avaliacoesCliente = avaliacoes.filter(a => a.cliente_id === clienteId);
    
    const totalRegistros = progressosCliente.length + avaliacoesCliente.length;
    
    let ultimoPeso = null;
    let penultimoPeso = null;
    
    if (progressosCliente.length > 0 && progressosCliente[0].peso) {
      ultimoPeso = progressosCliente[0].peso;
      if (progressosCliente.length > 1 && progressosCliente[1].peso) {
        penultimoPeso = progressosCliente[1].peso;
      }
    } else if (avaliacoesCliente.length > 0) {
      ultimoPeso = avaliacoesCliente[0].peso;
      if (avaliacoesCliente.length > 1) {
        penultimoPeso = avaliacoesCliente[1].peso;
      }
    }

    const variacaoPeso = ultimoPeso && penultimoPeso ? ultimoPeso - penultimoPeso : null;

    let ultimoPercentualGordura = null;
    let penultimoPercentualGordura = null;

    if (progressosCliente.length > 0 && progressosCliente[0].percentual_gordura) {
      ultimoPercentualGordura = progressosCliente[0].percentual_gordura;
      if (progressosCliente.length > 1 && progressosCliente[1].percentual_gordura) {
        penultimoPercentualGordura = progressosCliente[1].percentual_gordura;
      }
    } else if (avaliacoesCliente.length > 0 && avaliacoesCliente[0].percentual_gordura) {
      ultimoPercentualGordura = avaliacoesCliente[0].percentual_gordura;
      if (avaliacoesCliente.length > 1 && avaliacoesCliente[1].percentual_gordura) {
        penultimoPercentualGordura = avaliacoesCliente[1].percentual_gordura;
      }
    }

    const variacaoGordura = ultimoPercentualGordura && penultimoPercentualGordura 
      ? ultimoPercentualGordura - penultimoPercentualGordura 
      : null;

    return {
      totalRegistros,
      ultimoPeso,
      variacaoPeso,
      ultimoPercentualGordura,
      variacaoGordura
    };
  };

  const handleVerDetalhes = (clienteId) => {
    navigate(createPageUrl("ProgressoCliente") + `?cliente_id=${clienteId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                Progresso dos Clientes
              </h1>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                Acompanhe a evolução e desempenho dos seus clientes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-none shadow-lg text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{clientesAtivos.length}</p>
              <p className="text-xs opacity-75 mt-1">Ativos no sistema</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-lg text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Registros de Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{progressos.length}</p>
              <p className="text-xs opacity-75 mt-1">Total registrado</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none shadow-lg text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Avaliações Físicas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{avaliacoes.length}</p>
              <p className="text-xs opacity-75 mt-1">Realizadas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none shadow-lg text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Média por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {clientesAtivos.length > 0 
                  ? ((progressos.length + avaliacoes.length) / clientesAtivos.length).toFixed(1)
                  : 0}
              </p>
              <p className="text-xs opacity-75 mt-1">Registros</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Buscar cliente..."
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

          <div className="flex gap-3">
            <Select value={filtroCliente} onValueChange={setFiltroCliente}>
              <SelectTrigger className="max-w-xs bg-white">
                <SelectValue placeholder="Filtrar por cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todos os clientes</SelectItem>
                {clientesAtivos.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filtroCliente && (
              <Button
                variant="outline"
                onClick={() => setFiltroCliente("")}
              >
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
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
                  {searchTerm || filtroCliente ? "Nenhum cliente encontrado" : "Nenhum cliente ativo"}
                </h3>
                <p className="text-slate-600">
                  {searchTerm || filtroCliente ? "Tente ajustar os filtros" : "Cadastre clientes para acompanhar o progresso"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4 text-sm text-slate-600">
                Mostrando <span className="font-semibold text-slate-900">{clientesFiltrados.length}</span> {clientesFiltrados.length === 1 ? 'cliente' : 'clientes'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientesFiltrados.map((cliente) => {
                  const stats = getClienteStats(cliente.id);
                  return (
                    <Card 
                      key={cliente.id} 
                      className="hover:shadow-xl transition-all duration-300 border-2 cursor-pointer"
                      onClick={() => handleVerDetalhes(cliente.id)}
                    >
                      <CardHeader className="border-b p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg">
                                {cliente.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-900">{cliente.nome}</h3>
                              <p className="text-xs text-slate-600">{cliente.objetivo || 'Sem objetivo definido'}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <p className="text-xs text-blue-700 mb-1">Registros</p>
                            <p className="text-2xl font-bold text-blue-900">{stats.totalRegistros}</p>
                          </div>

                          {stats.ultimoPeso && (
                            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                              <p className="text-xs text-green-700 mb-1">Peso Atual</p>
                              <div className="flex items-baseline gap-1">
                                <p className="text-2xl font-bold text-green-900">{stats.ultimoPeso}</p>
                                <span className="text-xs text-green-700">kg</span>
                              </div>
                              {stats.variacaoPeso !== null && (
                                <div className={`flex items-center gap-1 mt-1 ${
                                  stats.variacaoPeso < 0 ? 'text-green-600' : 'text-orange-600'
                                }`}>
                                  {stats.variacaoPeso < 0 ? (
                                    <TrendingDown className="w-3 h-3" />
                                  ) : (
                                    <TrendingUp className="w-3 h-3" />
                                  )}
                                  <span className="text-xs font-semibold">
                                    {Math.abs(stats.variacaoPeso).toFixed(1)} kg
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {stats.ultimoPercentualGordura && (
                            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                              <p className="text-xs text-purple-700 mb-1">% Gordura</p>
                              <div className="flex items-baseline gap-1">
                                <p className="text-2xl font-bold text-purple-900">{stats.ultimoPercentualGordura}</p>
                                <span className="text-xs text-purple-700">%</span>
                              </div>
                              {stats.variacaoGordura !== null && (
                                <div className={`flex items-center gap-1 mt-1 ${
                                  stats.variacaoGordura < 0 ? 'text-green-600' : 'text-orange-600'
                                }`}>
                                  {stats.variacaoGordura < 0 ? (
                                    <TrendingDown className="w-3 h-3" />
                                  ) : (
                                    <TrendingUp className="w-3 h-3" />
                                  )}
                                  <span className="text-xs font-semibold">
                                    {Math.abs(stats.variacaoGordura).toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {stats.totalRegistros === 0 && (
                          <div className="text-center py-4 text-slate-500 text-sm">
                            <p>Nenhum registro de progresso ainda</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}