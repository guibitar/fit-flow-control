import React, { useState } from "react";
import { Treino } from "@/api/entities";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Copy, Eye, X, Dumbbell, Clock, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import TreinoPreview from "./TreinoPreview";

export default function BuscaTreinoModelo({ open, onClose, onCopiar }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data: treinos = [], isLoading } = useQuery({
    queryKey: ['treinos-busca'],
    queryFn: () => Treino.list('-created_at'),
    initialData: [],
    enabled: open,
  });

  const treinosFiltrados = treinos.filter(treino => {
    const matchSearch = searchTerm === "" || 
      treino.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treino.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = tipoFiltro === "" || treino.tipo === tipoFiltro;
    return matchSearch && matchTipo;
  });

  const visualizarTreino = (treino) => {
    setTreinoSelecionado(treino);
    setShowPreview(true);
  };

  const copiarTreino = (treino) => {
    const treinoCopia = {
      titulo: treino.titulo + " (Cópia)",
      descricao: treino.descricao,
      cliente_id: "",
      cliente_nome: "",
      tipo: treino.tipo,
      duracao_estimada: treino.duracao_estimada,
      exercicios: [...treino.exercicios],
      data_envio: new Date().toISOString().split('T')[0]
    };
    
    onCopiar(treinoCopia);
    onClose();
    setShowPreview(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col mx-3 sm:mx-auto w-[calc(100vw-24px)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar Treino Modelo
            </DialogTitle>
            <p className="text-xs md:text-sm text-slate-600">
              Encontre um treino existente para usar como base
            </p>
          </DialogHeader>

          <div className="space-y-3 md:space-y-4">
            <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Buscar por nome ou cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Digite para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm md:text-base min-h-[44px]"
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Filtrar por tipo</Label>
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger className="min-h-[44px] text-sm md:text-base">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos os tipos</SelectItem>
                    <SelectItem value="forca">Força</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                    <SelectItem value="funcional">Funcional</SelectItem>
                    <SelectItem value="alongamento">Alongamento</SelectItem>
                    <SelectItem value="misto">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-3 md:pt-4">
              <p className="text-xs md:text-sm text-slate-600 mb-3">
                {treinosFiltrados.length} treino(s) encontrado(s)
              </p>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : treinosFiltrados.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Dumbbell className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-slate-300" />
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm md:text-base">
                    Nenhum treino encontrado
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600">
                    Tente ajustar os filtros ou buscar por outro termo
                  </p>
                </div>
              ) : (
                <div className="max-h-[50vh] overflow-y-auto space-y-2 md:space-y-3 pr-2">
                  {treinosFiltrados.map((treino) => (
                    <Card key={treino.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-3 md:p-4">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex items-start gap-2 mb-2">
                              <h3 className="font-bold text-slate-900 text-sm md:text-base break-words flex-1">
                                {treino.titulo}
                              </h3>
                              <Badge className="bg-blue-600 text-white text-[10px] md:text-xs flex-shrink-0">
                                {treino.tipo}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 md:space-y-1.5 text-xs md:text-sm text-slate-600">
                              <p className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-medium">Cliente:</span> {treino.cliente_nome}
                              </p>
                              {treino.duracao_estimada && (
                                <p className="flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                  {treino.duracao_estimada} minutos
                                </p>
                              )}
                              <p className="flex items-center gap-1.5">
                                <Dumbbell className="w-3 h-3 md:w-4 md:h-4" />
                                {treino.exercicios?.length || 0} exercícios
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                Criado em {format(new Date(treino.created_at || treino.created_date), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => visualizarTreino(treino)}
                              className="flex-1 sm:flex-none min-h-[44px] text-xs md:text-sm"
                            >
                              <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                              Visualizar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => copiarTreino(treino)}
                              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none min-h-[44px] text-xs md:text-sm"
                            >
                              <Copy className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                              Copiar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-3 md:pt-4 mt-auto">
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose} className="min-h-[44px] text-sm md:text-base">
                <X className="w-4 h-4 mr-2" />
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {treinoSelecionado && (
        <TreinoPreview
          treino={treinoSelecionado}
          open={showPreview}
          onClose={() => {
            setShowPreview(false);
            setTreinoSelecionado(null);
          }}
          onCopiar={() => copiarTreino(treinoSelecionado)}
        />
      )}
    </>
  );
}