import React, { useState, useEffect } from "react";
import { Cliente, Treino, Aula } from "@/api/entities";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { X, Plus, User, Video, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AgendarAulaForm({ aula, open, onClose, onSubmit, dataSelecionada }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    data: dataSelecionada || new Date().toISOString().split('T')[0],
    horario: "09:00",
    tipo_aula: "presencial",
    alunos: [],
    status: "agendada",
    duracao_minutos: 60,
    local: "",
    link_online: "",
    observacoes: ""
  });

  const [alunoSelecionado, setAlunoSelecionado] = useState("");
  const [treinoSelecionado, setTreinoSelecionado] = useState("none");

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-ativos'],
    queryFn: () => Cliente.filter({ status: 'ativo' }),
    initialData: [],
    enabled: !authLoading && isAuthenticated && open,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  const { data: treinos = [] } = useQuery({
    queryKey: ['treinos-disponiveis'],
    queryFn: () => Treino.list('-created_at'),
    initialData: [],
    enabled: !authLoading && isAuthenticated && open,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  const { data: aulasPassadas = [] } = useQuery({
    queryKey: ['aulas-historico'],
    queryFn: () => Aula.list('-data'),
    initialData: [],
    enabled: !authLoading && isAuthenticated && open,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (dataSelecionada) {
      setFormData(prev => ({ ...prev, data: dataSelecionada }));
    }
  }, [dataSelecionada]);

  useEffect(() => {
    if (aula) {
      setFormData({
        data: aula.data,
        horario: aula.horario,
        tipo_aula: aula.tipo_aula || "presencial",
        alunos: aula.alunos || [],
        status: aula.status || "agendada",
        duracao_minutos: aula.duracao_minutos || 60,
        local: aula.local || "",
        link_online: aula.link_online || "",
        observacoes: aula.observacoes || ""
      });
    }
  }, [aula]);

  // Resetar treino quando aluno mudar
  useEffect(() => {
    if (!alunoSelecionado) {
      setTreinoSelecionado("none");
    }
  }, [alunoSelecionado]);

  // Filtrar clientes que ainda não foram adicionados à aula
  const clientesDisponiveis = clientes.filter(cliente => {
    // Verificar se o cliente já está na lista de alunos (comparar IDs como números)
    const jaAdicionado = formData.alunos.some(aluno => 
      parseInt(aluno.cliente_id) === parseInt(cliente.id)
    );
    return !jaAdicionado;
  });

  const treinosDoCliente = alunoSelecionado 
    ? treinos.filter(t => t.cliente_id === parseInt(alunoSelecionado))
    : [];

  const handleAdicionarAluno = () => {
    if (!alunoSelecionado) {
      alert("Selecione um aluno");
      return;
    }

    const cliente = clientes.find(c => c.id === parseInt(alunoSelecionado));
    const treino = treinoSelecionado && treinoSelecionado !== "" && treinoSelecionado !== "none" ? treinos.find(t => t.id === parseInt(treinoSelecionado)) : null;

    const novoAluno = {
      cliente_id: parseInt(alunoSelecionado),
      cliente_nome: cliente?.nome || "",
      treino_id: treinoSelecionado && treinoSelecionado !== "" && treinoSelecionado !== "none" ? parseInt(treinoSelecionado) : null,
      treino_titulo: treino?.titulo || null
    };

    if (formData.alunos.some(a => a.cliente_id === parseInt(alunoSelecionado))) {
      alert("Este aluno já está na aula");
      return;
    }

    setFormData({
      ...formData,
      alunos: [...formData.alunos, novoAluno]
    });

    // Limpar seleções após adicionar
    setAlunoSelecionado("");
    setTreinoSelecionado("none");

    // Sugerir local ou link baseado na última aula do cliente
    if (!aula) { // Apenas se for nova aula
      const aulasDoCliente = aulasPassadas.filter(a => 
        a.alunos?.some(al => al.cliente_id === parseInt(alunoSelecionado)) &&
        a.status !== 'cancelada'
      );

      if (aulasDoCliente.length > 0) {
        const ultimaAula = aulasDoCliente[0];
        
        // Se é a primeira vez definindo tipo, sugerir baseado na última aula
        if (!formData.tipo_aula || formData.alunos.length === 0) {
          if (ultimaAula.tipo_aula) {
            setFormData(prev => ({
              ...prev,
              tipo_aula: ultimaAula.tipo_aula,
              local: ultimaAula.tipo_aula === 'presencial' ? (ultimaAula.local || cliente?.local_aula_padrao || "") : prev.local,
              link_online: ultimaAula.tipo_aula === 'online' ? (ultimaAula.link_online || "") : prev.link_online
            }));
          }
        } else {
          // Sugerir local/link da última aula do mesmo tipo
          if (formData.tipo_aula === 'presencial' && !formData.local) {
            setFormData(prev => ({
              ...prev,
              local: ultimaAula.local || cliente?.local_aula_padrao || ""
            }));
          } else if (formData.tipo_aula === 'online' && !formData.link_online) {
            setFormData(prev => ({
              ...prev,
              link_online: ultimaAula.link_online || ""
            }));
          }
        }
      } else {
        // Se não tem histórico, sugerir local padrão do cliente
        if (cliente?.local_aula_padrao && formData.tipo_aula === 'presencial' && !formData.local) {
          setFormData(prev => ({
            ...prev,
            local: cliente.local_aula_padrao
          }));
        }
      }
    }

    setAlunoSelecionado("");
    setTreinoSelecionado("none");
  };

  const handleRemoverAluno = (clienteId) => {
    setFormData({
      ...formData,
      alunos: formData.alunos.filter(a => a.cliente_id !== clienteId)
    });
  };

  const handleTipoAulaChange = (tipo) => {
    setFormData({
      ...formData,
      tipo_aula: tipo
    });

    // Se mudar para presencial e tiver aluno, sugerir local
    if (tipo === 'presencial' && formData.alunos.length > 0 && !formData.local) {
      const primeiroAlunoId = formData.alunos[0].cliente_id;
      const cliente = clientes.find(c => c.id === primeiroAlunoId);
      
      // Buscar última aula presencial do cliente
      const ultimaAulaPresencial = aulasPassadas.find(a => 
        a.tipo_aula === 'presencial' &&
        a.alunos?.some(al => al.cliente_id === primeiroAlunoId) &&
        a.status !== 'cancelada'
      );

      setFormData(prev => ({
        ...prev,
        local: ultimaAulaPresencial?.local || cliente?.local_aula_padrao || ""
      }));
    }

    // Se mudar para online e tiver aluno, sugerir link
    if (tipo === 'online' && formData.alunos.length > 0 && !formData.link_online) {
      const primeiroAlunoId = formData.alunos[0].cliente_id;
      
      // Buscar última aula online do cliente
      const ultimaAulaOnline = aulasPassadas.find(a => 
        a.tipo_aula === 'online' &&
        a.alunos?.some(al => al.cliente_id === primeiroAlunoId) &&
        a.status !== 'cancelada'
      );

      if (ultimaAulaOnline?.link_online) {
        setFormData(prev => ({
          ...prev,
          link_online: ultimaAulaOnline.link_online
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.alunos.length === 0) {
      alert("Adicione pelo menos um aluno à aula");
      return;
    }
    if (formData.tipo_aula === 'online' && !formData.link_online) {
      alert("Informe o link para a aula online");
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {aula ? 'Editar Aula' : 'Agendar Nova Aula'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({...formData, data: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Horário *</Label>
              <Input
                type="time"
                value={formData.horario}
                onChange={(e) => setFormData({...formData, horario: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Duração (min)</Label>
              <Input
                type="number"
                value={formData.duracao_minutos}
                onChange={(e) => setFormData({...formData, duracao_minutos: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Aula *</Label>
            <Select value={formData.tipo_aula} onValueChange={handleTipoAulaChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Presencial
                  </div>
                </SelectItem>
                <SelectItem value="online">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Online
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipo_aula === 'presencial' ? (
            <div className="space-y-2">
              <Label>Local *</Label>
              <Input
                value={formData.local}
                onChange={(e) => setFormData({...formData, local: e.target.value})}
                placeholder="Ex: Academia, Parque, Condomínio..."
                required
              />
              <p className="text-xs text-slate-500">
                💡 Sugerido automaticamente com base no cadastro e histórico do cliente
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Link da Aula Online *</Label>
              <Input
                type="url"
                value={formData.link_online}
                onChange={(e) => setFormData({...formData, link_online: e.target.value})}
                placeholder="https://meet.google.com/... ou https://zoom.us/..."
                required
              />
              <p className="text-xs text-slate-500">
                💡 Sugerido automaticamente com base no histórico do cliente
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Label>Alunos na Aula *</Label>
            
            <Card className="p-4 bg-blue-50 border-2 border-dashed border-blue-200">
              <div className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Selecionar Aluno</Label>
                    <Select 
                      value={alunoSelecionado || undefined} 
                      onValueChange={(value) => setAlunoSelecionado(value || "")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha o aluno" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientesDisponiveis.length > 0 ? (
                          clientesDisponiveis.map((cliente) => (
                            <SelectItem key={cliente.id} value={String(cliente.id)}>
                              {cliente.nome}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-options" disabled>
                            Todos os alunos já foram adicionados
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {alunoSelecionado && (
                    <div className="space-y-2">
                      <Label className="text-xs">Treino (opcional)</Label>
                      <Select 
                        value={treinoSelecionado || "none"} 
                        onValueChange={(value) => setTreinoSelecionado(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o treino" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem treino específico</SelectItem>
                          {treinosDoCliente.map((treino) => (
                            <SelectItem key={treino.id} value={String(treino.id)}>
                              {treino.titulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleAdicionarAluno}
                  variant="outline"
                  className="w-full"
                  disabled={!alunoSelecionado}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Aluno
                </Button>
              </div>
            </Card>

            {formData.alunos.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Alunos Adicionados ({formData.alunos.length})</Label>
                {formData.alunos.map((aluno, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{aluno.cliente_nome}</p>
                        {aluno.treino_titulo && (
                          <p className="text-xs text-slate-600">📋 {aluno.treino_titulo}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoverAluno(aluno.cliente_id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {aula && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="realizada">Realizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              rows={3}
              placeholder="Observações sobre a aula..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {aula ? 'Salvar Alterações' : 'Agendar Aula'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}