import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, TrendingUp, TrendingDown, Activity, Heart } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TimelineProgresso({ progressos, avaliacoes, onEditar, onExcluir }) {
  const timeline = [
    ...(progressos || []).map(p => ({ ...p, tipo: 'progresso', data: p.data_registro })),
    ...(avaliacoes || []).map(a => ({ ...a, tipo: 'avaliacao', data: a.data_avaliacao }))
  ].sort((a, b) => {
    const dateA = a.data ? new Date(a.data) : new Date(0);
    const dateB = b.data ? new Date(b.data) : new Date(0);
    return dateB - dateA;
  });

  if (timeline.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Activity className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Nenhum registro ainda
          </h3>
          <p className="text-slate-600">
            Adicione o primeiro registro de progresso
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

        {timeline.map((item, index) => {
          const isProgresso = item.tipo === 'progresso';
          const proximoItem = timeline[index + 1];
          
          let variacaoPeso = null;
          if (proximoItem && item.peso && proximoItem.peso) {
            variacaoPeso = item.peso - proximoItem.peso;
          }

          let variacaoGordura = null;
          if (proximoItem && item.percentual_gordura && proximoItem.percentual_gordura) {
            variacaoGordura = item.percentual_gordura - proximoItem.percentual_gordura;
          }

          return (
            <div key={index} className="relative pl-16 pb-8">
              <div className={`absolute left-3 w-6 h-6 rounded-full border-4 border-white shadow-lg ${
                isProgresso ? 'bg-purple-500' : 'bg-blue-500'
              }`} />

              <Card className={`border-2 ${
                isProgresso ? 'border-purple-200 bg-purple-50/30' : 'border-blue-200 bg-blue-50/30'
              }`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={isProgresso ? 'bg-purple-600' : 'bg-blue-600'}>
                          {isProgresso ? '📊 Registro de Progresso' : '📋 Avaliação Física'}
                        </Badge>
                        <span className="text-sm text-slate-600">
                          {(() => {
                            try {
                              const date = typeof item.data === 'string' ? parseISO(item.data) : new Date(item.data);
                              return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
                            } catch (e) {
                              return item.data || 'Data inválida';
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                    
                    {isProgresso && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditar(item)}
                          className="hover:bg-purple-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onExcluir(item)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {item.peso && (
                      <div className="bg-white rounded-lg p-3 border">
                        <p className="text-xs text-slate-500 mb-1">Peso</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-xl font-bold text-slate-900">{item.peso}</p>
                          <span className="text-xs text-slate-600">kg</span>
                        </div>
                        {variacaoPeso !== null && (
                          <div className={`flex items-center gap-1 mt-1 ${
                            variacaoPeso < 0 ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {variacaoPeso < 0 ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : (
                              <TrendingUp className="w-3 h-3" />
                            )}
                            <span className="text-xs font-semibold">
                              {variacaoPeso > 0 ? '+' : ''}{variacaoPeso.toFixed(1)} kg
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {item.percentual_gordura && (
                      <div className="bg-white rounded-lg p-3 border">
                        <p className="text-xs text-slate-500 mb-1">% Gordura</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-xl font-bold text-slate-900">{item.percentual_gordura}</p>
                          <span className="text-xs text-slate-600">%</span>
                        </div>
                        {variacaoGordura !== null && (
                          <div className={`flex items-center gap-1 mt-1 ${
                            variacaoGordura < 0 ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {variacaoGordura < 0 ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : (
                              <TrendingUp className="w-3 h-3" />
                            )}
                            <span className="text-xs font-semibold">
                              {variacaoGordura > 0 ? '+' : ''}{variacaoGordura.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {item.massa_magra && (
                      <div className="bg-white rounded-lg p-3 border">
                        <p className="text-xs text-slate-500 mb-1">Massa Magra</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-xl font-bold text-slate-900">{item.massa_magra}</p>
                          <span className="text-xs text-slate-600">kg</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isProgresso && item.feedback_subjetivo && (
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="text-xs font-semibold text-slate-700 mb-2">Feedback Subjetivo</p>
                      <div className="flex gap-4 text-xs">
                        {item.feedback_subjetivo.nivel_energia && (
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-500" />
                            <span>Energia: {item.feedback_subjetivo.nivel_energia}/5</span>
                          </div>
                        )}
                        {item.feedback_subjetivo.qualidade_sono && (
                          <div className="flex items-center gap-1">
                            <span>😴 Sono: {item.feedback_subjetivo.qualidade_sono}/5</span>
                          </div>
                        )}
                        {item.feedback_subjetivo.motivacao && (
                          <div className="flex items-center gap-1">
                            <span>🎯 Motivação: {item.feedback_subjetivo.motivacao}/5</span>
                          </div>
                        )}
                      </div>
                      {item.feedback_subjetivo.comentarios_gerais && (
                        <p className="text-xs text-slate-600 mt-2 italic">
                          "{item.feedback_subjetivo.comentarios_gerais}"
                        </p>
                      )}
                    </div>
                  )}

                  {isProgresso && item.desempenho_exercicios && item.desempenho_exercicios.length > 0 && (
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="text-xs font-semibold text-slate-700 mb-2">
                        Desempenho em Exercícios ({item.desempenho_exercicios.length})
                      </p>
                      <div className="space-y-1">
                        {item.desempenho_exercicios.slice(0, 3).map((ex, exIndex) => (
                          <div key={exIndex} className="flex items-center justify-between text-xs">
                            <span className="font-medium">{ex.exercicio_nome}</span>
                            <span className="text-slate-600">
                              {ex.carga}kg • {ex.repeticoes} reps • {ex.series} séries
                            </span>
                          </div>
                        ))}
                        {item.desempenho_exercicios.length > 3 && (
                          <p className="text-xs text-slate-500 mt-1">
                            + {item.desempenho_exercicios.length - 3} exercícios
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {item.observacoes_personal && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs font-semibold text-blue-900 mb-1">💬 Observações do Personal</p>
                      <p className="text-xs text-blue-800">{item.observacoes_personal}</p>
                    </div>
                  )}

                  {item.observacoes && !isProgresso && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs font-semibold text-blue-900 mb-1">💬 Observações</p>
                      <p className="text-xs text-blue-800">{item.observacoes}</p>
                    </div>
                  )}

                  {item.metas_proxima_avaliacao && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-xs font-semibold text-green-900 mb-1">🎯 Metas para Próxima Avaliação</p>
                      <p className="text-xs text-green-800">{item.metas_proxima_avaliacao}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}