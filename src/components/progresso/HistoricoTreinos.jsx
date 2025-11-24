import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Clock, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HistoricoTreinos({ historicos }) {
  const [expandido, setExpandido] = useState({});

  if (!historicos || historicos.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Nenhum treino executado ainda
          </h3>
          <p className="text-slate-600">
            Os treinos executados aparecerão aqui com detalhes completos
          </p>
        </CardContent>
      </Card>
    );
  }

  const toggleExpandir = (id) => {
    setExpandido(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatarTempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}min ${secs}s`;
  };

  const percepcaoLabels = {
    1: { emoji: "😊", label: "Leve", color: "text-green-600" },
    2: { emoji: "👍", label: "Bom", color: "text-blue-600" },
    3: { emoji: "💪", label: "Moderado", color: "text-yellow-600" },
    4: { emoji: "😰", label: "Difícil", color: "text-orange-600" },
    5: { emoji: "☠️", label: "Morri", color: "text-red-600" }
  };

  return (
    <div className="space-y-4">
      {historicos.map((historico) => {
        const isExpandido = expandido[historico.id];
        const percepcaoGeral = percepcaoLabels[historico.percepcao_geral] || percepcaoLabels[3];

        return (
          <Card key={historico.id} className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader 
              className="cursor-pointer hover:bg-slate-50"
              onClick={() => toggleExpandir(historico.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">{historico.treino_titulo}</CardTitle>
                    <Badge className={`${
                      historico.status === 'completo' 
                        ? 'bg-green-600' 
                        : 'bg-orange-600'
                    } text-white`}>
                      {historico.status === 'completo' ? '✓ Completo' : '⏸️ Incompleto'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    {format(parseISO(historico.data_execucao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  {isExpandido ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-blue-700 font-semibold">Duração</p>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {formatarTempo(historico.duracao_total_segundos)}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="w-4 h-4 text-purple-600" />
                    <p className="text-xs text-purple-700 font-semibold">Exercícios</p>
                  </div>
                  <p className="text-lg font-bold text-purple-900">
                    {historico.exercicios_executados?.length || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-slate-600" />
                    <p className="text-xs text-slate-700 font-semibold">Percepção</p>
                  </div>
                  <p className={`text-lg font-bold ${percepcaoGeral.color}`}>
                    {percepcaoGeral.emoji} {percepcaoGeral.label}
                  </p>
                </div>
              </div>
            </CardHeader>

            {isExpandido && (
              <CardContent className="border-t pt-4">
                <h4 className="font-semibold text-slate-900 mb-3">Detalhes dos Exercícios</h4>
                <div className="space-y-3">
                  {historico.exercicios_executados?.map((ex, index) => {
                    const percepcao = percepcaoLabels[ex.percepcao_esforco] || percepcaoLabels[3];
                    
                    return (
                      <div key={index} className="bg-slate-50 rounded-lg p-4 border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-semibold text-slate-900">{ex.exercicio_nome}</h5>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {ex.carga_utilizada && (
                                <Badge variant="outline" className="bg-white">
                                  🏋️ {ex.carga_utilizada}kg
                                </Badge>
                              )}
                              {ex.repeticoes_realizadas && (
                                <Badge variant="outline" className="bg-white">
                                  🔄 {ex.repeticoes_realizadas}
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-white">
                                📊 {ex.series_realizadas}/{ex.series_planejadas} séries
                              </Badge>
                              {ex.tempo_execucao_segundos > 0 && (
                                <Badge variant="outline" className="bg-white">
                                  ⏱️ {formatarTempo(ex.tempo_execucao_segundos)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-xs text-slate-500 mb-1">Percepção</p>
                            <p className={`text-2xl font-bold ${percepcao.color}`}>
                              {percepcao.emoji}
                            </p>
                            <p className={`text-xs font-semibold ${percepcao.color}`}>
                              {percepcao.label}
                            </p>
                          </div>
                        </div>
                        {ex.observacoes && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs text-blue-800">
                              💬 {ex.observacoes}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {historico.observacoes_cliente && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs font-semibold text-purple-900 mb-1">💭 Observações do Cliente</p>
                    <p className="text-sm text-purple-800">{historico.observacoes_cliente}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}