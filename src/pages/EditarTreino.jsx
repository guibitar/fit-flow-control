
import React, { useState, useEffect } from "react";
import { Cliente, Treino } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft, Trash2, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";

import ExercicioFormAvancado from "@/components/treinos/ExercicioFormAvancado";

export default function EditarTreino() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const treinoId = urlParams.get('id');

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

  const { data: treinoOriginal, isLoading } = useQuery({
    queryKey: ['treino', treinoId],
    queryFn: async () => {
      return await Treino.get(treinoId);
    },
    enabled: !!treinoId,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => Cliente.filter({ status: 'ativo' }),
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (treinoOriginal) {
      setTreino(treinoOriginal);
    }
  }, [treinoOriginal]);

  const updateTreinoMutation = useMutation({
    mutationFn: (data) => Treino.update(treinoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      queryClient.invalidateQueries({ queryKey: ['treino', treinoId] });
      navigate(createPageUrl("Dashboard"));
    },
  });

  const handleClienteChange = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    setTreino({
      ...treino,
      cliente_id: clienteId,
      cliente_nome: cliente?.nome || ""
    });
  };

  const handleAddExercicio = (item) => {
    setTreino({
      ...treino,
      exercicios: [...treino.exercicios, item]
    });
  };

  const handleRemoveExercicio = (index) => {
    setTreino({
      ...treino,
      exercicios: treino.exercicios.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    if (!treino.titulo || !treino.cliente_id || treino.exercicios.length === 0) {
      alert("Preencha o título, selecione um cliente e adicione pelo menos um exercício");
      return;
    }
    updateTreinoMutation.mutate(treino);
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

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Carregando treino...</p>
      </div>
    );
  }

  if (!treinoOriginal) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Treino não encontrado</p>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Editar Treino</h1>
            <p className="text-slate-600">Atualize as informações do treino</p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-200">
            <CardTitle>Informações do Treino</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título do Treino</Label>
                <Input
                  placeholder="Ex: Treino A - Peito e Tríceps"
                  value={treino.titulo}
                  onChange={(e) => setTreino({...treino, titulo: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={treino.cliente_id} onValueChange={handleClienteChange}>
                  <SelectTrigger>
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
                  value={treino.duracao_estimada}
                  onChange={(e) => setTreino({...treino, duracao_estimada: parseInt(e.target.value)})}
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
          <CardHeader className="border-b border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Exercícios ({treino.exercicios.length})</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Adicione exercícios individuais ou grupos (Bi-set, Tri-set, Giga-set)
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
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

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(createPageUrl("Dashboard"))}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={updateTreinoMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-5 h-5 mr-2" />
            {updateTreinoMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
