import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, X, Clock, Dumbbell, Repeat, Timer, ExternalLink } from "lucide-react";

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

export default function TreinoPreview({ treino, open, onClose, onCopiar }) {
  if (!treino) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-auto w-[calc(100vw-24px)] sm:w-full">
        <DialogHeader>
          <div className="space-y-2 md:space-y-3">
            <DialogTitle className="text-lg md:text-xl font-bold pr-6">{treino.titulo}</DialogTitle>
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <Badge className="bg-blue-600 text-white text-[10px] md:text-xs">
                {treino.tipo}
              </Badge>
              {treino.duracao_estimada && (
                <Badge variant="outline" className="flex items-center gap-1 text-[10px] md:text-xs">
                  <Clock className="w-3 h-3" />
                  {treino.duracao_estimada} min
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1 text-[10px] md:text-xs">
                <Dumbbell className="w-3 h-3" />
                {treino.exercicios?.length || 0} exercícios
              </Badge>
            </div>
            {treino.descricao && (
              <p className="text-slate-600 text-xs md:text-sm bg-blue-50 p-2 md:p-3 rounded-lg">
                {treino.descricao}
              </p>
            )}
            <div className="bg-amber-50 border border-amber-200 p-2 md:p-3 rounded-lg">
              <p className="text-xs md:text-sm text-amber-900">
                <strong>💡 Nota:</strong> Ao copiar, o cliente e a data serão resetados. 
                Você precisará preencher essas informações no novo treino.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4 mt-3 md:mt-4">
          {treino.exercicios && treino.exercicios.length > 0 ? (
            treino.exercicios.map((exercicio, index) => {
              const grupoInfo = gruposMusculares[exercicio.grupo_muscular] || { 
                label: exercicio.grupo_muscular, 
                icon: "💪", 
                color: "bg-gray-100 text-gray-700" 
              };
              
              return (
                <Card key={index} className="bg-white border-slate-200">
                  <CardContent className="p-3 md:p-4">
                    <div className="space-y-2 md:space-y-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm md:text-base break-words">
                          {index + 1}. {exercicio.nome}
                        </h3>
                        <Badge className={`${grupoInfo.color} mt-1.5 md:mt-2 text-[10px] md:text-xs`}>
                          {grupoInfo.icon} {grupoInfo.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 md:gap-3 p-2 md:p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-1 md:gap-2">
                          <Repeat className="w-3 h-3 md:w-4 md:h-4 text-slate-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] md:text-xs text-slate-500 truncate">Séries</p>
                            <p className="font-semibold text-slate-900 text-xs md:text-sm truncate">
                              {exercicio.series || '-'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                          <Repeat className="w-3 h-3 md:w-4 md:h-4 text-slate-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] md:text-xs text-slate-500 truncate">Reps</p>
                            <p className="font-semibold text-slate-900 text-xs md:text-sm truncate">
                              {exercicio.repeticoes || '-'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                          <Timer className="w-3 h-3 md:w-4 md:h-4 text-slate-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] md:text-xs text-slate-500 truncate">Desc.</p>
                            <p className="font-semibold text-slate-900 text-xs md:text-sm truncate">
                              {exercicio.descanso || '-'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {exercicio.observacoes && (
                        <div className="p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs md:text-sm text-slate-700">
                            <span className="font-semibold">💡 Obs: </span>
                            {exercicio.observacoes}
                          </p>
                        </div>
                      )}

                      {exercicio.video_url && (
                        <div>
                          <a
                            href={exercicio.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 md:gap-2 text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium"
                          >
                            🎥 Vídeo demonstrativo disponível
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
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

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 md:gap-3 pt-3 md:pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose} className="min-h-[44px] text-sm md:text-base">
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
          <Button 
            onClick={onCopiar}
            className="bg-green-600 hover:bg-green-700 min-h-[44px] text-sm md:text-base"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar Este Treino
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}