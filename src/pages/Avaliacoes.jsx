import React, { useState } from "react";
import { Cliente, Avaliacao } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown, Calendar, Scale, Activity, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import DobrasCutaneas from "../components/avaliacoes/DobrasCutaneas";

export default function Avaliacoes() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState("");
  const [avaliacaoExpandida, setAvaliacaoExpandida] = useState(null);
  const [avaliacaoEditando, setAvaliacaoEditando] = useState(null);
  const [avaliacaoParaExcluir, setAvaliacaoParaExcluir] = useState(null);
  const queryClient = useQueryClient();

  const [avaliacao, setAvaliacao] = useState({
    cliente_id: "",
    cliente_nome: "",
    data_avaliacao: new Date().toISOString().split('T')[0],
    sexo: "M",
    idade: "",
    peso: "",
    altura: "",
    percentual_gordura: "",
    medidas: {
      pescoco: "", ombros: "", peito: "", cintura: "", quadril: "",
      braco_direito: "", braco_esquerdo: "", antebraco_direito: "", antebraco_esquerdo: "",
      coxa_direita: "", coxa_esquerda: "", panturrilha_direita: "", panturrilha_esquerda: ""
    },
    dobras_cutaneas: {},
    composicao_corporal: null,
    observacoes: ""
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => Cliente.filter({ status: 'ativo' }),
    initialData: [],
    enabled: !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: avaliacoes = [] } = useQuery({
    queryKey: ['avaliacoes', selectedCliente],
    queryFn: () => {
      if (!selectedCliente || selectedCliente === "" || selectedCliente === "all") {
        return Avaliacao.list('-data_avaliacao');
      }
      return Avaliacao.filter({ cliente_id: parseInt(selectedCliente) });
    },
    initialData: [],
    enabled: !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const createAvaliacaoMutation = useMutation({
    mutationFn: (data) => Avaliacao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
      queryClient.refetchQueries({ queryKey: ['avaliacoes'] });
      setShowForm(false);
      resetForm();
    },
  });

  const updateAvaliacaoMutation = useMutation({
    mutationFn: ({ id, data }) => Avaliacao.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
      queryClient.refetchQueries({ queryKey: ['avaliacoes'] });
      setShowForm(false);
      setAvaliacaoEditando(null);
      resetForm();
    },
  });

  const deleteAvaliacaoMutation = useMutation({
    mutationFn: (id) => Avaliacao.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
      queryClient.refetchQueries({ queryKey: ['avaliacoes'] });
      setAvaliacaoParaExcluir(null);
    },
  });

  const resetForm = () => {
    setAvaliacao({
      cliente_id: "",
      cliente_nome: "",
      data_avaliacao: new Date().toISOString().split('T')[0],
      sexo: "M",
      idade: "",
      peso: "",
      altura: "",
      percentual_gordura: "",
      medidas: {
        pescoco: "", ombros: "", peito: "", cintura: "", quadril: "",
        braco_direito: "", braco_esquerdo: "", antebraco_direito: "", antebraco_esquerdo: "",
        coxa_direita: "", coxa_esquerda: "", panturrilha_direita: "", panturrilha_esquerda: ""
      },
      dobras_cutaneas: {},
      composicao_corporal: null,
      observacoes: ""
    });
  };

  const handleClienteChange = (clienteId) => {
    const cliente = clientes.find(c => c.id === parseInt(clienteId));
    setAvaliacao({
      ...avaliacao,
      cliente_id: parseInt(clienteId),
      cliente_nome: cliente?.nome || ""
    });
  };

  const handleSubmit = () => {
    if (!avaliacao.cliente_id || !avaliacao.peso) {
      alert("Selecione um cliente e preencha o peso");
      return;
    }
    
    const dataToSend = {
      cliente_id: parseInt(avaliacao.cliente_id),
      cliente_nome: avaliacao.cliente_nome,
      data_avaliacao: avaliacao.data_avaliacao,
      sexo: avaliacao.sexo,
      peso: parseFloat(avaliacao.peso),
      altura: avaliacao.altura && avaliacao.altura !== "" ? parseFloat(avaliacao.altura) : null,
      idade: avaliacao.idade && avaliacao.idade !== "" ? parseInt(avaliacao.idade) : null,
      percentual_gordura: avaliacao.percentual_gordura && avaliacao.percentual_gordura !== "" ? parseFloat(avaliacao.percentual_gordura) : null,
      observacoes: avaliacao.observacoes || ""
    };

    // Só incluir medidas se tiver algum valor
    const medidasComValor = Object.entries(avaliacao.medidas || {})
      .reduce((acc, [key, value]) => {
        if (value && value !== "") {
          acc[key] = parseFloat(value);
        }
        return acc;
      }, {});
    
    if (Object.keys(medidasComValor).length > 0) {
      dataToSend.medidas = medidasComValor;
    }

    // Só incluir dobras e composição se tiver algum valor
    const dobrasComValor = Object.entries(avaliacao.dobras_cutaneas || {})
      .reduce((acc, [key, value]) => {
        if (value && value !== "") {
          acc[key] = parseFloat(value);
        }
        return acc;
      }, {});
    
    if (Object.keys(dobrasComValor).length > 0) {
      dataToSend.dobras_cutaneas = dobrasComValor;
    }

    if (avaliacao.composicao_corporal) {
      dataToSend.composicao_corporal = avaliacao.composicao_corporal;
    }

    if (avaliacaoEditando) {
      updateAvaliacaoMutation.mutate({ id: avaliacaoEditando.id, data: dataToSend });
    } else {
      createAvaliacaoMutation.mutate(dataToSend);
    }
  };

  const abrirEdicao = (aval) => {
    setAvaliacaoEditando(aval);
    // Converter data_avaliacao para formato YYYY-MM-DD se necessário
    let dataAvaliacao = aval.data_avaliacao;
    if (dataAvaliacao instanceof Date) {
      dataAvaliacao = dataAvaliacao.toISOString().split('T')[0];
    } else if (typeof dataAvaliacao === 'string' && dataAvaliacao.includes('T')) {
      dataAvaliacao = dataAvaliacao.split('T')[0];
    }
    
    setAvaliacao({
      cliente_id: parseInt(aval.cliente_id),
      cliente_nome: aval.cliente_nome,
      data_avaliacao: dataAvaliacao,
      sexo: aval.sexo || "M",
      idade: aval.idade?.toString() || "",
      peso: aval.peso.toString(),
      altura: aval.altura?.toString() || "",
      percentual_gordura: aval.percentual_gordura ? aval.percentual_gordura.toString() : "",
      medidas: aval.medidas || {
        pescoco: "", ombros: "", peito: "", cintura: "", quadril: "",
        braco_direito: "", braco_esquerdo: "", antebraco_direito: "", antebraco_esquerdo: "",
        coxa_direita: "", coxa_esquerda: "", panturrilha_direita: "", panturrilha_esquerda: ""
      },
      dobras_cutaneas: aval.dobras_cutaneas || {},
      composicao_corporal: aval.composicao_corporal || null,
      observacoes: aval.observacoes || ""
    });
    setShowForm(true);
  };

  const confirmarExclusao = () => {
    if (avaliacaoParaExcluir) {
      deleteAvaliacaoMutation.mutate(avaliacaoParaExcluir.id);
    }
  };

  const toggleExpandir = (avalId) => {
    setAvaliacaoExpandida(avaliacaoExpandida === avalId ? null : avalId);
  };

  // Função auxiliar para formatar data de forma segura
  const formatarData = (data) => {
    if (!data) return '';
    try {
      // Se já é string no formato YYYY-MM-DD, usar diretamente
      if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return new Date(data + 'T00:00:00');
      }
      // Se é string com timestamp, converter
      if (typeof data === 'string' && data.includes('T')) {
        return new Date(data);
      }
      // Se já é Date, retornar
      if (data instanceof Date) {
        return data;
      }
      // Tentar converter string genérica
      return new Date(data);
    } catch (error) {
      console.error('Erro ao formatar data:', error, data);
      return new Date();
    }
  };

  // Agrupar avaliações por cliente
  const avaliacoesPorCliente = avaliacoes.reduce((acc, aval) => {
    const clienteId = parseInt(aval.cliente_id);
    if (!acc[clienteId]) {
      acc[clienteId] = {
        cliente_nome: aval.cliente_nome,
        cliente_id: clienteId,
        avaliacoes: []
      };
    }
    acc[clienteId].avaliacoes.push(aval);
    return acc;
  }, {});

  // Converter para array e ordenar por data mais recente
  const clientesComAvaliacoes = Object.values(avaliacoesPorCliente).map(grupo => {
    grupo.avaliacoes.sort((a, b) => {
      const dataA = formatarData(a.data_avaliacao);
      const dataB = formatarData(b.data_avaliacao);
      return dataB - dataA;
    });
    return grupo;
  });

  const calcularProgresso = (avaliacoes) => {
    if (avaliacoes.length < 2) return null;
    const diff = avaliacoes[0].peso - avaliacoes[1].peso;
    return diff;
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Avaliações Físicas</h1>
            <p className="text-slate-600">Acompanhe a evolução corporal dos seus clientes</p>
          </div>
          <Button onClick={() => {
            setAvaliacaoEditando(null);
            resetForm();
            setShowForm(true);
          }} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            Nova Avaliação
          </Button>
        </div>

        <div className="mb-6">
          <Label>Filtrar por Cliente</Label>
          <Select 
            value={selectedCliente || undefined} 
            onValueChange={(value) => setSelectedCliente(value || "")}
          >
            <SelectTrigger className="max-w-md bg-white">
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={String(cliente.id)}>
                  {cliente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {clientesComAvaliacoes.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhuma avaliação registrada</h3>
              <p className="text-slate-600 mb-6">Comece registrando a primeira avaliação física</p>
              <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-5 h-5 mr-2" />
                Criar Primeira Avaliação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {clientesComAvaliacoes.map((grupo) => {
              const progresso = calcularProgresso(grupo.avaliacoes);
              const avaliacaoMaisRecente = grupo.avaliacoes[0];
              
              return (
                <Card key={grupo.cliente_id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-2xl">
                            {grupo.cliente_nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-2xl mb-2">{grupo.cliente_nome}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Activity className="w-4 h-4" />
                              <span>{grupo.avaliacoes.length} avaliação{grupo.avaliacoes.length > 1 ? 'ões' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Scale className="w-4 h-4" />
                              <span className="font-bold text-slate-900">{avaliacaoMaisRecente.peso} kg</span>
                            </div>
                            {avaliacaoMaisRecente.percentual_gordura && (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">{avaliacaoMaisRecente.percentual_gordura}% gordura</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {progresso !== null && (
                        <Badge className={`flex items-center gap-2 text-lg px-4 py-2 ${
                          progresso < 0 ? 'bg-green-500' : 'bg-orange-500'
                        }`}>
                          {progresso < 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                          <span>{Math.abs(progresso).toFixed(1)} kg</span>
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Histórico de Avaliações
                    </h3>
                    <div className="space-y-2">
                      {grupo.avaliacoes.map((aval, index) => {
                        const proximaAval = grupo.avaliacoes[index + 1];
                        const diferencaPeso = proximaAval ? aval.peso - proximaAval.peso : null;
                        const diferencaGordura = proximaAval && aval.percentual_gordura && proximaAval.percentual_gordura 
                          ? aval.percentual_gordura - proximaAval.percentual_gordura 
                          : null;
                        const expandida = avaliacaoExpandida === aval.id;

                        return (
                          <div key={aval.id} className={`border-2 rounded-lg transition-all ${
                            index === 0 ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'
                          }`}>
                            {/* Cabeçalho da Avaliação - Clicável */}
                            <div 
                              onClick={() => toggleExpandir(aval.id)}
                              className="p-4 cursor-pointer hover:bg-opacity-80 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1">
                                  <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold text-slate-900">
                                        {format(formatarData(aval.data_avaliacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                      </span>
                                      {index === 0 && (
                                        <Badge className="bg-green-600 text-xs">Mais recente</Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                                      <span className="font-semibold">Peso: {aval.peso} kg</span>
                                      {aval.percentual_gordura && (
                                        <span>Gordura: {aval.percentual_gordura}%</span>
                                      )}
                                      {diferencaPeso !== null && (
                                        <span className={diferencaPeso < 0 ? 'text-green-600' : 'text-orange-600'}>
                                          {diferencaPeso > 0 ? '+' : ''}{diferencaPeso.toFixed(1)} kg
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      abrirEdicao(aval);
                                    }}
                                    className="hover:bg-blue-100 hover:text-blue-700"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAvaliacaoParaExcluir(aval);
                                    }}
                                    className="hover:bg-red-100 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  {expandida ? (
                                    <ChevronUp className="w-5 h-5 text-slate-400" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Detalhes Expandidos */}
                            {expandida && (
                              <div className="px-4 pb-4 border-t border-slate-200">
                                <div className="pt-4 space-y-4">
                                  {/* Dados Principais */}
                                  <div>
                                    <h4 className="font-semibold text-slate-700 mb-3 text-sm">Dados Principais</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">Peso</p>
                                        <div className="flex items-baseline gap-1">
                                          <p className="font-bold text-lg text-slate-900">{aval.peso}</p>
                                          <span className="text-sm text-slate-600">kg</span>
                                        </div>
                                        {diferencaPeso !== null && (
                                          <p className={`text-xs mt-1 ${diferencaPeso < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                            {diferencaPeso > 0 ? '+' : ''}{diferencaPeso.toFixed(1)} kg
                                          </p>
                                        )}
                                      </div>
                                      
                                      {aval.percentual_gordura && (
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                          <p className="text-xs text-slate-500">% Gordura</p>
                                          <div className="flex items-baseline gap-1">
                                            <p className="font-bold text-lg text-slate-900">{aval.percentual_gordura}</p>
                                            <span className="text-sm text-slate-600">%</span>
                                          </div>
                                          {diferencaGordura !== null && (
                                            <p className={`text-xs mt-1 ${diferencaGordura < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                              {diferencaGordura > 0 ? '+' : ''}{diferencaGordura.toFixed(1)}%
                                            </p>
                                          )}
                                        </div>
                                      )}

                                      {aval.altura && (
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                          <p className="text-xs text-slate-500">Altura</p>
                                          <div className="flex items-baseline gap-1">
                                            <p className="font-bold text-lg text-slate-900">{aval.altura}</p>
                                            <span className="text-sm text-slate-600">cm</span>
                                          </div>
                                        </div>
                                      )}

                                      {aval.medidas?.cintura && (
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                          <p className="text-xs text-slate-500">Cintura</p>
                                          <div className="flex items-baseline gap-1">
                                            <p className="font-bold text-lg text-slate-900">{aval.medidas.cintura}</p>
                                            <span className="text-sm text-slate-600">cm</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Composição Corporal Calculada */}
                                  {aval.composicao_corporal && (
                                    <div>
                                      <h4 className="font-semibold text-slate-700 mb-3 text-sm">
                                        Composição Corporal - {aval.composicao_corporal.protocolo_utilizado}
                                      </h4>
                                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                          <p className="text-xs text-blue-700">Σ Dobras</p>
                                          <p className="font-bold text-lg text-blue-900">{aval.composicao_corporal.somatorio_dobras} mm</p>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                          <p className="text-xs text-blue-700">DC</p>
                                          <p className="font-bold text-lg text-blue-900">{aval.composicao_corporal.densidade_corporal}</p>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                          <p className="text-xs text-blue-700">% Gordura</p>
                                          <p className="font-bold text-lg text-blue-900">{aval.composicao_corporal.percentual_gordura_calculado}%</p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                          <p className="text-xs text-green-700">Massa Magra</p>
                                          <p className="font-bold text-lg text-green-900">{aval.composicao_corporal.massa_magra} kg</p>
                                        </div>
                                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                          <p className="text-xs text-orange-700">Massa Gorda</p>
                                          <p className="font-bold text-lg text-orange-900">{aval.composicao_corporal.massa_gorda} kg</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Medidas Detalhadas */}
                                  {aval.medidas && Object.values(aval.medidas).some(v => v) && (
                                    <div>
                                      <h4 className="font-semibold text-slate-700 mb-3 text-sm">Medidas Corporais (cm)</h4>
                                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                        {Object.entries(aval.medidas).map(([key, value]) => {
                                          if (!value) return null;
                                          return (
                                            <div key={key} className="bg-slate-50 p-2 rounded">
                                              <p className="text-[10px] text-slate-500 capitalize">{key.replace(/_/g, ' ')}</p>
                                              <p className="font-semibold text-sm text-slate-900">{value} cm</p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Observações */}
                                  {aval.observacoes && (
                                    <div>
                                      <h4 className="font-semibold text-slate-700 mb-2 text-sm">Observações</h4>
                                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                        <p className="text-sm text-slate-700">{aval.observacoes}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal de Formulário */}
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
            setAvaliacaoEditando(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {avaliacaoEditando ? 'Editar Avaliação Física' : 'Nova Avaliação Física'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Dados Básicos */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Dados Básicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cliente *</Label>
                      <Select 
                        value={avaliacao.cliente_id ? String(avaliacao.cliente_id) : undefined} 
                        onValueChange={handleClienteChange}
                        disabled={!!avaliacaoEditando}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={String(cliente.id)}>
                              {cliente.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Data da Avaliação *</Label>
                      <Input
                        type="date"
                        value={avaliacao.data_avaliacao}
                        onChange={(e) => setAvaliacao({...avaliacao, data_avaliacao: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Sexo *</Label>
                      <Select 
                        value={avaliacao.sexo} 
                        onValueChange={(value) => setAvaliacao({...avaliacao, sexo: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Idade (anos)</Label>
                      <Input
                        type="number"
                        value={avaliacao.idade}
                        onChange={(e) => setAvaliacao({...avaliacao, idade: e.target.value})}
                        placeholder="Ex: 25"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Peso (kg) *</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={avaliacao.peso}
                        onChange={(e) => setAvaliacao({...avaliacao, peso: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Altura (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={avaliacao.altura}
                        onChange={(e) => setAvaliacao({...avaliacao, altura: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>% Gordura Manual (opcional)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={avaliacao.percentual_gordura}
                      onChange={(e) => setAvaliacao({...avaliacao, percentual_gordura: e.target.value})}
                      placeholder="Insira manualmente ou use dobras cutâneas"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Medidas Corporais */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Medidas Corporais (cm)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.keys(avaliacao.medidas).map((key) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs capitalize">{key.replace(/_/g, ' ')}</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={avaliacao.medidas[key]}
                          onChange={(e) => setAvaliacao({
                            ...avaliacao,
                            medidas: {...avaliacao.medidas, [key]: e.target.value}
                          })}
                          className="h-9"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Dobras Cutâneas */}
              <DobrasCutaneas
                sexo={avaliacao.sexo}
                idade={parseInt(avaliacao.idade) || null}
                peso={parseFloat(avaliacao.peso) || null}
                dobras={avaliacao.dobras_cutaneas}
                onChange={(dobras) => setAvaliacao({...avaliacao, dobras_cutaneas: dobras})}
                onResultadosChange={(resultados) => setAvaliacao({...avaliacao, composicao_corporal: resultados})}
              />

              {/* Observações */}
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={avaliacao.observacoes}
                  onChange={(e) => setAvaliacao({...avaliacao, observacoes: e.target.value})}
                  rows={3}
                  placeholder="Anotações importantes sobre a avaliação..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => {
                  setShowForm(false);
                  setAvaliacaoEditando(null);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={createAvaliacaoMutation.isPending || updateAvaliacaoMutation.isPending} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  {(createAvaliacaoMutation.isPending || updateAvaliacaoMutation.isPending) ? "Salvando..." : 
                   avaliacaoEditando ? "Atualizar Avaliação" : "Salvar Avaliação"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={!!avaliacaoParaExcluir} onOpenChange={() => setAvaliacaoParaExcluir(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta avaliação de {avaliacaoParaExcluir?.cliente_nome} realizada em {avaliacaoParaExcluir && format(formatarData(avaliacaoParaExcluir.data_avaliacao), "dd/MM/yyyy", { locale: ptBR })}? 
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
    </div>
  );
}