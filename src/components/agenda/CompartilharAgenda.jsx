import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CompartilharAgenda({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [usarAlarmePadrao, setUsarAlarmePadrao] = useState(true);
  const [alarmOffset, setAlarmOffset] = useState(15);

  const { data: aulas = [] } = useQuery({
    queryKey: ['aulas'],
    queryFn: () => base44.entities.Aula.list('-data'),
    enabled: open,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
    enabled: open,
  });

  const { data: treinos = [] } = useQuery({
    queryKey: ['treinos'],
    queryFn: () => base44.entities.Treino.list(),
    enabled: open,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        setAlarmOffset(user.default_alarm_offset || 15);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    if (open) {
      loadUser();
    }
  }, [open]);

  const formatarDataICS = (data, horario) => {
    const [ano, mes, dia] = data.split('-');
    const [hora, minuto] = horario.split(':');
    return `${ano}${mes}${dia}T${hora}${minuto}00`;
  };

  const calcularDataFim = (dataInicio, duracaoMinutos) => {
    const [ano, mes, dia, hora, minuto] = [
      dataInicio.substring(0, 4),
      dataInicio.substring(4, 6),
      dataInicio.substring(6, 8),
      dataInicio.substring(9, 11),
      dataInicio.substring(11, 13)
    ];
    
    const dataObj = new Date(ano, mes - 1, dia, hora, minuto);
    dataObj.setMinutes(dataObj.getMinutes() + duracaoMinutos);
    
    const anoFim = dataObj.getFullYear();
    const mesFim = String(dataObj.getMonth() + 1).padStart(2, '0');
    const diaFim = String(dataObj.getDate()).padStart(2, '0');
    const horaFim = String(dataObj.getHours()).padStart(2, '0');
    const minutoFim = String(dataObj.getMinutes()).padStart(2, '0');
    
    return `${anoFim}${mesFim}${diaFim}T${horaFim}${minutoFim}00`;
  };

  const gerarAlarmTrigger = (offsetMinutos) => {
    if (offsetMinutos >= 1440) {
      const dias = Math.floor(offsetMinutos / 1440);
      return `-P${dias}D`;
    } else if (offsetMinutos >= 60) {
      const horas = Math.floor(offsetMinutos / 60);
      return `-PT${horas}H`;
    } else {
      return `-PT${offsetMinutos}M`;
    }
  };

  const gerarConteudoICS = () => {
    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);
    
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FitTrainer Pro//Calendario Treinos//PT-BR
CALSCALE:GREGORIAN
METHOD:PUBLISH

`;

    const aulasFuturas = aulas.filter(aula => {
      const [ano, mes, dia] = aula.data.split('-').map(Number);
      const dataAula = new Date(ano, mes - 1, dia);
      return dataAula >= dataAtual;
    });

    aulasFuturas.forEach((aula) => {
      aula.alunos?.forEach((aluno) => {
        const cliente = clientes.find(c => c.id === aluno.cliente_id);
        const treino = treinos.find(t => t.id === aluno.treino_id);
        
        if (!cliente) return;

        const dtStart = formatarDataICS(aula.data, aula.horario);
        const dtEnd = calcularDataFim(dtStart, aula.duracao_minutos || 60);
        const uid = `treino-${aula.data.replace(/-/g, '')}-${aula.horario.replace(/:/g, '')}-${aluno.cliente_id}@fittrainerpro.com`;
        
        const summary = `Treino: ${cliente.nome}${treino ? ' - ' + treino.titulo : ''}`;
        let description = `Cliente: ${cliente.nome}`;
        if (treino) {
          description += `\\nTreino: ${treino.titulo}`;
          if (treino.descricao) {
            description += `\\n${treino.descricao}`;
          }
        }
        if (aula.observacoes) {
          description += `\\nObservações: ${aula.observacoes}`;
        }
        if (aula.local) {
          description += `\\nLocal: ${aula.local}`;
        }
        if (aula.link_online) {
          description += `\\nLink: ${aula.link_online}`;
        }

        const eventStatus = aula.status === 'cancelada' ? 'CANCELLED' : 
                           aula.status === 'realizada' ? 'CONFIRMED' : 'TENTATIVE';

        icsContent += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${summary}
DESCRIPTION:${description}
STATUS:${eventStatus}
`;

        if (usarAlarmePadrao && aula.status !== 'cancelada') {
          const trigger = gerarAlarmTrigger(alarmOffset);
          icsContent += `BEGIN:VALARM
TRIGGER:${trigger}
ACTION:DISPLAY
DESCRIPTION:Lembrete de treino
END:VALARM
`;
        }

        icsContent += `END:VEVENT

`;
      });
    });

    icsContent += `END:VCALENDAR`;
    return icsContent;
  };

  const handleBaixar = async () => {
    if (totalEventos === 0) {
      toast.error("Não há aulas futuras para exportar");
      return;
    }

    setLoading(true);

    try {
      // Atualizar preferência de alarme do usuário
      if (currentUser && currentUser.default_alarm_offset !== alarmOffset) {
        await base44.auth.updateMe({ default_alarm_offset: alarmOffset });
      }

      // Gerar conteúdo ICS
      const icsContent = gerarConteudoICS();
      
      // Criar arquivo blob e fazer download
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'agenda-treinos.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Salvar informações da exportação
      localStorage.setItem('ultima_exportacao_calendario', new Date().toISOString());
      const hashAulas = JSON.stringify(aulasFuturas.map(a => ({ id: a.id, data: a.data, status: a.status, updated_date: a.updated_date })));
      localStorage.setItem('hash_aulas_exportadas', hashAulas);

      toast.success("✔ Agenda baixada com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao gerar agenda:", error);
      toast.error("Erro ao gerar agenda. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const dataAtual = new Date();
  dataAtual.setHours(0, 0, 0, 0);
  
  const aulasFuturas = aulas.filter(aula => {
    const [ano, mes, dia] = aula.data.split('-').map(Number);
    const dataAula = new Date(ano, mes - 1, dia);
    return dataAula >= dataAtual;
  });
  
  const totalEventos = aulasFuturas.reduce((acc, aula) => 
    acc + (aula.alunos?.length || 0), 0
  );
  
  const eventosCancelados = aulasFuturas.filter(a => a.status === 'cancelada').reduce((acc, aula) => 
    acc + (aula.alunos?.length || 0), 0
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Exportar Agenda Completa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Esta função exporta todos os eventos <strong>FUTUROS</strong> (a partir de hoje) em formato .ics compatível com Google Calendar, Outlook, Apple Calendar, etc.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <Label htmlFor="alarm-toggle" className="cursor-pointer">
                  Usar alarme padrão
                </Label>
              </div>
              <Switch
                id="alarm-toggle"
                checked={usarAlarmePadrao}
                onCheckedChange={setUsarAlarmePadrao}
              />
            </div>

            {usarAlarmePadrao && (
              <div className="space-y-2">
                <Label>Tempo do alarme</Label>
                <Select 
                  value={alarmOffset.toString()} 
                  onValueChange={(value) => setAlarmOffset(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos antes</SelectItem>
                    <SelectItem value="30">30 minutos antes</SelectItem>
                    <SelectItem value="60">1 hora antes</SelectItem>
                    <SelectItem value="120">2 horas antes</SelectItem>
                    <SelectItem value="1440">1 dia antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>📊 Prévia:</strong>
            </p>
            <p className="text-sm text-blue-800 mt-1">
              • {totalEventos} eventos serão exportados
            </p>
            {eventosCancelados > 0 && (
              <p className="text-sm text-blue-800">
                • {eventosCancelados} cancelamento(s) incluído(s)
              </p>
            )}
            <p className="text-sm text-blue-800">
              • Formato: arquivo .ics compatível
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleBaixar}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              "Gerando..."
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Confirmar e baixar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}