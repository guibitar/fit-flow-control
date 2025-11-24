import React, { useState } from "react";
import { Aula } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

import AgendarAulaForm from "@/components/calendario/AgendarAulaForm.jsx";
import DetalhesAula from "@/components/calendario/DetalhesAula.jsx";

export default function Calendario() {
  const queryClient = useQueryClient();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(new Date());
  const [showFormAgendar, setShowFormAgendar] = useState(false);
  const [aulaEditando, setAulaEditando] = useState(null);
  const [dataSelecionadaForm, setDataSelecionadaForm] = useState(null);

  const { data: aulas = [] } = useQuery({
    queryKey: ['aulas'],
    queryFn: () => Aula.list('-data'),
    initialData: [],
    enabled: !authLoading && isAuthenticated,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const createAulaMutation = useMutation({
    mutationFn: (data) => Aula.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aulas'] });
      queryClient.refetchQueries({ queryKey: ['aulas'] });
      setShowFormAgendar(false);
      setAulaEditando(null);
      setDataSelecionadaForm(null); // Reset form date on success
    },
  });

  const updateAulaMutation = useMutation({
    mutationFn: ({ id, data }) => Aula.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aulas'] });
      queryClient.refetchQueries({ queryKey: ['aulas'] });
      setShowFormAgendar(false);
      setAulaEditando(null);
      setDataSelecionadaForm(null); // Reset form date on success
    },
  });

  const deleteAulaMutation = useMutation({
    mutationFn: (id) => Aula.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aulas'] });
      queryClient.refetchQueries({ queryKey: ['aulas'] });
      setDiaSelecionado(null);
    },
  });

  const proximoMes = () => setMesAtual(addMonths(mesAtual, 1));
  const mesAnterior = () => setMesAtual(subMonths(mesAtual, 1));

  const inicioMes = startOfMonth(mesAtual);
  const fimMes = endOfMonth(mesAtual);
  const inicioDaSemana = startOfWeek(inicioMes, { weekStartsOn: 0 });
  const fimDaSemana = endOfWeek(fimMes, { weekStartsOn: 0 });
  
  const diasDoCalendario = eachDayOfInterval({ start: inicioDaSemana, end: fimDaSemana });

  const getAulasNoDia = (dia) => {
    return aulas.filter(aula => {
      // Criar data local para comparação correta
      const [ano, mes, diaAula] = aula.data.split('-').map(Number);
      const dataAula = new Date(ano, mes - 1, diaAula);
      return isSameDay(dataAula, dia);
    });
  };

  const handleDiaClick = (dia) => {
    setDiaSelecionado(dia);
  };

  const handleAgendarAula = (data) => {
    if (aulaEditando) {
      updateAulaMutation.mutate({ id: aulaEditando.id, data });
    } else {
      createAulaMutation.mutate(data);
    }
  };

  const handleEditarAula = (aula) => {
    setAulaEditando(aula);
    setDataSelecionadaForm(aula.data);
    setShowFormAgendar(true);
  };

  const handleCancelarAula = (aulaId) => {
    if (confirm("Deseja realmente cancelar esta aula?")) {
      const aula = aulas.find(a => a.id === aulaId);
      updateAulaMutation.mutate({ 
        id: aulaId, 
        data: { ...aula, status: 'cancelada' }
      });
    }
  };

  const handleNovaAula = () => {
    setAulaEditando(null);
    setDataSelecionadaForm(diaSelecionado ? format(diaSelecionado, 'yyyy-MM-dd') : null);
    setShowFormAgendar(true);
  };

  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Calendário de Aulas</h1>
            <p className="text-slate-600">Gerencie seus agendamentos</p>
          </div>
          <Button
            onClick={handleNovaAula}
            className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agendar Aula
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardContent className="p-4 md:p-6">
                {/* Header do Calendário */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={mesAnterior}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-xl font-bold text-slate-900 capitalize">
                    {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
                  </h2>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={proximoMes}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Dias da Semana */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {diasDaSemana.map((dia) => (
                    <div key={dia} className="text-center font-semibold text-slate-600 text-sm py-2">
                      {dia}
                    </div>
                  ))}
                </div>

                {/* Dias do Mês */}
                <div className="grid grid-cols-7 gap-2">
                  {diasDoCalendario.map((dia, index) => {
                    const aulasNoDia = getAulasNoDia(dia);
                    const temAulas = aulasNoDia.length > 0;
                    const aulasCanceladas = aulasNoDia.filter(a => a.status === 'cancelada').length;
                    const aulasRealizadas = aulasNoDia.filter(a => a.status === 'realizada').length;
                    const aulasAgendadas = aulasNoDia.filter(a => a.status === 'agendada').length;
                    const mesAtualFlag = isSameMonth(dia, mesAtual);
                    const diaSelecionadoFlag = diaSelecionado && isSameDay(dia, diaSelecionado);

                    return (
                      <button
                        key={index}
                        onClick={() => handleDiaClick(dia)}
                        className={`
                          aspect-square p-2 rounded-lg text-sm font-medium transition-all
                          ${!mesAtualFlag && 'text-slate-300'}
                          ${mesAtualFlag && !temAulas && 'hover:bg-slate-100'}
                          ${diaSelecionadoFlag && 'ring-2 ring-blue-500'}
                          ${temAulas && mesAtualFlag && 'font-bold'}
                          ${aulasAgendadas > 0 && mesAtualFlag && 'bg-blue-100 text-blue-700 hover:bg-blue-200'}
                          ${aulasRealizadas > 0 && mesAtualFlag && 'bg-green-100 text-green-700 hover:bg-green-200'}
                          ${aulasCanceladas > 0 && aulasAgendadas === 0 && aulasRealizadas === 0 && mesAtualFlag && 'bg-red-100 text-red-700 hover:bg-red-200'}
                        `}
                      >
                        <div className="flex flex-col items-center">
                          <span>{format(dia, 'd')}</span>
                          {temAulas && (
                            <div className="flex gap-0.5 mt-1">
                              {Array.from({ length: Math.min(aulasNoDia.length, 3) }).map((_, i) => (
                                <div key={i} className="w-1 h-1 rounded-full bg-current" />
                              ))}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legenda */}
                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 rounded" />
                    <span>Agendada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 rounded" />
                    <span>Realizada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 rounded" />
                    <span>Cancelada</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes do Dia */}
          <div className="lg:col-span-1">
            {diaSelecionado ? (
              <DetalhesAula
                dia={diaSelecionado}
                aulas={getAulasNoDia(diaSelecionado)}
                onEditar={handleEditarAula}
                onCancelar={handleCancelarAula}
                onFechar={() => setDiaSelecionado(null)}
              />
            ) : (
              <Card className="shadow-lg">
                <CardContent className="p-6 text-center text-slate-500">
                  <p>Selecione um dia no calendário para ver as aulas agendadas</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal Agendar Aula */}
      {showFormAgendar && (
        <AgendarAulaForm
          aula={aulaEditando}
          open={showFormAgendar}
          dataSelecionada={dataSelecionadaForm}
          onClose={() => {
            setShowFormAgendar(false);
            setAulaEditando(null);
            setDataSelecionadaForm(null);
          }}
          onSubmit={handleAgendarAula}
        />
      )}
    </div>
  );
}