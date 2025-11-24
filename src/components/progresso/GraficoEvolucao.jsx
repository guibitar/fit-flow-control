import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GraficoEvolucao({ progressos, avaliacoes }) {
  const [metricaSelecionada, setMetricaSelecionada] = useState('peso');

  // Combinar progressos e avaliações
  const todosDados = [
    ...(progressos || []).map(p => ({
      data: p.data_registro,
      peso: p.peso,
      percentual_gordura: p.percentual_gordura,
      massa_magra: p.massa_magra,
      tipo: 'progresso'
    })),
    ...(avaliacoes || []).map(a => ({
      data: a.data_avaliacao,
      peso: a.peso,
      percentual_gordura: a.percentual_gordura,
      massa_magra: a.composicao_corporal?.massa_magra,
      tipo: 'avaliacao'
    }))
  ].sort((a, b) => {
    const dateA = a.data ? new Date(a.data) : new Date(0);
    const dateB = b.data ? new Date(b.data) : new Date(0);
    return dateA - dateB;
  });

  // Dados para gráfico de peso
  const dadosPeso = todosDados
    .filter(d => d.peso)
    .map(d => {
      try {
        const date = typeof d.data === 'string' ? parseISO(d.data) : new Date(d.data);
        return {
          data: format(date, 'dd/MM', { locale: ptBR }),
          peso: d.peso,
          tipo: d.tipo
        };
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);

  // Dados para gráfico de gordura
  const dadosGordura = todosDados
    .filter(d => d.percentual_gordura)
    .map(d => {
      try {
        const date = typeof d.data === 'string' ? parseISO(d.data) : new Date(d.data);
        return {
          data: format(date, 'dd/MM', { locale: ptBR }),
          gordura: d.percentual_gordura,
          tipo: d.tipo
        };
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);

  // Dados para gráfico de massa magra
  const dadosMassaMagra = todosDados
    .filter(d => d.massa_magra)
    .map(d => {
      try {
        const date = typeof d.data === 'string' ? parseISO(d.data) : new Date(d.data);
        return {
          data: format(date, 'dd/MM', { locale: ptBR }),
          massa_magra: d.massa_magra,
          tipo: d.tipo
        };
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);

  // Dados para medidas corporais (do último progresso)
  const ultimoProgresso = (progressos || []).find(p => p.medidas_corporais && Object.keys(p.medidas_corporais).length > 0);
  const dadosMedidas = ultimoProgresso?.medidas_corporais ? [
    { parte: 'Pescoço', valor: ultimoProgresso.medidas_corporais.pescoco || 0 },
    { parte: 'Ombros', valor: ultimoProgresso.medidas_corporais.ombros || 0 },
    { parte: 'Peito', valor: ultimoProgresso.medidas_corporais.peito || 0 },
    { parte: 'Cintura', valor: ultimoProgresso.medidas_corporais.cintura || 0 },
    { parte: 'Quadril', valor: ultimoProgresso.medidas_corporais.quadril || 0 },
    { parte: 'Braço D', valor: ultimoProgresso.medidas_corporais.braco_direito || 0 },
    { parte: 'Coxa D', valor: ultimoProgresso.medidas_corporais.coxa_direita || 0 },
    { parte: 'Panturrilha D', valor: ultimoProgresso.medidas_corporais.panturrilha_direita || 0 },
  ].filter(m => m.valor > 0) : [];

  // Dados de desempenho de exercícios
  const exerciciosComCarga = [];
  (progressos || []).forEach(p => {
    if (p.desempenho_exercicios && p.desempenho_exercicios.length > 0) {
      p.desempenho_exercicios.forEach(ex => {
        if (ex.carga && ex.exercicio_nome) {
          const index = exerciciosComCarga.findIndex(e => e.exercicio === ex.exercicio_nome);
          if (index === -1) {
            exerciciosComCarga.push({
              exercicio: ex.exercicio_nome,
              dados: [{
                data: format(parseISO(p.data_registro), 'dd/MM', { locale: ptBR }),
                carga: ex.carga,
                repeticoes: ex.repeticoes
              }]
            });
          } else {
            exerciciosComCarga[index].dados.push({
              data: format(parseISO(p.data_registro), 'dd/MM', { locale: ptBR }),
              carga: ex.carga,
              repeticoes: ex.repeticoes
            });
          }
        }
      });
    }
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value} {entry.dataKey === 'peso' || entry.dataKey === 'massa_magra' ? 'kg' : entry.dataKey === 'gordura' ? '%' : 'cm'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Métrica Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Evolução de Métricas</CardTitle>
            <Select value={metricaSelecionada} onValueChange={setMetricaSelecionada}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dadosPeso.length > 0 && <SelectItem value="peso">Peso</SelectItem>}
                {dadosGordura.length > 0 && <SelectItem value="gordura">% Gordura</SelectItem>}
                {dadosMassaMagra.length > 0 && <SelectItem value="massa_magra">Massa Magra</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {metricaSelecionada === 'peso' && dadosPeso.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosPeso}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="data" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="peso" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  name="Peso (kg)"
                  dot={{ fill: '#8b5cf6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {metricaSelecionada === 'gordura' && dadosGordura.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosGordura}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="data" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="gordura" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  name="% Gordura"
                  dot={{ fill: '#f97316', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {metricaSelecionada === 'massa_magra' && dadosMassaMagra.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosMassaMagra}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="data" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="massa_magra" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Massa Magra (kg)"
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {dadosPeso.length === 0 && dadosGordura.length === 0 && dadosMassaMagra.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>Nenhum dado disponível para exibir gráficos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Medidas Corporais */}
      {dadosMedidas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Medidas Corporais (cm)</CardTitle>
            <p className="text-sm text-slate-600">Última medição registrada</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosMedidas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="parte" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="valor" fill="#3b82f6" name="Medida (cm)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Evolução de Carga por Exercício */}
      {exerciciosComCarga.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Carga nos Exercícios</CardTitle>
            <p className="text-sm text-slate-600">Acompanhe o progresso de força</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {exerciciosComCarga.slice(0, 3).map((exercicio, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-slate-900 mb-3">{exercicio.exercicio}</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={exercicio.dados}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="data" stroke="#64748b" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="carga" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        name="Carga (kg)"
                        dot={{ fill: '#ef4444', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}