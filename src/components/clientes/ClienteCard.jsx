
import React, { useState } from "react";
import { Treino, Aula } from "@/api/entities";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Edit, TrendingUp, Dumbbell, CalendarDays, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import TreinoVisualizacao from "@/components/treinos/TreinoVisualizacao";
import ListaTreinosCliente from "@/components/clientes/ListaTreinosCliente";
import ListaAulasCliente from "@/components/clientes/ListaAulasCliente";

export default function ClienteCard({ cliente, onEdit }) {
  const [expandido, setExpandido] = useState(false);
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [showTreino, setShowTreino] = useState(false);
  const [showListaTreinos, setShowListaTreinos] = useState(false);
  const [showListaAulas, setShowListaAulas] = useState(false);

  const { data: treinos = [] } = useQuery({
    queryKey: ['treinos-cliente', cliente.id],
    queryFn: () => Treino.filter({ cliente_id: parseInt(cliente.id) }),
    initialData: [],
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  const { data: todasAulas = [] } = useQuery({
    queryKey: ['aulas'],
    queryFn: () => Aula.list('-data'),
    initialData: [],
  });

  // Filtrar aulas deste cliente especificamente
  const aulas = todasAulas.filter(aula => 
    aula.alunos?.some(aluno => aluno.cliente_id === cliente.id)
  );

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const idade = calcularIdade(cliente.data_nascimento);

  // Corrigir o cálculo de aulas próximas - usar data local
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const aulasProximas = aulas.filter(a => {
    const [ano, mes, dia] = a.data.split('-').map(Number);
    const dataAula = new Date(ano, mes - 1, dia); // Mês é 0-indexado
    dataAula.setHours(0, 0, 0, 0);
    return dataAula >= hoje && a.status !== 'cancelada';
  });

  const handleVerTreino = (treino) => {
    setTreinoSelecionado(treino);
    setShowTreino(true);
  };

  return (
    <>
      <Card className="hover:shadow-xl transition-all duration-300 bg-white border-2 border-transparent hover:border-blue-200">
        <CardHeader className="border-b border-slate-200 pb-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white font-bold text-xl">
                  {cliente.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 text-lg truncate">{cliente.nome}</h3>
                <span className={`inline-block text-xs px-2.5 py-1 rounded-full mt-1 font-medium ${
                  cliente.status === 'ativo' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {cliente.status === 'ativo' ? '✅ Ativo' : '⏸️ Inativo'}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpandido(!expandido)}
                className="hover:bg-slate-100 flex-shrink-0 w-10 h-10"
                title={expandido ? "Ocultar detalhes" : "Ver detalhes"}
              >
                {expandido ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(cliente)}
                className="hover:bg-blue-50 hover:text-blue-700 flex-shrink-0 w-10 h-10"
              >
                <Edit className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4 p-5 space-y-3">
          {/* Informações Básicas */}
          <div className="space-y-2">
            {cliente.email && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{cliente.email}</span>
              </div>
            )}
            {cliente.telefone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{cliente.telefone}</span>
              </div>
            )}
            {idade && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{idade} anos</span>
              </div>
            )}
            {cliente.objetivo && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <TrendingUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{cliente.objetivo}</span>
              </div>
            )}
          </div>

          {/* Resumo de Treinos e Aulas - CLICÁVEIS */}
          <div className="flex gap-2 pt-3 border-t">
            <Badge 
              variant="outline" 
              className="flex items-center gap-1.5 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all py-1.5 px-3 text-sm font-medium"
              onClick={() => setShowListaTreinos(true)}
            >
              <Dumbbell className="w-4 h-4" />
              <span>{treinos.length} treino{treinos.length !== 1 ? 's' : ''}</span>
            </Badge>
            <Badge 
              variant="outline" 
              className="flex items-center gap-1.5 cursor-pointer hover:bg-green-50 hover:border-green-400 transition-all py-1.5 px-3 text-sm font-medium"
              onClick={() => setShowListaAulas(true)}
            >
              <CalendarDays className="w-4 h-4" />
              <span>{aulasProximas.length} aula{aulasProximas.length !== 1 ? 's' : ''} próxima{aulasProximas.length !== 1 ? 's' : ''}</span>
            </Badge>
          </div>

          {/* Detalhes Expandidos */}
          {expandido && (
            <div className="pt-4 mt-4 border-t space-y-4">
              {/* Peso e Altura */}
              {(cliente.peso_atual || cliente.altura) && (
                <div className="grid grid-cols-2 gap-3">
                  {cliente.peso_atual && (
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs text-slate-500 font-medium">Peso</p>
                      <p className="font-bold text-slate-900 text-lg">{cliente.peso_atual} kg</p>
                    </div>
                  )}
                  {cliente.altura && (
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs text-slate-500 font-medium">Altura</p>
                      <p className="font-bold text-slate-900 text-lg">{cliente.altura} m</p>
                    </div>
                  )}
                </div>
              )}

              {/* Treinos */}
              {treinos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-blue-600" />
                      <h4 className="font-semibold text-sm text-slate-900">Treinos Recentes</h4>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowListaTreinos(true)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
                    >
                      Ver todos
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {treinos.slice(0, 3).map((treino) => (
                      <div key={treino.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">{treino.titulo}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="text-[10px] bg-blue-600 text-white">
                              {treino.tipo}
                            </Badge>
                            {treino.exercicios?.length > 0 && (
                              <span className="text-[10px] text-slate-600">
                                {treino.exercicios.length} exercícios
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVerTreino(treino)}
                          className="hover:bg-blue-200 ml-2"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Próximas Aulas */}
              {aulasProximas.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-sm text-slate-900">Próximas Aulas</h4>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowListaAulas(true)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs"
                    >
                      Ver todas
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {aulasProximas.slice(0, 3).map((aula) => {
                      const alunoNaAula = aula.alunos?.find(a => a.cliente_id === cliente.id);
                      return (
                        <div key={aula.id} className="p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-slate-900">
                                {format(new Date(aula.data), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-600">{aula.horario}</span>
                                {aula.local && (
                                  <span className="text-xs text-slate-600">• {aula.local}</span>
                                )}
                              </div>
                              {alunoNaAula?.treino_titulo && (
                                <p className="text-[10px] text-slate-600 mt-1">
                                  📋 {alunoNaAula.treino_titulo}
                                </p>
                              )}
                            </div>
                            <Badge className="bg-green-600 text-white text-[10px]">
                              {aula.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {treinos.length === 0 && aulasProximas.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-200">
                  <p>Nenhum treino ou aula agendada</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <TreinoVisualizacao
        treino={treinoSelecionado}
        open={showTreino}
        onClose={() => {
          setShowTreino(false);
          setTreinoSelecionado(null);
        }}
      />

      <ListaTreinosCliente
        clienteId={cliente.id}
        clienteNome={cliente.nome}
        open={showListaTreinos}
        onClose={() => setShowListaTreinos(false)}
      />

      <ListaAulasCliente
        clienteId={cliente.id}
        clienteNome={cliente.nome}
        open={showListaAulas}
        onClose={() => setShowListaAulas(false)}
      />
    </>
  );
}
