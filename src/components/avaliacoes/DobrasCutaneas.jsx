import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DobrasCutaneas({ sexo, idade, peso, dobras, onChange, onResultadosChange }) {
  const [dobrasState, setDobrasState] = useState(dobras || {});
  const [resultados, setResultados] = useState(null);

  // Calcular média de dobras bilaterais
  const calcularMedia = (direito, esquerdo) => {
    const d = parseFloat(direito) || 0;
    const e = parseFloat(esquerdo) || 0;
    if (d > 0 && e > 0) return (d + e) / 2;
    if (d > 0) return d;
    if (e > 0) return e;
    return 0;
  };

  // Calcular densidade corporal e composição
  const calcularComposicao = () => {
    if (!sexo || !idade || !peso) {
      setResultados(null);
      if (onResultadosChange) onResultadosChange(null);
      return;
    }

    const dobrasValidas = {
      peitoral: parseFloat(dobrasState.peitoral) || 0,
      triceps: calcularMedia(dobrasState.triceps_direito, dobrasState.triceps_esquerdo),
      subescapular: calcularMedia(dobrasState.subescapular_direito, dobrasState.subescapular_esquerdo),
      axilar_media: calcularMedia(dobrasState.axilar_media_direito, dobrasState.axilar_media_esquerdo),
      suprailiaca: calcularMedia(dobrasState.suprailiaca_direito, dobrasState.suprailiaca_esquerdo),
      abdominal: parseFloat(dobrasState.abdominal) || 0,
      coxa: calcularMedia(dobrasState.coxa_direito, dobrasState.coxa_esquerdo)
    };

    // Protocolo de 3 dobras (Jackson & Pollock)
    const protocolo3H = sexo === 'M' ? 
      [dobrasValidas.peitoral, dobrasValidas.abdominal, dobrasValidas.coxa] :
      [dobrasValidas.triceps, dobrasValidas.suprailiaca, dobrasValidas.coxa];
    
    const validas3 = protocolo3H.filter(v => v > 0).length;
    const soma3 = protocolo3H.reduce((acc, val) => acc + val, 0);

    // Protocolo de 4 dobras (Durnin & Womersley)
    const protocolo4 = [
      dobrasValidas.triceps,
      dobrasValidas.subescapular,
      dobrasValidas.suprailiaca,
      dobrasValidas.peitoral
    ];
    const validas4 = protocolo4.filter(v => v > 0).length;
    const soma4 = protocolo4.reduce((acc, val) => acc + val, 0);

    // Protocolo de 7 dobras (Jackson & Pollock)
    const protocolo7 = [
      dobrasValidas.peitoral,
      dobrasValidas.triceps,
      dobrasValidas.subescapular,
      dobrasValidas.axilar_media,
      dobrasValidas.suprailiaca,
      dobrasValidas.abdominal,
      dobrasValidas.coxa
    ];
    const validas7 = protocolo7.filter(v => v > 0).length;
    const soma7 = protocolo7.reduce((acc, val) => acc + val, 0);

    let DC, percentualGordura, protocolo, somatorio;

    // Escolher protocolo baseado nas dobras disponíveis
    if (validas7 === 7) {
      // Protocolo de 7 dobras
      protocolo = "7 dobras (Jackson & Pollock)";
      somatorio = soma7;
      
      if (sexo === 'M') {
        DC = 1.112 - 0.00043499 * soma7 + 0.00000055 * (soma7 ** 2) - 0.00028826 * idade;
      } else {
        DC = 1.097 - 0.00046971 * soma7 + 0.00000056 * (soma7 ** 2) - 0.00012828 * idade;
      }
    } else if (validas4 === 4) {
      // Protocolo de 4 dobras
      protocolo = "4 dobras (Durnin & Womersley)";
      somatorio = soma4;
      const logSoma4 = Math.log10(soma4);
      
      if (sexo === 'M') {
        DC = 1.1765 - 0.0744 * logSoma4;
      } else {
        DC = 1.1567 - 0.0717 * logSoma4;
      }
    } else if (validas3 === 3) {
      // Protocolo de 3 dobras
      protocolo = "3 dobras (Jackson & Pollock)";
      somatorio = soma3;
      
      if (sexo === 'M') {
        DC = 1.10938 - 0.0008267 * soma3 + 0.0000016 * (soma3 ** 2) - 0.0002574 * idade;
      } else {
        DC = 1.0994921 - 0.0009929 * soma3 + 0.0000023 * (soma3 ** 2) - 0.0001392 * idade;
      }
    } else {
      setResultados(null);
      if (onResultadosChange) onResultadosChange(null);
      return;
    }

    // Calcular %G usando equação de Siri
    percentualGordura = ((4.95 / DC) - 4.50) * 100;
    const massaMagra = peso * (1 - (percentualGordura / 100));
    const massaGorda = peso * (percentualGordura / 100);

    const resultadosCalculados = {
      somatorio_dobras: parseFloat(somatorio.toFixed(1)),
      densidade_corporal: parseFloat(DC.toFixed(4)),
      percentual_gordura_calculado: parseFloat(percentualGordura.toFixed(1)),
      massa_magra: parseFloat(massaMagra.toFixed(1)),
      massa_gorda: parseFloat(massaGorda.toFixed(1)),
      protocolo_utilizado: protocolo
    };

    setResultados(resultadosCalculados);
    if (onResultadosChange) onResultadosChange(resultadosCalculados);
  };

  useEffect(() => {
    calcularComposicao();
  }, [dobrasState, sexo, idade, peso]);

  const handleDobraChange = (campo, valor) => {
    const novasDobras = { ...dobrasState, [campo]: valor };
    setDobrasState(novasDobras);
    if (onChange) onChange(novasDobras);
  };

  const DobraInput = ({ label, campo, cor, bilateral = false, tooltip }) => {
    if (bilateral) {
      return (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              cor === 'verde' ? 'bg-green-500' : 
              cor === 'amarelo' ? 'bg-yellow-500' : 
              'bg-blue-500'
            }`}></span>
            {label}
            {tooltip && (
              <span className="text-xs text-slate-500" title={tooltip}>
                <Info className="w-3 h-3 inline" />
              </span>
            )}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-slate-500">Direito</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="mm"
                value={dobrasState[`${campo}_direito`] || ""}
                onChange={(e) => handleDobraChange(`${campo}_direito`, e.target.value)}
                className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Esquerdo</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="mm"
                value={dobrasState[`${campo}_esquerdo`] || ""}
                onChange={(e) => handleDobraChange(`${campo}_esquerdo`, e.target.value)}
                className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            cor === 'verde' ? 'bg-green-500' : 
            cor === 'amarelo' ? 'bg-yellow-500' : 
            'bg-blue-500'
          }`}></span>
          {label}
          {tooltip && (
            <span className="text-xs text-slate-500" title={tooltip}>
              <Info className="w-3 h-3 inline" />
            </span>
          )}
        </Label>
        <Input
          type="number"
          step="0.1"
          placeholder="mm"
          value={dobrasState[campo] || ""}
          onChange={(e) => handleDobraChange(campo, e.target.value)}
          className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Avaliação por Dobras Cutâneas
          </CardTitle>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span>Obrigatórias (3 dobras)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span>Intermediárias (4 dobras)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Avançadas (7 dobras)</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Preencha no mínimo 3 dobras para cálculo automático. Para dobras bilaterais, a média será calculada automaticamente.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Dobras Verdes - Obrigatórias */}
            {sexo === 'M' && (
              <DobraInput 
                label="Peitoral" 
                campo="peitoral" 
                cor="verde"
                tooltip="Obrigatória para homens (3 dobras)"
              />
            )}
            
            {sexo === 'F' && (
              <DobraInput 
                label="Tríceps" 
                campo="triceps" 
                cor="verde"
                bilateral
                tooltip="Obrigatória para mulheres (3 dobras)"
              />
            )}
            
            {sexo === 'F' && (
              <DobraInput 
                label="Suprailíaca" 
                campo="suprailiaca" 
                cor="verde"
                bilateral
                tooltip="Obrigatória para mulheres (3 dobras)"
              />
            )}
            
            {sexo === 'M' && (
              <DobraInput 
                label="Abdominal" 
                campo="abdominal" 
                cor="verde"
                tooltip="Obrigatória para homens (3 dobras)"
              />
            )}
            
            <DobraInput 
              label="Coxa" 
              campo="coxa" 
              cor="verde"
              bilateral
              tooltip="Obrigatória (3 dobras)"
            />

            {/* Dobras Amarelas - Intermediárias */}
            {sexo === 'M' && (
              <DobraInput 
                label="Tríceps" 
                campo="triceps" 
                cor="amarelo"
                bilateral
                tooltip="Intermediária (4 dobras)"
              />
            )}

            <DobraInput 
              label="Subescapular" 
              campo="subescapular" 
              cor="amarelo"
              bilateral
              tooltip="Intermediária (4 dobras)"
            />
            
            {sexo === 'M' && (
              <DobraInput 
                label="Suprailíaca" 
                campo="suprailiaca" 
                cor="amarelo"
                bilateral
                tooltip="Intermediária (4 dobras)"
              />
            )}

            {/* Dobras Azuis - Avançadas */}
            {sexo === 'F' && (
              <DobraInput 
                label="Peitoral" 
                campo="peitoral" 
                cor="azul"
                tooltip="Avançada (7 dobras)"
              />
            )}
            
            <DobraInput 
              label="Axilar Média" 
              campo="axilar_media" 
              cor="azul"
              bilateral
              tooltip="Avançada (7 dobras)"
            />
            
            {sexo === 'F' && (
              <DobraInput 
                label="Abdominal" 
                campo="abdominal" 
                cor="azul"
                tooltip="Avançada (7 dobras)"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {resultados && (
        <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Resultados da Composição Corporal
            </CardTitle>
            <Badge className="w-fit">{resultados.protocolo_utilizado}</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Σ Dobras</p>
                <p className="text-2xl font-bold text-slate-900">{resultados.somatorio_dobras}</p>
                <p className="text-xs text-slate-600">mm</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Densidade Corporal</p>
                <p className="text-2xl font-bold text-slate-900">{resultados.densidade_corporal}</p>
                <p className="text-xs text-slate-600">g/ml</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">% Gordura</p>
                <p className="text-2xl font-bold text-blue-600">{resultados.percentual_gordura_calculado}</p>
                <p className="text-xs text-slate-600">%</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Massa Magra</p>
                <p className="text-2xl font-bold text-green-600">{resultados.massa_magra}</p>
                <p className="text-xs text-slate-600">kg</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Massa Gorda</p>
                <p className="text-2xl font-bold text-orange-600">{resultados.massa_gorda}</p>
                <p className="text-xs text-slate-600">kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!resultados && sexo && idade && peso && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Dados insuficientes para cálculo do percentual de gordura. Preencha no mínimo 3 dobras válidas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}