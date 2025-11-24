import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Video } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

export default function ExercicioForm({ onAdd }) {
  const queryClient = useQueryClient();
  const [showBiblioteca, setShowBiblioteca] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [grupoFiltro, setGrupoFiltro] = useState("");
  const [exercicioSelecionadoId, setExercicioSelecionadoId] = useState(null);
  
  const [exercicio, setExercicio] = useState({
    nome: "",
    grupo_muscular: "peito",
    series: 3,
    repeticoes: "10-12",
    descanso: "60s",
    observacoes: "",
    video_url: ""
  });

  const { data: biblioteca = [] } = useQuery({
    queryKey: ['biblioteca-exercicios'],
    queryFn: () => base44.entities.ExercicioBiblioteca.list('numero'),
    initialData: [],
  });

  const updateExercicioBibliotecaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ExercicioBiblioteca.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biblioteca-exercicios'] });
    },
  });

  const exerciciosFiltrados = biblioteca.filter(ex => {
    const matchSearch = searchTerm === "" || 
      ex.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.numero.toString().includes(searchTerm);
    const matchGrupo = grupoFiltro === "" || ex.grupo_muscular === grupoFiltro;
    return matchSearch && matchGrupo;
  });

  const selecionarExercicio = (exBiblioteca) => {
    setExercicio({
      ...exercicio,
      nome: exBiblioteca.nome,
      grupo_muscular: exBiblioteca.grupo_muscular,
      video_url: exBiblioteca.video_url_padrao || ""
    });
    setExercicioSelecionadoId(exBiblioteca.id);
    setShowBiblioteca(false);
    setSearchTerm("");
  };

  const handleSubmit = async () => {
    if (!exercicio.nome) {
      alert("Selecione ou digite o nome do exercício");
      return;
    }

    // Se uma URL foi adicionada e o exercício veio da biblioteca, atualiza a URL padrão
    if (exercicio.video_url && exercicioSelecionadoId) {
      updateExercicioBibliotecaMutation.mutate({
        id: exercicioSelecionadoId,
        data: { video_url_padrao: exercicio.video_url }
      });
    }

    onAdd(exercicio);
    
    setExercicio({
      nome: "",
      grupo_muscular: "peito",
      series: 3,
      repeticoes: "10-12",
      descanso: "60s",
      observacoes: "",
      video_url: ""
    });
    setExercicioSelecionadoId(null);
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-dashed border-blue-200">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-900 mb-4">Adicionar Exercício</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Exercício *</Label>
              <div className="flex gap-2">
                <Input
                  value={exercicio.nome}
                  onChange={(e) => setExercicio({...exercicio, nome: e.target.value})}
                  placeholder="Digite ou busque na biblioteca"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBiblioteca(true)}
                  className="shrink-0"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Grupo Muscular</Label>
              <Select 
                value={exercicio.grupo_muscular} 
                onValueChange={(value) => setExercicio({...exercicio, grupo_muscular: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gruposMusculares.map((grupo) => (
                    <SelectItem key={grupo.value} value={grupo.value}>
                      {grupo.icon} {grupo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Séries</Label>
              <Input
                type="number"
                value={exercicio.series}
                onChange={(e) => setExercicio({...exercicio, series: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Repetições</Label>
              <Input
                value={exercicio.repeticoes}
                onChange={(e) => setExercicio({...exercicio, repeticoes: e.target.value})}
                placeholder="Ex: 10-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Descanso</Label>
              <Input
                value={exercicio.descanso}
                onChange={(e) => setExercicio({...exercicio, descanso: e.target.value})}
                placeholder="Ex: 60s"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              URL do Vídeo (YouTube, Instagram, etc)
              {exercicioSelecionadoId && exercicio.video_url && (
                <span className="text-xs text-blue-600">(Será salva como padrão)</span>
              )}
            </Label>
            <Input
              value={exercicio.video_url}
              onChange={(e) => setExercicio({...exercicio, video_url: e.target.value})}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={exercicio.observacoes}
              onChange={(e) => setExercicio({...exercicio, observacoes: e.target.value})}
              placeholder="Técnicas, variações, atenção especial..."
              rows={2}
            />
          </div>

          <Button 
            type="button"
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Exercício ao Treino
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showBiblioteca} onOpenChange={setShowBiblioteca}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Biblioteca de Exercícios</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={grupoFiltro} onValueChange={setGrupoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todos os grupos</SelectItem>
                  {gruposMusculares.map((grupo) => (
                    <SelectItem key={grupo.value} value={grupo.value}>
                      {grupo.icon} {grupo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-y-auto max-h-96 space-y-2">
              {exerciciosFiltrados.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => selecionarExercicio(ex)}
                  className="p-3 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
                          #{ex.numero}
                        </span>
                        <h4 className="font-semibold text-slate-900">{ex.nome}</h4>
                        {ex.video_url_padrao && (
                          <Video className="w-4 h-4 text-blue-500" title="Tem vídeo padrão" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {gruposMusculares.find(g => g.value === ex.grupo_muscular)?.label}
                        </span>
                        {ex.equipamento && (
                          <span className="text-slate-500">{ex.equipamento}</span>
                        )}
                      </div>
                      {ex.descricao && (
                        <p className="text-xs text-slate-600 mt-1">{ex.descricao}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {exerciciosFiltrados.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p>Nenhum exercício encontrado</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}