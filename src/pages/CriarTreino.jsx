import React, { useState } from "react";
import { Cliente, Treino } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft, Search, Trash2, Layers, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

import ExercicioFormAvancado from "../components/treinos/ExercicioFormAvancado";
import BuscaTreinoModelo from "../components/treinos/BuscaTreinoModelo";

export default function CriarTreino() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showBuscaModelo, setShowBuscaModelo] = useState(false);
  const [errosValidacao, setErrosValidacao] = useState([]);
  const [treino, setTreino] = useState({
    titulo: "",
    descricao: "",
    cliente_id: "",
    cliente_nome: "",
    tipo: "forca",
    duracao_estimada: 60,
    exercicios: [],
    data_envio: new Date().toISOString().split('T')[0]
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => Cliente.filter({ status: 'ativo' }),
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const createTreinoMutation = useMutation({
    mutationFn: (data) => Treino.create(data),
    onSuccess: (novoTreino) => {
      // Invalidar todas as queries relacionadas a treinos
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      // Invalidar a query específica do cliente se o treino tiver cliente_id
      if (novoTreino?.cliente_id) {
        queryClient.invalidateQueries({ queryKey: ['treinos-cliente', novoTreino.cliente_id] });
        queryClient.invalidateQueries({ queryKey: ['treinos-cliente-lista', novoTreino.cliente_id] });
      }
      // Refetch para garantir que os dados estejam atualizados
      queryClient.refetchQueries({ queryKey: ['treinos'] });
      toast.success("Treino criado com sucesso!");
      navigate(createPageUrl("Dashboard"));
    },
    onError: (error) => {
      console.error("Erro ao criar treino:", error);
      toast.error("Erro ao criar treino. Verifique os dados e tente novamente.");
    }
  });

  const handleClienteChange = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    setTreino({
      ...treino,
      cliente_id: clienteId,
      cliente_nome: cliente?.nome || ""
    });
    setErrosValidacao([]);
  };

  const converterDescansoParaSegundos = (descanso) => {
    if (!descanso) return 0;
    const match = descanso.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const validarExercicio = (item, index) => {
    const erros = [];
    
    if (item.tipo_item === 'exercicio') {
      if (!item.nome || item.nome.trim() === '') {
        erros.push(`Exercício ${index + 1}: Nome não pode estar vazio`);
      }
      if (!item.grupo_muscular) {
        erros.push(`Exercício ${index + 1}: Grupo muscular não selecionado`);
      }
      if (!item.series || item.series < 1) {
        erros.push(`Exercício ${index + 1}: Número de séries inválido`);
      }
      if (item.tipo_execucao === 'repeticao' && (!item.repeticoes || item.repeticoes.trim() === '')) {
        erros.push(`Exercício ${index + 1}: Repetições não podem estar vazias`);
      }
      if (item.tipo_execucao === 'tempo' && (!item.tempo_execucao || item.tempo_execucao < 1)) {
        erros.push(`Exercício ${index + 1}: Tempo de execução inválido`);
      }
    } else {
      if (!item.exercicios_grupo || item.exercicios_grupo.length === 0) {
        erros.push(`Grupo ${index + 1}: Sem exercícios no grupo`);
      } else {
        item.exercicios_grupo.forEach((ex, exIndex) => {
          if (!ex.nome || ex.nome.trim() === '') {
            erros.push(`Grupo ${index + 1}, Exercício ${exIndex + 1}: Nome não pode estar vazio`);
          }
        });
      }
      if (!item.series || item.series < 1) {
        erros.push(`Grupo ${index + 1}: Número de séries inválido`);
      }
    }
    
    return erros;
  };

  const validarTreino = () => {
    const erros = [];
    
    if (!treino.titulo || treino.titulo.trim() === '') {
      erros.push("Título do treino é obrigatório");
    }
    
    if (!treino.cliente_id) {
      erros.push("Selecione um cliente");
    }
    
    if (!treino.exercicios || treino.exercicios.length === 0) {
      erros.push("Adicione pelo menos um exercício ao treino");
    }
    
    if (!treino.duracao_estimada || treino.duracao_estimada < 1) {
      erros.push("Duração estimada deve ser maior que 0");
    }
    
    treino.exercicios.forEach((item, index) => {
      const errosExercicio = validarExercicio(item, index);
      erros.push(...errosExercicio);
    });
    
    return erros;
  };

  const normalizarExercicio = (item) => {
    const itemNormalizado = { ...item };
    
    if (item.descanso && !item.descanso_segundos) {
      itemNormalizado.descanso_segundos = converterDescansoParaSegundos(item.descanso);
    }
    
    if (item.tipo_item === 'exercicio') {
      itemNormalizado.series = item.series || 3;
      itemNormalizado.grupo_muscular = item.grupo_muscular || 'corpo_todo';
      itemNormalizado.tipo_execucao = item.tipo_execucao || 'repeticao';
      
      if (itemNormalizado.tipo_execucao === 'repeticao') {
        itemNormalizado.repeticoes = item.repeticoes || '10-12';
        delete itemNormalizado.tempo_execucao;
      } else {
        itemNormalizado.tempo_execucao = item.tempo_execucao || 30;
        delete itemNormalizado.repeticoes;
      }
    } else {
      itemNormalizado.series = item.series || 3;
      itemNormalizado.exercicios_grupo = (item.exercicios_grupo || []).map(ex => ({
        nome: ex.nome,
        grupo_muscular: ex.grupo_muscular || 'corpo_todo',
        tipo_execucao: ex.tipo_execucao || 'repeticao',
        repeticoes: ex.tipo_execucao === 'repeticao' ? (ex.repeticoes || '10-12') : undefined,
        tempo_execucao: ex.tipo_execucao === 'tempo' ? (ex.tempo_execucao || 30) : undefined,
        observacoes: ex.observacoes || '',
        video_url: ex.video_url || ''
      }));
      
      delete itemNormalizado.nome;
      delete itemNormalizado.grupo_muscular;
      delete itemNormalizado.tipo_execucao;
      delete itemNormalizado.repeticoes;
      delete itemNormalizado.tempo_execucao;
      delete itemNormalizado.observacoes;
      delete itemNormalizado.video_url;
    }
    
    return itemNormalizado;
  };

  const handleAddExercicio = (item) => {
    try {
      const itemNormalizado = normalizarExercicio(item);
      setTreino({
        ...treino,
        exercicios: [...treino.exercicios, itemNormalizado]
      });
      setErrosValidacao([]);
      toast.success("Exercício adicionado!");
    } catch (error) {
      console.error("Erro ao adicionar exercício:", error);
      toast.error("Erro ao adicionar exercício");
    }
  };

  const handleRemoveExercicio = (index) => {
    setTreino({
      ...treino,
      exercicios: treino.exercicios.filter((_, i) => i !== index)
    });
    setErrosValidacao([]);
    toast.success("Exercício removido");
  };

  const handleSubmit = () => {
    const erros = validarTreino();
    
    if (erros.length > 0) {
      setErrosValidacao(erros);
      toast.error("Corrija os erros antes de salvar");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    try {
      const treinoNormalizado = {
        ...treino,
        cliente_id: parseInt(treino.cliente_id), // Garantir que é número
        exercicios: treino.exercicios.map(item => normalizarExercicio(item))
      };
      
      console.log("Enviando treino:", treinoNormalizado);
      createTreinoMutation.mutate(treinoNormalizado);
    } catch (error) {
      console.error("Erro ao preparar treino:", error);
      toast.error("Erro ao preparar dados do treino");
    }
  };

  const copiarTreinoModelo = (treinoCopiado) => {
    try {
      setTreino({
        ...treino,
        titulo: `Cópia de ${treinoCopiado.titulo}`,
        descricao: treinoCopiado.descricao || "",
        tipo: treinoCopiado.tipo,
        duracao_estimada: treinoCopiado.duracao_estimada,
        exercicios: treinoCopiado.exercicios.map(ex => normalizarExercicio({ ...ex }))
      });
      setShowBuscaModelo(false);
      setErrosValidacao([]);
      toast.success("Treino copiado! Ajuste os dados e selecione o cliente.");
    } catch (error) {
      console.error("Erro ao copiar treino:", error);
      toast.error("Erro ao copiar treino");
    }
  };

  const getItemLabel = (item) => {
    if (item.tipo_item === 'exercicio') {
      return item.nome;
    }
    const tipoLabels = {
      'bi-set': 'Bi-set',
      'tri-set': 'Tri-set',
      'giga-set': 'Giga-set'
    };
    return `${tipoLabels[item.tipo_item]} (${item.exercicios_grupo?.length || 0} exercícios)`;
  };

  return (
    <div className="p-3 md:p-4 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="min-w-[44px] min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Criar Treino</h1>
            <p className="text-slate-600 text-sm md:text-base">Monte um treino personalizado para seu cliente</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowBuscaModelo(true)}
            className="bg-white hover:bg-slate-50 border-2 border-blue-300 text-blue-700 w-full sm:w-auto min-h-[44px] text-sm md:text-base"
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar Treino Modelo
          </Button>
        </div>

        {errosValidacao.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc pl-4 space-y-1">
                {errosValidacao.map((erro, index) => (
                  <li key={index} className="text-sm">{erro}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-200 p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Informações do Treino</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título do Treino *</Label>
                <Input
                  placeholder="Ex: Treino A - Peito e Tríceps"
                  value={treino.titulo}
                  onChange={(e) => {
                    setTreino({...treino, titulo: e.target.value});
                    setErrosValidacao([]);
                  }}
                  className={errosValidacao.some(e => e.includes('Título')) ? 'border-red-500' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select 
                  value={treino.cliente_id} 
                  onValueChange={handleClienteChange}
                >
                  <SelectTrigger className={errosValidacao.some(e => e.includes('cliente')) ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo do Treino</Label>
                <Select value={treino.tipo} onValueChange={(value) => setTreino({...treino, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forca">Força</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                    <SelectItem value="funcional">Funcional</SelectItem>
                    <SelectItem value="alongamento">Alongamento</SelectItem>
                    <SelectItem value="misto">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duração Estimada (minutos)</Label>
                <Input
                  type="number"
                  min="1"
                  value={treino.duracao_estimada}
                  onChange={(e) => setTreino({...treino, duracao_estimada: parseInt(e.target.value) || 60})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Instruções gerais, observações importantes..."
                value={treino.descricao}
                onChange={(e) => setTreino({...treino, descricao: e.target.value})}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-200 p-4 md:p-6">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base md:text-lg">Exercícios ({treino.exercicios.length})</CardTitle>
                <p className="text-xs md:text-sm text-slate-600 mt-1">
                  Adicione exercícios individuais ou grupos (Bi-set, Tri-set, Giga-set)
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <ExercicioFormAvancado onAdd={handleAddExercicio} />

            {treino.exercicios.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-slate-900 mb-3">Exercícios Adicionados</h3>
                {treino.exercicios.map((item, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${
                    item.tipo_item === 'exercicio' 
                      ? 'bg-slate-50 border-slate-200' 
                      : 'bg-purple-50 border-purple-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-slate-700 text-white">#{index + 1}</Badge>
                          
                          {item.tipo_item === 'exercicio' ? (
                            <>
                              <h4 className="font-semibold text-slate-900">{item.nome}</h4>
                              <Badge className="text-xs bg-blue-100 text-blue-700">
                                {item.grupo_muscular}
                              </Badge>
                            </>
                          ) : (
                            <>
                              <Layers className="w-4 h-4 text-purple-700" />
                              <h4 className="font-semibold text-purple-900">{getItemLabel(item)}</h4>
                              <Badge className="bg-purple-600 text-white text-xs">
                                {item.tipo_item.toUpperCase()}
                              </Badge>
                            </>
                          )}
                        </div>
                        
                        {item.tipo_item === 'exercicio' ? (
                          <div className="text-sm text-slate-600 space-y-1">
                            <p>
                              <strong>Tipo:</strong> {item.tipo_execucao === 'tempo' ? `Tempo (${item.tempo_execucao}s)` : `Repetições (${item.repeticoes})`}
                            </p>
                            {item.series && <p><strong>Séries:</strong> {item.series}</p>}
                            {item.descanso && <p><strong>Descanso:</strong> {item.descanso}</p>}
                            {item.observacoes && <p><strong>Obs:</strong> {item.observacoes}</p>}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-sm text-slate-600">
                              <p><strong>Séries:</strong> {item.series} | <strong>Descanso:</strong> {item.descanso}</p>
                            </div>
                            <div className="space-y-1 ml-4">
                              {item.exercicios_grupo?.map((ex, exIdx) => (
                                <div key={exIdx} className="flex items-center gap-2 text-sm">
                                  <Badge variant="outline" className="text-xs">{exIdx + 1}</Badge>
                                  <span className="font-medium">{ex.nome}</span>
                                  <span className="text-slate-500">
                                    {ex.tipo_execucao === 'tempo' ? `${ex.tempo_execucao}s` : ex.repeticoes}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExercicio(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3">
          <Button variant="outline" onClick={() => navigate(createPageUrl("Dashboard"))} className="min-h-[44px] text-sm md:text-base">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createTreinoMutation.isPending}
            className="bg-green-600 hover:bg-green-700 min-h-[44px] text-sm md:text-base"
          >
            <Save className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            {createTreinoMutation.isPending ? "Salvando..." : "Salvar Treino"}
          </Button>
        </div>
      </div>

      <BuscaTreinoModelo
        open={showBuscaModelo}
        onClose={() => setShowBuscaModelo(false)}
        onCopiar={copiarTreinoModelo}
      />
    </div>
  );
}