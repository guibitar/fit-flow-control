
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Layers, Timer, Repeat, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const gruposMusculares = [
  { value: "peito", label: "Peito", icon: "💪" },
  { value: "costas", label: "Costas", icon: "🦾" },
  { value: "pernas", label: "Pernas", icon: "🦵" },
  { value: "ombros", label: "Ombros", icon: "💪" },
  { value: "bracos", label: "Braços", icon: "💪" },
  { value: "abdomen", label: "Abdômen", icon: "🔥" },
  { value: "cardio", label: "Cardio", icon: "🏃" },
  { value: "corpo_todo", label: "Corpo Todo", icon: "🏋️" }
];

export default function ExercicioFormAvancado({ onAdd }) {
  const queryClient = useQueryClient();
  const [tipoItem, setTipoItem] = useState('exercicio');
  
  const { data: exerciciosBiblioteca = [] } = useQuery({
    queryKey: ['exercicios-biblioteca'],
    queryFn: () => base44.entities.ExercicioBiblioteca.list('numero'),
    initialData: [],
  });

  const updateExercicioBibliotecaMutation = useMutation({
    mutationFn: ({ id, video_url }) => 
      base44.entities.ExercicioBiblioteca.update(id, { video_url_padrao: video_url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercicios-biblioteca'] });
    },
    onError: (error) => {
      console.error("Erro ao atualizar vídeo na biblioteca:", error);
    }
  });
  
  const [exercicio, setExercicio] = useState({
    nome: "",
    grupo_muscular: "peito",
    tipo_execucao: "repeticao",
    series: 3,
    repeticoes: "10-12",
    tempo_execucao: 30,
    descanso: "60s",
    descanso_segundos: 60,
    observacoes: "",
    video_url: ""
  });

  const [grupoExercicios, setGrupoExercicios] = useState({
    tipo_set: "bi-set",
    series: 3,
    descanso: "90s",
    descanso_segundos: 90,
    exercicios: []
  });

  const [exercicioTemp, setExercicioTemp] = useState({
    nome: "",
    grupo_muscular: "peito",
    tipo_execucao: "repeticao",
    repeticoes: "10-12",
    tempo_execucao: 30,
    observacoes: "",
    video_url: ""
  });

  const [filtroExercicio, setFiltroExercicio] = useState("");
  const [mostrarListaExercicios, setMostrarListaExercicios] = useState(false);
  const [filtroExercicioGrupo, setFiltroExercicioGrupo] = useState("");
  const [mostrarListaExerciciosGrupo, setMostrarListaExerciciosGrupo] = useState(false);

  const converterDescansoParaSegundos = (descanso) => {
    if (!descanso) return 0;
    const match = descanso.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const exerciciosFiltrados = exerciciosBiblioteca.filter(ex =>
    ex.nome.toLowerCase().includes(filtroExercicio.toLowerCase())
  );

  const exerciciosFiltradosGrupo = exerciciosBiblioteca.filter(ex =>
    ex.nome.toLowerCase().includes(filtroExercicioGrupo.toLowerCase())
  );

  const handleSelecionarExercicio = (exercicioBiblioteca) => {
    setExercicio({
      ...exercicio, 
      nome: exercicioBiblioteca.nome, 
      grupo_muscular: exercicioBiblioteca.grupo_muscular,
      video_url: exercicioBiblioteca.video_url_padrao || ""
    });
    setFiltroExercicio(exercicioBiblioteca.nome);
    setMostrarListaExercicios(false);
  };

  const handleSelecionarExercicioGrupo = (exercicioBiblioteca) => {
    setExercicioTemp({
      ...exercicioTemp, 
      nome: exercicioBiblioteca.nome, 
      grupo_muscular: exercicioBiblioteca.grupo_muscular,
      video_url: exercicioBiblioteca.video_url_padrao || ""
    });
    setFiltroExercicioGrupo(exercicioBiblioteca.nome);
    setMostrarListaExerciciosGrupo(false);
  };

  const atualizarVideoBiblioteca = (nomeExercicio, videoUrl) => {
    if (!videoUrl || !videoUrl.trim()) return;
    
    const exercicioBiblioteca = exerciciosBiblioteca.find(
      ex => ex.nome.toLowerCase() === nomeExercicio.toLowerCase()
    );
    
    if (exercicioBiblioteca) {
      updateExercicioBibliotecaMutation.mutate({
        id: exercicioBiblioteca.id,
        video_url: videoUrl
      });
    }
  };

  const handleSubmitExercicio = () => {
    if (!exercicio.nome) {
      alert("Digite o nome do exercício");
      return;
    }

    if (exercicio.video_url && exercicio.video_url.trim()) {
      atualizarVideoBiblioteca(exercicio.nome, exercicio.video_url);
    }

    const item = {
      tipo_item: 'exercicio',
      ...exercicio,
      descanso_segundos: converterDescansoParaSegundos(exercicio.descanso)
    };

    onAdd(item);
    
    setExercicio({
      nome: "",
      grupo_muscular: "peito",
      tipo_execucao: "repeticao",
      series: 3,
      repeticoes: "10-12",
      tempo_execucao: 30,
      descanso: "60s",
      descanso_segundos: 60,
      observacoes: "",
      video_url: ""
    });
    setFiltroExercicio("");
  };

  const handleAdicionarAoGrupo = () => {
    if (!exercicioTemp.nome) {
      alert("Digite o nome do exercício");
      return;
    }

    if (exercicioTemp.video_url && exercicioTemp.video_url.trim()) {
      atualizarVideoBiblioteca(exercicioTemp.nome, exercicioTemp.video_url);
    }

    setGrupoExercicios({
      ...grupoExercicios,
      exercicios: [...grupoExercicios.exercicios, { ...exercicioTemp }]
    });

    setExercicioTemp({
      nome: "",
      grupo_muscular: "peito",
      tipo_execucao: "repeticao",
      repeticoes: "10-12",
      tempo_execucao: 30,
      observacoes: "",
      video_url: ""
    });
    setFiltroExercicioGrupo("");
  };

  const handleRemoverDoGrupo = (index) => {
    setGrupoExercicios({
      ...grupoExercicios,
      exercicios: grupoExercicios.exercicios.filter((_, i) => i !== index)
    });
  };

  const handleSubmitGrupo = () => {
    const minExercicios = grupoExercicios.tipo_set === 'bi-set' ? 2 : 
                         grupoExercicios.tipo_set === 'tri-set' ? 3 : 4;

    if (grupoExercicios.exercicios.length < minExercicios) {
      alert(`Adicione pelo menos ${minExercicios} exercícios para um ${grupoExercicios.tipo_set}`);
      return;
    }

    const item = {
      tipo_item: grupoExercicios.tipo_set,
      series: grupoExercicios.series,
      descanso: grupoExercicios.descanso,
      descanso_segundos: converterDescansoParaSegundos(grupoExercicios.descanso),
      exercicios_grupo: grupoExercicios.exercicios
    };

    onAdd(item);

    setGrupoExercicios({
      tipo_set: "bi-set",
      series: 3,
      descanso: "90s",
      descanso_segundos: 90,
      exercicios: []
    });
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-dashed border-blue-200">
      <CardContent className="p-4 md:p-6">
        <Tabs value={tipoItem} onValueChange={setTipoItem}>
          <TabsList className="grid w-full grid-cols-2 mb-4 h-auto">
            <TabsTrigger value="exercicio" className="min-h-[44px] text-xs md:text-sm">
              Exercício Individual
            </TabsTrigger>
            <TabsTrigger value="grupo" className="flex items-center gap-2 min-h-[44px] text-xs md:text-sm">
              <Layers className="w-3 h-3 md:w-4 md:h-4" />
              Bi/Tri/Giga-set
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exercicio" className="space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm md:text-base">Adicionar Exercício</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <Label className="text-sm">Nome do Exercício *</Label>
                <Input
                  value={filtroExercicio || exercicio.nome}
                  onChange={(e) => {
                    setFiltroExercicio(e.target.value);
                    setExercicio({...exercicio, nome: e.target.value});
                    setMostrarListaExercicios(true);
                  }}
                  onFocus={() => setMostrarListaExercicios(true)}
                  onBlur={() => setTimeout(() => setMostrarListaExercicios(false), 200)}
                  placeholder="Digite ou selecione"
                  className="min-h-[44px] text-sm md:text-base"
                />
                {mostrarListaExercicios && exerciciosFiltrados.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {exerciciosFiltrados.map((ex) => (
                      <div
                        key={ex.id}
                        className="px-3 py-3 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-b-0 active:bg-blue-100 transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelecionarExercicio(ex);
                        }}
                      >
                        <span className="font-medium">{ex.nome}</span>
                        <span className="text-xs text-slate-500 ml-2">({ex.grupo_muscular})</span>
                        {ex.video_url_padrao && (
                          <span className="ml-2 text-xs text-red-600">📹</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Grupo Muscular</Label>
                <Select 
                  value={exercicio.grupo_muscular} 
                  onValueChange={(value) => setExercicio({...exercicio, grupo_muscular: value})}
                >
                  <SelectTrigger className="min-h-[44px] text-sm md:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gruposMusculares.map((grupo) => (
                      <SelectItem key={grupo.value} value={grupo.value} className="min-h-[44px]">
                        {grupo.icon} {grupo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Link do Vídeo (opcional)</Label>
              <div className="flex gap-2">
                <LinkIcon className="w-5 h-5 text-slate-400 mt-3 flex-shrink-0" />
                <Input
                  value={exercicio.video_url}
                  onChange={(e) => setExercicio({...exercicio, video_url: e.target.value})}
                  placeholder="https://youtube.com/..."
                  className="min-h-[44px] text-sm md:text-base"
                />
              </div>
              {exercicio.video_url && (
                <p className="text-xs text-slate-500">
                  💡 Este link será salvo como padrão para "{exercicio.nome}"
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Tipo de Execução</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={exercicio.tipo_execucao === 'repeticao' ? 'default' : 'outline'}
                  onClick={() => setExercicio({...exercicio, tipo_execucao: 'repeticao'})}
                  className="w-full min-h-[44px] text-sm"
                >
                  <Repeat className="w-4 h-4 mr-2" />
                  Repetição
                </Button>
                <Button
                  type="button"
                  variant={exercicio.tipo_execucao === 'tempo' ? 'default' : 'outline'}
                  onClick={() => setExercicio({...exercicio, tipo_execucao: 'tempo'})}
                  className="w-full min-h-[44px] text-sm"
                >
                  <Timer className="w-4 h-4 mr-2" />
                  Tempo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Séries</Label>
                <Input
                  type="number"
                  value={exercicio.series}
                  onChange={(e) => setExercicio({...exercicio, series: parseInt(e.target.value) || 3})}
                  className="min-h-[44px] text-sm md:text-base"
                />
              </div>
              
              {exercicio.tipo_execucao === 'repeticao' ? (
                <div className="space-y-2">
                  <Label className="text-sm">Repetições</Label>
                  <Input
                    value={exercicio.repeticoes}
                    onChange={(e) => setExercicio({...exercicio, repeticoes: e.target.value})}
                    placeholder="10-12"
                    className="min-h-[44px] text-sm md:text-base"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-sm">Tempo (s)</Label>
                  <Input
                    type="number"
                    value={exercicio.tempo_execucao}
                    onChange={(e) => setExercicio({...exercicio, tempo_execucao: parseInt(e.target.value) || 30})}
                    className="min-h-[44px] text-sm md:text-base"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm">Descanso</Label>
                <Input
                  value={exercicio.descanso}
                  onChange={(e) => setExercicio({...exercicio, descanso: e.target.value})}
                  placeholder="60s"
                  className="min-h-[44px] text-sm md:text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Observações</Label>
              <Textarea
                value={exercicio.observacoes}
                onChange={(e) => setExercicio({...exercicio, observacoes: e.target.value})}
                placeholder="Técnicas, variações..."
                rows={2}
                className="text-sm md:text-base resize-none"
              />
            </div>

            <Button 
              type="button"
              onClick={handleSubmitExercicio}
              className="w-full bg-blue-600 hover:bg-blue-700 min-h-[48px] text-sm md:text-base"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Exercício ao Treino
            </Button>
          </TabsContent>

          <TabsContent value="grupo" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-900 text-sm md:text-base">Criar Grupo de Exercícios</h3>
              <Select 
                value={grupoExercicios.tipo_set} 
                onValueChange={(value) => setGrupoExercicios({...grupoExercicios, tipo_set: value})}
              >
                <SelectTrigger className="w-full sm:w-40 min-h-[44px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bi-set" className="min-h-[44px]">Bi-set (2)</SelectItem>
                  <SelectItem value="tri-set" className="min-h-[44px]">Tri-set (3)</SelectItem>
                  <SelectItem value="giga-set" className="min-h-[44px]">Giga-set (4+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
              <p className="text-xs text-purple-900">
                <strong>ℹ️ Grupos de exercícios:</strong> Executados em sequência sem pausa entre eles.
              </p>
            </div>

            {grupoExercicios.exercicios.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Exercícios no Grupo ({grupoExercicios.exercicios.length})</Label>
                {grupoExercicios.exercicios.map((ex, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-slate-200">
                    <Badge className="bg-purple-600 flex-shrink-0">{index + 1}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm break-words">{ex.nome}</p>
                      <p className="text-xs text-slate-600">
                        {ex.tipo_execucao === 'tempo' ? `${ex.tempo_execucao}s` : ex.repeticoes}
                        {ex.video_url && <span className="ml-2">📹</span>}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoverDoGrupo(index)}
                      className="text-red-600 flex-shrink-0 min-w-[44px] min-h-[44px]"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 p-4 bg-white rounded-lg border-2 border-dashed border-purple-300">
              <Label className="text-sm">Adicionar Exercício ao Grupo</Label>
              
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2 relative">
                  <Label className="text-xs">Nome *</Label>
                  <Input
                    value={filtroExercicioGrupo || exercicioTemp.nome}
                    onChange={(e) => {
                      setFiltroExercicioGrupo(e.target.value);
                      setExercicioTemp({...exercicioTemp, nome: e.target.value});
                      setMostrarListaExerciciosGrupo(true);
                    }}
                    onFocus={() => setMostrarListaExerciciosGrupo(true)}
                    onBlur={() => setTimeout(() => setMostrarListaExerciciosGrupo(false), 200)}
                    placeholder="Digite ou selecione"
                    className="min-h-[44px] text-sm"
                  />
                  {mostrarListaExerciciosGrupo && exerciciosFiltradosGrupo.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {exerciciosFiltradosGrupo.map((ex) => (
                        <div
                          key={ex.id}
                          className="px-3 py-3 hover:bg-purple-50 cursor-pointer text-xs border-b last:border-b-0 active:bg-purple-100"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelecionarExercicioGrupo(ex);
                          }}
                        >
                          <span className="font-medium">{ex.nome}</span>
                          <span className="text-xs text-slate-500 ml-2">({ex.grupo_muscular})</span>
                          {ex.video_url_padrao && (
                            <span className="ml-2 text-xs text-red-600">📹</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Grupo Muscular</Label>
                  <Select 
                    value={exercicioTemp.grupo_muscular} 
                    onValueChange={(value) => setExercicioTemp({...exercicioTemp, grupo_muscular: value})}
                  >
                    <SelectTrigger className="min-h-[44px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gruposMusculares.map((grupo) => (
                        <SelectItem key={grupo.value} value={grupo.value} className="min-h-[44px]">
                          {grupo.icon} {grupo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Link do Vídeo (opcional)</Label>
                <div className="flex gap-2">
                  <LinkIcon className="w-4 h-4 text-slate-400 mt-3 flex-shrink-0" />
                  <Input
                    value={exercicioTemp.video_url}
                    onChange={(e) => setExercicioTemp({...exercicioTemp, video_url: e.target.value})}
                    placeholder="https://youtube.com/..."
                    className="min-h-[44px] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant={exercicioTemp.tipo_execucao === 'repeticao' ? 'default' : 'outline'}
                  onClick={() => setExercicioTemp({...exercicioTemp, tipo_execucao: 'repeticao'})}
                  className="min-h-[44px] text-xs"
                >
                  <Repeat className="w-3 h-3 mr-1" />
                  Repetição
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={exercicioTemp.tipo_execucao === 'tempo' ? 'default' : 'outline'}
                  onClick={() => setExercicioTemp({...exercicioTemp, tipo_execucao: 'tempo'})}
                  className="min-h-[44px] text-xs"
                >
                  <Timer className="w-3 h-3 mr-1" />
                  Tempo
                </Button>
              </div>

              {exercicioTemp.tipo_execucao === 'repeticao' ? (
                <div className="space-y-2">
                  <Label className="text-xs">Repetições</Label>
                  <Input
                    value={exercicioTemp.repeticoes}
                    onChange={(e) => setExercicioTemp({...exercicioTemp, repeticoes: e.target.value})}
                    placeholder="12-15"
                    className="min-h-[44px] text-sm"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs">Tempo (segundos)</Label>
                  <Input
                    type="number"
                    value={exercicioTemp.tempo_execucao}
                    onChange={(e) => setExercicioTemp({...exercicioTemp, tempo_execucao: parseInt(e.target.value) || 30})}
                    className="min-h-[44px] text-sm"
                  />
                </div>
              )}

              <Button 
                type="button"
                onClick={handleAdicionarAoGrupo}
                variant="outline"
                size="sm"
                className="w-full min-h-[44px] text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar ao Grupo
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Séries do Grupo</Label>
                <Input
                  type="number"
                  value={grupoExercicios.series}
                  onChange={(e) => setGrupoExercicios({...grupoExercicios, series: parseInt(e.target.value) || 3})}
                  className="min-h-[44px] text-sm md:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Descanso</Label>
                <Input
                  value={grupoExercicios.descanso}
                  onChange={(e) => setGrupoExercicios({...grupoExercicios, descanso: e.target.value})}
                  placeholder="90s"
                  className="min-h-[44px] text-sm md:text-base"
                />
              </div>
            </div>

            <Button 
              type="button"
              onClick={handleSubmitGrupo}
              className="w-full bg-purple-600 hover:bg-purple-700 min-h-[48px] text-sm md:text-base"
              disabled={grupoExercicios.exercicios.length === 0}
            >
              <Layers className="w-5 h-5 mr-2" />
              Adicionar {grupoExercicios.tipo_set} ao Treino
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
