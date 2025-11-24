import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from "lucide-react";

export default function ComparacaoMetas({ cliente, progressos, avaliacoes }) {
  const primeiraAvaliacao = avaliacoes[avaliacoes.length - 1];
  const primeiroProgresso = progressos[progressos.length - 1];
  const baseline = primeiraAvaliacao || primeiroProgresso;

  const ultimoProgresso = progressos[0];
  const ultimaAvaliacao = avaliacoes[0];
  const atual = ultimoProgresso || ultimaAvaliacao;

  if (!baseline || !atual) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Target className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Dados Insuficientes
          </h3>
          <p className="text-slate-600">
            São necessários pelo menos 2 registros para comparação de metas
          </p>
        </CardContent>
      </Card>
    );
  }

  const pesoInicial = baseline.peso;
  const pesoAtual = atual.peso;
  const variacaoPeso = pesoInicial && pesoAtual ? pesoAtual - pesoInicial : null;
  const percentualPeso = pesoInicial && variacaoPeso ? (variacaoPeso / pesoInicial) * 100 : null;

  const gorduraInicial = baseline.percentual_gordura;
  const gorduraAtual = atual.percentual_gordura;
  const variacaoGordura = gorduraInicial && gorduraAtual ? gorduraAtual - gorduraInicial : null;

  const massaMagraInicial = baseline.massa_magra || (baseline.composicao_corporal?.massa_magra);
  const massaMagraAtual = atual.massa_magra || (atual.composicao_corporal?.massa_magra);
  const variacaoMassaMagra = massaMagraInicial && massaMagraAtual ? massaMagraAtual - massaMagraInicial : null;

  const metaPesoPercentual = -5;
  const metaGorduraReducao = -3;
  const metaMassaMagraGanho = 2;

  const MetricaCard = ({ titulo, valorInicial, valorAtual, variacao, meta, unidade, tipo }) => {
    const progressoMeta = meta !== 0 ? Math.min(Math.abs((variacao || 0) / meta) * 100, 100) : 0;
    const metaAlcancada = tipo === 'reducao' 
      ? variacao <= meta 
      : variacao >= meta;
    const emProgresso = tipo === 'reducao'
      ? variacao < 0 && variacao > meta
      : variacao > 0 && variacao < meta;

    return (
      <Card className={`border-2 ${
        metaAlcancada ? 'border-green-300 bg-green-50/30' : 
        emProgresso ? 'border-blue-300 bg-blue-50/30' : 
        'border-slate-200'
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>{titulo}</span>
            {metaAlcancada ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : emProgresso ? (
              <TrendingUp className="w-5 h-5 text-blue-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Inicial</p>
              <p className="text-lg font-bold text-slate-900">
                {valorInicial} <span className="text-xs font-normal text-slate-600">{unidade}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Atual</p>
              <p className="text-lg font-bold text-slate-900">
                {valorAtual} <span className="text-xs font-normal text-slate-600">{unidade}</span>
              </p>
            </div>
          </div>

          {variacao !== null && (
            <div className={`flex items-center gap-2 p-2 rounded-lg ${
              (tipo === 'reducao' && variacao < 0) || (tipo === 'ganho' && variacao > 0)
                ? 'bg-green-100 text-green-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {(tipo === 'reducao' && variacao < 0) || (tipo === 'ganho' && variacao > 0) ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              <span className="text-sm font-semibold">
                {variacao > 0 ? '+' : ''}{variacao.toFixed(1)} {unidade}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Progresso da meta</span>
              <span className="font-semibold">
                {progressoMeta.toFixed(0)}%
              </span>
            </div>
            <Progress value={progressoMeta} className="h-2" />
            <p className="text-xs text-slate-500">
              Meta: {tipo === 'reducao' ? '' : '+'}{meta} {unidade}
            </p>
          </div>

          {metaAlcancada && (
            <Badge className="bg-green-600 text-white w-full justify-center">
              ✓ Meta Alcançada!
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            Comparação com Metas
          </CardTitle>
          <p className="text-sm text-slate-600">
            Objetivo do cliente: {cliente.objetivo || 'Não definido'}
          </p>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {pesoInicial && pesoAtual && (
          <MetricaCard
            titulo="Peso Corporal"
            valorInicial={pesoInicial}
            valorAtual={pesoAtual}
            variacao={variacaoPeso}
            meta={pesoInicial * (metaPesoPercentual / 100)}
            unidade="kg"
            tipo="reducao"
          />
        )}

        {gorduraInicial && gorduraAtual && (
          <MetricaCard
            titulo="Percentual de Gordura"
            valorInicial={gorduraInicial}
            valorAtual={gorduraAtual}
            variacao={variacaoGordura}
            meta={metaGorduraReducao}
            unidade="%"
            tipo="reducao"
          />
        )}

        {massaMagraInicial && massaMagraAtual && (
          <MetricaCard
            titulo="Massa Magra"
            valorInicial={massaMagraInicial}
            valorAtual={massaMagraAtual}
            variacao={variacaoMassaMagra}
            meta={metaMassaMagraGanho}
            unidade="kg"
            tipo="ganho"
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Análise Geral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {variacaoPeso !== null && (
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                variacaoPeso < 0 ? 'bg-green-500' : 'bg-orange-500'
              }`} />
              <div>
                <p className="font-semibold text-sm text-slate-900">Evolução de Peso</p>
                <p className="text-xs text-slate-600">
                  {variacaoPeso < 0 
                    ? `Excelente! Cliente perdeu ${Math.abs(variacaoPeso).toFixed(1)}kg desde o início.`
                    : `Cliente ganhou ${variacaoPeso.toFixed(1)}kg. Avaliar se está alinhado com objetivos.`
                  }
                </p>
              </div>
            </div>
          )}

          {variacaoGordura !== null && (
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                variacaoGordura < 0 ? 'bg-green-500' : 'bg-orange-500'
              }`} />
              <div>
                <p className="font-semibold text-sm text-slate-900">Composição Corporal</p>
                <p className="text-xs text-slate-600">
                  {variacaoGordura < 0 
                    ? `Ótimo progresso! Reduziu ${Math.abs(variacaoGordura).toFixed(1)}% de gordura corporal.`
                    : `Percentual de gordura aumentou ${variacaoGordura.toFixed(1)}%. Revisar dieta e treino.`
                  }
                </p>
              </div>
            </div>
          )}

          {variacaoMassaMagra !== null && (
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                variacaoMassaMagra > 0 ? 'bg-green-500' : 'bg-orange-500'
              }`} />
              <div>
                <p className="font-semibold text-sm text-slate-900">Ganho de Massa Muscular</p>
                <p className="text-xs text-slate-600">
                  {variacaoMassaMagra > 0 
                    ? `Excelente! Ganhou ${variacaoMassaMagra.toFixed(1)}kg de massa magra.`
                    : `Perdeu ${Math.abs(variacaoMassaMagra).toFixed(1)}kg de massa magra. Aumentar proteínas e intensidade.`
                  }
                </p>
              </div>
            </div>
          )}

          {ultimoProgresso?.metas_proxima_avaliacao && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-1">🎯 Próximas Metas</p>
              <p className="text-xs text-blue-800">{ultimoProgresso.metas_proxima_avaliacao}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}