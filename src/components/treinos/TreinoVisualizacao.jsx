import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Dumbbell, Timer, Repeat, Layers, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import TreinoExecucao from "@/components/treinos/TreinoExecucao";

const gruposMusculares = {
  peito: { label: "Peito", icon: "💪", color: "bg-blue-100 text-blue-700" },
  costas: { label: "Costas", icon: "🦾", color: "bg-green-100 text-green-700" },
  pernas: { label: "Pernas", icon: "🦵", color: "bg-purple-100 text-purple-700" },
  ombros: { label: "Ombros", icon: "💪", color: "bg-orange-100 text-orange-700" },
  bracos: { label: "Braços", icon: "💪", color: "bg-red-100 text-red-700" },
  abdomen: { label: "Abdômen", icon: "🔥", color: "bg-yellow-100 text-yellow-700" },
  cardio: { label: "Cardio", icon: "🏃", color: "bg-pink-100 text-pink-700" },
  corpo_todo: { label: "Corpo Todo", icon: "🏋️", color: "bg-indigo-100 text-indigo-700" }
};

const tipoSetLabels = {
  'bi-set': { label: 'Bi-set', color: 'bg-purple-600', icon: <Layers className="w-3 h-3" /> },
  'tri-set': { label: 'Tri-set', color: 'bg-pink-600', icon: <Layers className="w-3 h-3" /> },
  'giga-set': { label: 'Giga-set', color: 'bg-orange-600', icon: <Layers className="w-3 h-3" /> }
};

export default function TreinoVisualizacao({ treino, open, onClose }) {
  const [showExecucao, setShowExecucao] = useState(false);

  if (!treino) return null;

  const handleIniciarTreino = () => {
    setShowExecucao(true);
  };

  return (
    <>
      <Dialog open={open && !showExecucao} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-auto w-[calc(100vw-24px)] sm:w-full">
          <DialogHeader>
            <div className="space-y-2 md:space-y-3">
              <DialogTitle className="text-lg md:text-2xl font-bold pr-6">{treino.titulo}</DialogTitle>
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                <Badge className="bg-blue-600 text-white text-[10px] md:text-xs">
                  {treino.tipo}
                </Badge>
                {treino.duracao_estimada && (
                  <Badge variant="outline" className="flex items-center gap-1 text-[10px] md:text-xs">
                    <Timer className="w-3 h-3" />
                    {treino.duracao_estimada} min
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1 text-[10px] md:text-xs">
                  <Dumbbell className="w-3 h-3" />
                  {treino.exercicios?.reduce((acc, item) => 
                    acc + (item.tipo_item === 'exercicio' ? 1 : item.exercicios_grupo?.length || 0), 0
                  ) || 0} exercícios
                </Badge>
              </div>
              {treino.descricao && (
                <p className="text-slate-600 text-xs md:text-sm">{treino.descricao}</p>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-3 md:space-y-4 mt-3 md:mt-4">
            {/* Botão Iniciar Treino */}
            <Button
              onClick={handleIniciarTreino}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg py-6 shadow-lg"
            >
              <Play className="w-6 h-6 mr-2 fill-white" />
              Iniciar Treino Guiado
            </Button>

            {treino.exercicios && treino.exercicios.length > 0 ? (
              treino.exercicios.map((item, index) => {
                // Exercício Individual
                if (item.tipo_item === 'exercicio') {
                  const grupoInfo = gruposMusculares[item.grupo_muscular] || { label: item.grupo_muscular, icon: "💪", color: "bg-gray-100 text-gray-700" };
                  
                  return (
                    <Card key={index} className="bg-white">
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-700 font-bold text-sm md:text-base">{index + 1}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm md:text-lg text-slate-900 break-words mb-2">
                              {item.nome}
                            </h3>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge className={grupoInfo.color + " text-[10px] md:text-xs"}>
                                {grupoInfo.icon} {grupoInfo.label}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1 text-[10px] md:text-xs">
                                {item.tipo_execucao === 'tempo' ? (
                                  <><Timer className="w-3 h-3" /> {item.tempo_execucao}s</>
                                ) : (
                                  <><Repeat className="w-3 h-3" /> {item.repeticoes} reps</>
                                )}
                              </Badge>
                              {item.series && (
                                <Badge variant="outline" className="text-[10px] md:text-xs">
                                  {item.series} séries
                                </Badge>
                              )}
                              {item.descanso && (
                                <Badge variant="outline" className="text-[10px] md:text-xs">
                                  Desc: {item.descanso}
                                </Badge>
                              )}
                            </div>

                            {item.video_url && (
                              <a 
                                href={item.video_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs text-red-700 transition-colors"
                              >
                                <span className="text-base">📹</span>
                                <span>Ver vídeo demonstrativo</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}

                            {item.observacoes && (
                              <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs text-slate-700">
                                  <span className="font-semibold">💡 Dica: </span>
                                  {item.observacoes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                // Grupo de Exercícios (Bi-set, Tri-set, Giga-set)
                const setInfo = tipoSetLabels[item.tipo_item] || tipoSetLabels['bi-set'];
                
                return (
                  <Card key={index} className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${setInfo.color} text-white flex items-center gap-1`}>
                          {setInfo.icon}
                          {setInfo.label}
                        </Badge>
                        {item.series && (
                          <Badge variant="outline" className="text-[10px] md:text-xs">
                            {item.series} séries
                          </Badge>
                        )}
                        {item.descanso && (
                          <Badge variant="outline" className="text-[10px] md:text-xs">
                            Desc: {item.descanso}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        {item.exercicios_grupo?.map((ex, exIndex) => {
                          const grupoInfo = gruposMusculares[ex.grupo_muscular] || { label: ex.grupo_muscular, icon: "💪", color: "bg-gray-100 text-gray-700" };
                          
                          return (
                            <div key={exIndex} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-200">
                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-purple-700 font-bold text-xs">{exIndex + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-slate-900 break-words">{ex.nome}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <Badge className={grupoInfo.color + " text-[10px]"}>
                                    {grupoInfo.icon} {grupoInfo.label}
                                  </Badge>
                                  <Badge variant="outline" className="flex items-center gap-1 text-[10px]">
                                    {ex.tipo_execucao === 'tempo' ? (
                                      <><Timer className="w-2 h-2" /> {ex.tempo_execucao}s</>
                                    ) : (
                                      <><Repeat className="w-2 h-2" /> {ex.repeticoes}</>
                                    )}
                                  </Badge>
                                </div>
                                {ex.video_url && (
                                  <a 
                                    href={ex.video_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 mt-1 text-[10px] text-red-600 hover:text-red-700"
                                  >
                                    <span>📹</span>
                                    <span>Ver vídeo</span>
                                    <ExternalLink className="w-2 h-2" />
                                  </a>
                                )}
                                {ex.observacoes && (
                                  <p className="text-[10px] text-slate-600 mt-1">💡 {ex.observacoes}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-xs text-purple-900">
                          <strong>ℹ️ Execução:</strong> Realize todos os exercícios em sequência sem pausa entre eles.
                          {item.descanso && ` Descanse ${item.descanso} após completar o grupo.`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-6 md:py-8 text-slate-500 text-sm md:text-base">
                <p>Este treino não possui exercícios cadastrados.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 md:gap-3 pt-3 md:pt-4 border-t">
            <Button onClick={onClose} variant="outline" className="min-h-[44px] text-sm md:text-base">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showExecucao && (
        <TreinoExecucao
          treino={treino}
          open={showExecucao}
          onClose={() => {
            setShowExecucao(false);
            onClose();
          }}
        />
      )}
    </>
  );
}