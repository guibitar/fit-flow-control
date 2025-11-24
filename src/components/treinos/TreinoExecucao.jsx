
import React, { useState, useEffect, useRef } from "react";
import { HistoricoTreino } from "@/api/entities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX, CheckCircle2, Timer, Repeat, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

export default function TreinoExecucao({ treino, open, onClose }) {
  const queryClient = useQueryClient();
  
  // Garantir que o treino tenha cliente_id como número
  const treinoNormalizado = treino ? {
    ...treino,
    cliente_id: treino.cliente_id ? parseInt(treino.cliente_id) : treino.cliente_id,
    id: treino.id ? parseInt(treino.id) : treino.id
  } : null;
  
  const [estado, setEstado] = useState('nao_iniciado');
  const [exercicioAtualIndex, setExercicioAtualIndex] = useState(0);
  const [subExercicioIndex, setSubExercicioIndex] = useState(0);
  const [serieAtual, setSerieAtual] = useState(1);
  const [fase, setFase] = useState('exercicio');
  const [tempoExercicio, setTempoExercicio] = useState(0);
  const [tempoDescanso, setTempoDescanso] = useState(0);
  const [tempoTotal, setTempoTotal] = useState(0);
  const [tempoInicio, setTempoInicio] = useState(null);
  const [somAtivo, setSomAtivo] = useState(true);
  const [exerciciosConcluidos, setExerciciosConcluidos] = useState([]);
  
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [dadosExercicio, setDadosExercicio] = useState({});

  const intervalRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const faseRef = useRef('exercicio');

  useEffect(() => {
    faseRef.current = fase;
  }, [fase]);

  const saveHistoricoMutation = useMutation({
    mutationFn: (data) => HistoricoTreino.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historico-treinos'] });
      queryClient.invalidateQueries({ queryKey: ['progressos-cliente'] });
    },
  });

  const falarBoraDeNovo = () => {
    if (!somAtivo) return;
    
    try {
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance("Bora de novo!");
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      synthRef.current.speak(utterance);
      playSound('fim_descanso');
    } catch (error) {
      console.error("Erro ao sintetizar fala:", error);
      playSound('fim_descanso');
    }
  };

  const playSound = (tipo) => {
    if (!somAtivo) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const configs = {
        inicio: { freq: 440, duration: 0.2 },
        fim_exercicio: { freq: 523, duration: 0.3 },
        inicio_descanso: { freq: 349, duration: 0.2 },
        fim_descanso: { freq: 587, duration: 0.4 },
        pausa: { freq: 294, duration: 0.15 },
        retomada: { freq: 440, duration: 0.15 },
        conclusao: { freq: 659, duration: 0.5 }
      };
      
      const config = configs[tipo] || configs.inicio;
      oscillator.frequency.value = config.freq;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + config.duration);
    } catch (error) {
      console.error("Erro ao reproduzir som:", error);
    }
  };

  const getExercicioAtual = () => {
    const treinoAtual = treinoNormalizado || treino;
    if (!treinoAtual?.exercicios || exercicioAtualIndex >= treinoAtual.exercicios.length) return null;
    
    const item = treinoAtual.exercicios[exercicioAtualIndex];
    
    if (item.tipo_item === 'exercicio') {
      return {
        ...item,
        total_series: item.series || 3
      };
    } else {
      if (subExercicioIndex < item.exercicios_grupo.length) {
        return {
          ...item.exercicios_grupo[subExercicioIndex],
          eh_grupo: true,
          tipo_grupo: item.tipo_item,
          total_series: item.series || 3,
          posicao_grupo: `${subExercicioIndex + 1}/${item.exercicios_grupo.length}`,
          descanso: item.descanso,
          descanso_segundos: item.descanso_segundos,
          total_exercicios_grupo: item.exercicios_grupo.length
        };
      }
    }
    return null;
  };

  const getProximoExercicioNoGrupo = () => {
    const treinoAtual = treinoNormalizado || treino;
    const item = treinoAtual?.exercicios?.[exercicioAtualIndex];
    if (!item || item.tipo_item === 'exercicio') return null;
    
    if (subExercicioIndex + 1 < item.exercicios_grupo.length) {
      return item.exercicios_grupo[subExercicioIndex + 1];
    }
    return null;
  };

  const iniciarTreino = () => {
    setEstado('em_andamento');
    setFase('exercicio');
    setSerieAtual(1);
    setTempoExercicio(0);
    setTempoInicio(new Date());
    playSound('inicio');
  };

  const pausarTreino = () => {
    setEstado('pausado');
    playSound('pausa');
  };

  const retomarTreino = () => {
    setEstado('em_andamento');
    playSound('retomada');
  };

  useEffect(() => {
    if (estado !== 'em_andamento') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTempoTotal(prev => prev + 1);
      
      if (faseRef.current === 'exercicio') {
        setTempoExercicio(prev => prev + 1);
      } else if (faseRef.current === 'descanso') {
        setTempoDescanso(prev => {
          const ex = getExercicioAtual();
          const descansoTotal = ex?.descanso_segundos || 0;
          const novo = prev + 1;
          
          if (novo >= descansoTotal) {
            setTimeout(() => {
              playSound('fim_descanso');
              falarBoraDeNovo();
              proximaSerie();
            }, 0);
            return 0;
          }
          return novo;
        });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [estado, fase, exercicioAtualIndex, subExercicioIndex, serieAtual]);

  const finalizarRepeticao = () => {
    const ex = getExercicioAtual();
    if (!ex) return;

    playSound('fim_exercicio');
    
    if (ex.eh_grupo) {
      const proximoNoGrupo = getProximoExercicioNoGrupo();
      
      if (proximoNoGrupo) {
        setSubExercicioIndex(prev => prev + 1);
        setTempoExercicio(0);
      } else {
        if (serieAtual >= ex.total_series) {
          finalizarExercicioCompleto();
        } else {
          iniciarDescanso();
        }
      }
    } else {
      if (serieAtual >= ex.total_series) {
        finalizarExercicioCompleto();
      } else {
        iniciarDescanso();
      }
    }
  };

  const iniciarDescanso = () => {
    const ex = getExercicioAtual();
    if (!ex || !ex.descanso_segundos || ex.descanso_segundos <= 0) {
      proximaSerie();
      return;
    }

    setFase('descanso');
    setTempoDescanso(0);
    playSound('inicio_descanso');
  };

  const pularDescanso = () => {
    proximaSerie();
  };

  const proximaSerie = () => {
    const ex = getExercicioAtual();
    if (!ex) return;

    setSerieAtual(prev => prev + 1);
    setFase('exercicio');
    setTempoExercicio(0);
    setTempoDescanso(0);
    
    if (ex.eh_grupo) {
      setSubExercicioIndex(0);
    }
  };

  const finalizarExercicioCompleto = () => {
    const ex = getExercicioAtual();
    setExerciciosConcluidos(prev => [...prev, { ...ex, tempo: tempoExercicio }]);
    
    const treinoAtual = treinoNormalizado || treino;
    if (exercicioAtualIndex + 1 < treinoAtual.exercicios.length) {
      setExercicioAtualIndex(prev => prev + 1);
      setSubExercicioIndex(0);
      setSerieAtual(1);
      setFase('exercicio');
      setTempoExercicio(0);
      setTempoDescanso(0);
    } else {
      concluirTreino();
    }
  };

  const pularExercicio = () => {
    finalizarExercicioCompleto();
  };

  const reiniciarTreino = () => {
    setEstado('nao_iniciado');
    setExercicioAtualIndex(0);
    setSubExercicioIndex(0);
    setSerieAtual(1);
    setFase('exercicio');
    setTempoExercicio(0);
    setTempoDescanso(0);
    setTempoTotal(0);
    setTempoInicio(null);
    setExerciciosConcluidos([]);
    setMostrarRegistro(false);
    setDadosExercicio({});
  };

  const concluirTreino = () => {
    setEstado('concluido');
    playSound('conclusao');
    setMostrarRegistro(true);
  };

  const salvarHistorico = async () => {
    const treinoAtual = treinoNormalizado || treino;
    const exerciciosComDados = treinoAtual.exercicios.map((item, index) => {
      const completedExData = exerciciosConcluidos[index];
      
      let exercicioNome;
      let seriesPlanned = 0;
      if (item.tipo_item === 'exercicio') {
        exercicioNome = item.nome;
        seriesPlanned = item.series || 3;
      } else {
        exercicioNome = `${item.tipo_item.toUpperCase()}: ${item.exercicios_grupo.map(ex => ex.nome).join(', ')}`;
        seriesPlanned = item.series || 3;
      }

      const dados = dadosExercicio[index] || {};
      
      return {
        exercicio_id: item.id || null,
        exercicio_nome: exercicioNome,
        tipo_item: item.tipo_item,
        series_realizadas: dados.series || seriesPlanned,
        series_planejadas: seriesPlanned,
        carga_utilizada: dados.carga ? parseFloat(dados.carga) : null,
        repeticoes_realizadas: dados.repeticoes || "",
        tempo_execucao_segundos: completedExData?.tempo || 0,
        percepcao_esforco: dados.percepcao || 3,
        observacoes: dados.observacoes || ""
      };
    });

    const historicoData = {
      treino_id: treinoAtual.id ? parseInt(treinoAtual.id) : null,
      treino_titulo: treinoAtual.titulo || "",
      cliente_id: treinoAtual.cliente_id ? parseInt(treinoAtual.cliente_id) : null,
      cliente_nome: treino.cliente_nome || "",
      data_execucao: tempoInicio?.toISOString() || new Date().toISOString(),
      duracao_total_segundos: tempoTotal,
      status: "completo",
      exercicios_executados: exerciciosComDados,
      percepcao_geral: dadosExercicio.percepcao_geral || 3,
      observacoes_cliente: dadosExercicio.observacoes_cliente || ""
    };

    await saveHistoricoMutation.mutateAsync(historicoData);
    onClose();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const formatarTempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calcularProgresso = () => {
    const treinoAtual = treinoNormalizado || treino;
    if (!treinoAtual?.exercicios) return 0;
    const totalExerciciosContabilizados = treinoAtual.exercicios.length;
    return (exerciciosConcluidos.length / totalExerciciosContabilizados) * 100;
  };

  if (!treino) return null;

  const exercicioAtual = getExercicioAtual();
  const progresso = calcularProgresso();

  const percepcaoLabels = {
    1: "😊 Leve",
    2: "👍 Bom",
    3: "💪 Moderado",
    4: "😰 Difícil",
    5: "☠️ Morri"
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{(treinoNormalizado || treino)?.titulo || 'Executar Treino'}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSomAtivo(!somAtivo)}
            >
              {somAtivo ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-blue-50 to-slate-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Tempo Total</p>
                  <p className="text-3xl font-bold text-slate-900">{formatarTempo(tempoTotal)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Exercícios</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {exerciciosConcluidos.length} / {(treinoNormalizado || treino)?.exercicios?.length || 0}
                  </p>
                </div>
              </div>
              <Progress value={progresso} className="mt-3" />
            </CardContent>
          </Card>

          {estado === 'nao_iniciado' && (
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Pronto para começar?</h3>
                <p className="text-slate-600 mb-6">
                  {(treinoNormalizado || treino)?.exercicios?.length || 0} exercícios • {(treinoNormalizado || treino)?.duracao_estimada || 0} min estimados
                </p>
                <Button
                  onClick={iniciarTreino}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-lg px-8"
                >
                  <Play className="w-6 h-6 mr-2" />
                  Iniciar Treino
                </Button>
              </CardContent>
            </Card>
          )}

          {estado === 'concluido' && !mostrarRegistro && (
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-20 h-20 mx-auto mb-4 text-purple-600" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Treino Concluído! 🎉</h3>
                <p className="text-slate-600 mb-2">Parabéns pelo esforço!</p>
                <div className="grid grid-cols-2 gap-4 mt-6 mb-6">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-slate-600">Tempo Total</p>
                    <p className="text-2xl font-bold text-slate-900">{formatarTempo(tempoTotal)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-slate-600">Exercícios</p>
                    <p className="text-2xl font-bold text-purple-600">{exerciciosConcluidos.length}</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={reiniciarTreino} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Refazer
                  </Button>
                  <Button onClick={() => setMostrarRegistro(true)} className="bg-purple-600 hover:bg-purple-700">
                    Registrar e Finalizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {mostrarRegistro && (
            <Card className="border-2 border-purple-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">📝 Registrar Execução</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Registre os pesos utilizados e sua percepção de esforço
                </p>

                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                  {(treinoNormalizado || treino)?.exercicios?.map((item, index) => (
                    <div key={index} className="border-b pb-4">
                      <h4 className="font-semibold text-slate-900 mb-3">
                        {item.tipo_item === 'exercicio' ? item.nome : `${item.tipo_item.toUpperCase()} (${item.exercicios_grupo?.length} exercícios)`}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Carga (kg)</Label>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="Ex: 20"
                            value={dadosExercicio[index]?.carga || ""}
                            onChange={(e) => setDadosExercicio({
                              ...dadosExercicio,
                              [index]: { ...dadosExercicio[index], carga: e.target.value }
                            })}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Repetições</Label>
                          <Input
                            placeholder="Ex: 12,10,10"
                            value={dadosExercicio[index]?.repeticoes || ""}
                            onChange={(e) => setDadosExercicio({
                              ...dadosExercicio,
                              [index]: { ...dadosExercicio[index], repeticoes: e.target.value }
                            })}
                            className="h-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 mt-3">
                        <Label className="text-xs flex items-center justify-between">
                          <span>Percepção de Esforço</span>
                          <span className="font-semibold">
                            {percepcaoLabels[dadosExercicio[index]?.percepcao || 3]}
                          </span>
                        </Label>
                        <Slider
                          value={[dadosExercicio[index]?.percepcao || 3]}
                          onValueChange={(value) => setDadosExercicio({
                            ...dadosExercicio,
                            [index]: { ...dadosExercicio[index], percepcao: value[0] }
                          })}
                          min={1}
                          max={5}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>😊 Leve</span>
                          <span>👍 Bom</span>
                          <span>💪 Moderado</span>
                          <span>😰 Difícil</span>
                          <span>☠️ Morri</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="space-y-3 pt-4 border-t-2">
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between">
                        <span>Percepção Geral do Treino</span>
                        <span className="font-semibold text-purple-700">
                          {percepcaoLabels[dadosExercicio.percepcao_geral || 3]}
                        </span>
                      </Label>
                      <Slider
                        value={[dadosExercicio.percepcao_geral || 3]}
                        onValueChange={(value) => setDadosExercicio({
                          ...dadosExercicio,
                          percepcao_geral: value[0]
                        })}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>😊</span>
                        <span>👍</span>
                        <span>💪</span>
                        <span>😰</span>
                        <span>☠️</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Observações Gerais</Label>
                      <Textarea
                        placeholder="Como você se sentiu durante o treino?"
                        rows={3}
                        value={dadosExercicio.observacoes_cliente || ""}
                        onChange={(e) => setDadosExercicio({
                          ...dadosExercicio,
                          observacoes_cliente: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setMostrarRegistro(false)}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={salvarHistorico}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={saveHistoricoMutation.isPending}
                  >
                    {saveHistoricoMutation.isPending ? "Salvando..." : "Salvar e Finalizar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {(estado === 'em_andamento' || estado === 'pausado') && exercicioAtual && (
            <>
              <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-300">
                <CardContent className="p-6">
                  {exercicioAtual.eh_grupo && (
                    <div className="mb-3">
                      <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        {exercicioAtual.tipo_grupo.toUpperCase()} - Exercício {exercicioAtual.posicao_grupo}
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{exercicioAtual.nome}</h3>
                  
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <span className="flex items-center gap-1 px-2 py-1 bg-white rounded border text-sm">
                      <Repeat className="w-3 h-3" />
                      Série {serieAtual}/{exercicioAtual.total_series}
                    </span>
                    {exercicioAtual.tipo_execucao === 'repeticao' && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-white rounded border text-sm">
                        <Timer className="w-3 h-3" />
                        {exercicioAtual.repeticoes} repetições
                      </span>
                    )}
                    {exercicioAtual.tipo_execucao === 'tempo' && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-white rounded border text-sm">
                        <Clock className="w-3 h-3" />
                        {exercicioAtual.tempo_execucao}s
                      </span>
                    )}
                    {exercicioAtual.grupo_muscular && (
                      <span className="bg-slate-600 text-white px-2 py-1 rounded text-xs">
                        {exercicioAtual.grupo_muscular}
                      </span>
                    )}
                  </div>

                  {fase === 'exercicio' && (
                    <div className="bg-white p-6 rounded-lg mb-4 border-2 border-blue-400">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-blue-700">⏱️ TEMPO DE EXECUÇÃO</p>
                        <Badge className="bg-blue-600 text-white">Em andamento</Badge>
                      </div>
                      <div className="text-6xl font-bold text-blue-600 mb-2 text-center">
                        {formatarTempo(tempoExercicio)}
                      </div>
                      <p className="text-center text-sm text-slate-600">
                        {exercicioAtual.tipo_execucao === 'repeticao' 
                          ? `Execute ${exercicioAtual.repeticoes} repetições` 
                          : `Execute por ${exercicioAtual.tempo_execucao} segundos`}
                      </p>
                    </div>
                  )}

                  {fase === 'descanso' && (
                    <div className="bg-orange-50 border-2 border-orange-400 p-6 rounded-lg mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-orange-700">😌 TEMPO DE DESCANSO</p>
                        <Badge className="bg-orange-600 text-white">Descansando</Badge>
                      </div>
                      <div className="text-6xl font-bold text-orange-600 mb-2 text-center">
                        {formatarTempo(exercicioAtual.descanso_segundos - tempoDescanso)}
                      </div>
                      <Progress 
                        value={(tempoDescanso / exercicioAtual.descanso_segundos) * 100} 
                        className="h-3 mb-2"
                      />
                      <p className="text-center text-sm text-orange-700 font-semibold">
                        Aguarde... "Bora de novo!" está chegando! 💪
                      </p>
                    </div>
                  )}

                  {exercicioAtual.observacoes && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
                      <p className="text-xs text-yellow-800">
                        <strong>💡 Dica:</strong> {exercicioAtual.observacoes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {estado === 'em_andamento' && (
                      <Button onClick={pausarTreino} variant="outline" className="flex-1">
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar
                      </Button>
                    )}
                    
                    {estado === 'pausado' && (
                      <Button onClick={retomarTreino} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Play className="w-4 h-4 mr-2" />
                        Retomar
                      </Button>
                    )}

                    {fase === 'exercicio' && estado === 'em_andamento' && (
                      <Button 
                        onClick={finalizarRepeticao} 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Finalizar Repetição
                      </Button>
                    )}

                    {fase === 'descanso' && estado === 'em_andamento' && (
                      <Button 
                        onClick={pularDescanso} 
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                      >
                        <SkipForward className="w-4 h-4 mr-2" />
                        Pular Descanso
                      </Button>
                    )}

                    <Button onClick={pularExercicio} variant="outline" size="sm">
                      <SkipForward className="w-4 h-4 mr-2" />
                      Pular Exercício
                    </Button>
                    
                    <Button onClick={reiniciarTreino} variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {exercicioAtual.eh_grupo && getProximoExercicioNoGrupo() && (
                <Card className="bg-purple-50 border border-purple-200">
                  <CardContent className="p-4">
                    <p className="text-xs text-purple-700 mb-1 font-semibold">
                      🔄 Próximo no {exercicioAtual.tipo_grupo}:
                    </p>
                    <p className="font-semibold text-slate-900">{getProximoExercicioNoGrupo().nome}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
