import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Upload, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FormularioProgresso({ progresso, open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    data_registro: new Date().toISOString().split('T')[0],
    peso: "",
    percentual_gordura: "",
    massa_magra: "",
    medidas_corporais: {
      pescoco: "", ombros: "", peito: "", cintura: "", quadril: "",
      braco_direito: "", braco_esquerdo: "",
      coxa_direita: "", coxa_esquerda: "",
      panturrilha_direita: "", panturrilha_esquerda: ""
    },
    desempenho_exercicios: [],
    fotos_progresso: [],
    feedback_subjetivo: {
      nivel_energia: 3,
      qualidade_sono: 3,
      motivacao: 3,
      dores_desconfortos: "",
      comentarios_gerais: ""
    },
    observacoes_personal: "",
    metas_proxima_avaliacao: ""
  });

  const [novoExercicio, setNovoExercicio] = useState({
    exercicio_nome: "",
    carga: "",
    repeticoes: "",
    series: "",
    observacoes: ""
  });

  const [erroValidacao, setErroValidacao] = useState("");

  useEffect(() => {
    if (progresso) {
      // Formatar data para input type="date" (YYYY-MM-DD)
      let dataFormatada = progresso.data_registro;
      if (dataFormatada) {
        if (typeof dataFormatada === 'string') {
          // Se já está no formato correto, usar diretamente
          if (!dataFormatada.includes('T')) {
            dataFormatada = dataFormatada.split('T')[0];
          } else {
            dataFormatada = new Date(dataFormatada).toISOString().split('T')[0];
          }
        } else if (dataFormatada instanceof Date) {
          dataFormatada = dataFormatada.toISOString().split('T')[0];
        }
      }

      setFormData({
        data_registro: dataFormatada || new Date().toISOString().split('T')[0],
        peso: progresso.peso?.toString() || "",
        percentual_gordura: progresso.percentual_gordura?.toString() || "",
        massa_magra: progresso.massa_magra?.toString() || "",
        medidas_corporais: progresso.medidas_corporais || {
          pescoco: "", ombros: "", peito: "", cintura: "", quadril: "",
          braco_direito: "", braco_esquerdo: "",
          coxa_direita: "", coxa_esquerda: "",
          panturrilha_direita: "", panturrilha_esquerda: ""
        },
        desempenho_exercicios: progresso.desempenho_exercicios || [],
        fotos_progresso: progresso.fotos_progresso || [],
        feedback_subjetivo: progresso.feedback_subjetivo || {
          nivel_energia: 3,
          qualidade_sono: 3,
          motivacao: 3,
          dores_desconfortos: "",
          comentarios_gerais: ""
        },
        observacoes_personal: progresso.observacoes_personal || "",
        metas_proxima_avaliacao: progresso.metas_proxima_avaliacao || ""
      });
    } else {
      // Resetar formulário quando não há progresso
      setFormData({
        data_registro: new Date().toISOString().split('T')[0],
        peso: "",
        percentual_gordura: "",
        massa_magra: "",
        medidas_corporais: {
          pescoco: "", ombros: "", peito: "", cintura: "", quadril: "",
          braco_direito: "", braco_esquerdo: "",
          coxa_direita: "", coxa_esquerda: "",
          panturrilha_direita: "", panturrilha_esquerda: ""
        },
        desempenho_exercicios: [],
        fotos_progresso: [],
        feedback_subjetivo: {
          nivel_energia: 3,
          qualidade_sono: 3,
          motivacao: 3,
          dores_desconfortos: "",
          comentarios_gerais: ""
        },
        observacoes_personal: "",
        metas_proxima_avaliacao: ""
      });
    }
  }, [progresso]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErroValidacao("");

    // Validar que pelo menos um campo de dados foi preenchido
    const temPeso = formData.peso && formData.peso.trim() !== '' && !isNaN(parseFloat(formData.peso));
    const temGordura = formData.percentual_gordura && formData.percentual_gordura.trim() !== '' && !isNaN(parseFloat(formData.percentual_gordura));
    const temMassaMagra = formData.massa_magra && formData.massa_magra.trim() !== '' && !isNaN(parseFloat(formData.massa_magra));
    const temMedidas = formData.medidas_corporais && Object.values(formData.medidas_corporais).some(v => v && v.toString().trim() !== '' && !isNaN(parseFloat(v)));
    const temDesempenho = formData.desempenho_exercicios && formData.desempenho_exercicios.length > 0;
    const temFeedback = formData.feedback_subjetivo && (
      formData.feedback_subjetivo.dores_desconfortos?.trim() !== '' ||
      formData.feedback_subjetivo.comentarios_gerais?.trim() !== ''
    );
    const temObservacoes = formData.observacoes_personal && formData.observacoes_personal.trim() !== '';
    const temMetas = formData.metas_proxima_avaliacao && formData.metas_proxima_avaliacao.trim() !== '';

    const temAlgumDado = temPeso || temGordura || temMassaMagra || temMedidas || temDesempenho || temFeedback || temObservacoes || temMetas;

    if (!temAlgumDado) {
      setErroValidacao("Por favor, preencha pelo menos um campo de dados (peso, % gordura, medidas, desempenho, feedback ou observações).");
      return;
    }

    // Validar data
    if (!formData.data_registro || formData.data_registro.trim() === '') {
      setErroValidacao("A data do registro é obrigatória.");
      return;
    }
    
    const dataToSubmit = {
      ...formData,
      peso: formData.peso && formData.peso.trim() !== '' ? parseFloat(formData.peso) : null,
      percentual_gordura: formData.percentual_gordura && formData.percentual_gordura.trim() !== '' ? parseFloat(formData.percentual_gordura) : null,
      massa_magra: formData.massa_magra && formData.massa_magra.trim() !== '' ? parseFloat(formData.massa_magra) : null,
    };

    onSubmit(dataToSubmit);
  };

  const handleAdicionarExercicio = () => {
    if (!novoExercicio.exercicio_nome) return;

    setFormData({
      ...formData,
      desempenho_exercicios: [...formData.desempenho_exercicios, {
        exercicio_nome: novoExercicio.exercicio_nome,
        carga: novoExercicio.carga ? parseFloat(novoExercicio.carga) : null,
        repeticoes: novoExercicio.repeticoes ? parseInt(novoExercicio.repeticoes) : null,
        series: novoExercicio.series ? parseInt(novoExercicio.series) : null,
        observacoes: novoExercicio.observacoes
      }]
    });

    setNovoExercicio({
      exercicio_nome: "",
      carga: "",
      repeticoes: "",
      series: "",
      observacoes: ""
    });
  };

  const handleRemoverExercicio = (index) => {
    setFormData({
      ...formData,
      desempenho_exercicios: formData.desempenho_exercicios.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {progresso ? 'Editar Registro de Progresso' : 'Novo Registro de Progresso'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mensagem de erro de validação */}
          {erroValidacao && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{erroValidacao}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basico">Básico</TabsTrigger>
              <TabsTrigger value="medidas">Medidas</TabsTrigger>
              <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            {/* Tab Básico */}
            <TabsContent value="basico" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados Básicos</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Preencha pelo menos um dos campos abaixo para registrar o progresso
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_registro">
                      Data do Registro <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="data_registro"
                      type="date"
                      value={formData.data_registro}
                      onChange={(e) => {
                        setFormData({...formData, data_registro: e.target.value});
                        setErroValidacao("");
                      }}
                      required
                      className={!formData.data_registro ? "border-red-300" : ""}
                    />
                    <p className="text-xs text-slate-500">Campo obrigatório</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="peso">
                        Peso (kg) <span className="text-blue-500 text-xs">(recomendado)</span>
                      </Label>
                      <Input
                        id="peso"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.peso}
                        onChange={(e) => {
                          setFormData({...formData, peso: e.target.value});
                          setErroValidacao("");
                        }}
                        placeholder="Ex: 75.5"
                      />
                      <p className="text-xs text-slate-500">Preencha pelo menos peso ou % gordura</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="percentual_gordura">
                        % Gordura <span className="text-blue-500 text-xs">(recomendado)</span>
                      </Label>
                      <Input
                        id="percentual_gordura"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.percentual_gordura}
                        onChange={(e) => {
                          setFormData({...formData, percentual_gordura: e.target.value});
                          setErroValidacao("");
                        }}
                        placeholder="Ex: 18.5"
                      />
                      <p className="text-xs text-slate-500">Preencha pelo menos peso ou % gordura</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="massa_magra">Massa Magra (kg)</Label>
                      <Input
                        id="massa_magra"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.massa_magra}
                        onChange={(e) => {
                          setFormData({...formData, massa_magra: e.target.value});
                          setErroValidacao("");
                        }}
                        placeholder="Ex: 61.4"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Observações do Personal Trainer</Label>
                    <Textarea
                      value={formData.observacoes_personal}
                      onChange={(e) => setFormData({...formData, observacoes_personal: e.target.value})}
                      rows={3}
                      placeholder="Observações gerais sobre o progresso do cliente..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Metas para Próxima Avaliação</Label>
                    <Textarea
                      value={formData.metas_proxima_avaliacao}
                      onChange={(e) => setFormData({...formData, metas_proxima_avaliacao: e.target.value})}
                      rows={2}
                      placeholder="Ex: Reduzir 2% de gordura, aumentar carga no supino..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Medidas */}
            <TabsContent value="medidas" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medidas Corporais (cm)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries({
                      pescoco: "Pescoço",
                      ombros: "Ombros",
                      peito: "Peito",
                      cintura: "Cintura",
                      quadril: "Quadril",
                      braco_direito: "Braço Direito",
                      braco_esquerdo: "Braço Esquerdo",
                      coxa_direita: "Coxa Direita",
                      coxa_esquerda: "Coxa Esquerda",
                      panturrilha_direita: "Panturrilha Direita",
                      panturrilha_esquerda: "Panturrilha Esquerda"
                    }).map(([key, label]) => (
                      <div key={key} className="space-y-2">
                        <Label className="text-xs">{label}</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.medidas_corporais[key]}
                          onChange={(e) => setFormData({
                            ...formData,
                            medidas_corporais: {
                              ...formData.medidas_corporais,
                              [key]: e.target.value
                            }
                          })}
                          placeholder="cm"
                          className="h-9"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Desempenho */}
            <TabsContent value="desempenho" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Desempenho em Exercícios</CardTitle>
                  <p className="text-sm text-slate-600">Registre cargas e repetições</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-5 gap-3 p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                    <div className="space-y-2">
                      <Label className="text-xs">Exercício</Label>
                      <Input
                        value={novoExercicio.exercicio_nome}
                        onChange={(e) => setNovoExercicio({...novoExercicio, exercicio_nome: e.target.value})}
                        placeholder="Nome"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Carga (kg)</Label>
                      <Input
                        type="number"
                        value={novoExercicio.carga}
                        onChange={(e) => setNovoExercicio({...novoExercicio, carga: e.target.value})}
                        placeholder="kg"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Reps</Label>
                      <Input
                        type="number"
                        value={novoExercicio.repeticoes}
                        onChange={(e) => setNovoExercicio({...novoExercicio, repeticoes: e.target.value})}
                        placeholder="Reps"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Séries</Label>
                      <Input
                        type="number"
                        value={novoExercicio.series}
                        onChange={(e) => setNovoExercicio({...novoExercicio, series: e.target.value})}
                        placeholder="Sets"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs opacity-0">Add</Label>
                      <Button
                        type="button"
                        onClick={handleAdicionarExercicio}
                        className="h-9 w-full"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {formData.desempenho_exercicios.length > 0 && (
                    <div className="space-y-2">
                      {formData.desempenho_exercicios.map((ex, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div>
                            <p className="font-semibold text-sm">{ex.exercicio_nome}</p>
                            <p className="text-xs text-slate-600">
                              {ex.carga}kg • {ex.repeticoes} reps • {ex.series} séries
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoverExercicio(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Feedback */}
            <TabsContent value="feedback" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feedback Subjetivo do Cliente</CardTitle>
                  <p className="text-sm text-slate-600">Avalie aspectos qualitativos</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Nível de Energia</Label>
                        <span className="text-sm font-semibold text-slate-900">
                          {formData.feedback_subjetivo.nivel_energia}/5
                        </span>
                      </div>
                      <Slider
                        value={[formData.feedback_subjetivo.nivel_energia]}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          feedback_subjetivo: {...formData.feedback_subjetivo, nivel_energia: value[0]}
                        })}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Muito Baixo</span>
                        <span>Muito Alto</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Qualidade do Sono</Label>
                        <span className="text-sm font-semibold text-slate-900">
                          {formData.feedback_subjetivo.qualidade_sono}/5
                        </span>
                      </div>
                      <Slider
                        value={[formData.feedback_subjetivo.qualidade_sono]}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          feedback_subjetivo: {...formData.feedback_subjetivo, qualidade_sono: value[0]}
                        })}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Muito Ruim</span>
                        <span>Excelente</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Motivação</Label>
                        <span className="text-sm font-semibold text-slate-900">
                          {formData.feedback_subjetivo.motivacao}/5
                        </span>
                      </div>
                      <Slider
                        value={[formData.feedback_subjetivo.motivacao]}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          feedback_subjetivo: {...formData.feedback_subjetivo, motivacao: value[0]}
                        })}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Muito Baixa</span>
                        <span>Muito Alta</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dores ou Desconfortos</Label>
                    <Textarea
                      value={formData.feedback_subjetivo.dores_desconfortos}
                      onChange={(e) => setFormData({
                        ...formData,
                        feedback_subjetivo: {...formData.feedback_subjetivo, dores_desconfortos: e.target.value}
                      })}
                      rows={2}
                      placeholder="Descreva qualquer dor ou desconforto relatado pelo cliente..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Comentários Gerais do Cliente</Label>
                    <Textarea
                      value={formData.feedback_subjetivo.comentarios_gerais}
                      onChange={(e) => setFormData({
                        ...formData,
                        feedback_subjetivo: {...formData.feedback_subjetivo, comentarios_gerais: e.target.value}
                      })}
                      rows={3}
                      placeholder="Comentários do cliente sobre como está se sentindo, dificuldades, etc..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 pt-4 border-t">
            {/* Nota informativa */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Importante:</strong> Preencha pelo menos um campo de dados (peso, % gordura, medidas corporais, desempenho de exercícios, feedback ou observações) para salvar o registro.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {progresso ? 'Atualizar Registro' : 'Salvar Registro'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}