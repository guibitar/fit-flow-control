import React, { useState } from "react";
import { Treino } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Dumbbell, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import TreinoVisualizacao from "@/components/treinos/TreinoVisualizacao";

export default function ListaTreinosCliente({ clienteId, clienteNome, open, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [showTreino, setShowTreino] = useState(false);
  const [treinoParaExcluir, setTreinoParaExcluir] = useState(null);

  const { data: treinos = [], isLoading } = useQuery({
    queryKey: ['treinos-cliente-lista', clienteId],
    queryFn: () => Treino.filter({ cliente_id: parseInt(clienteId) }),
    initialData: [],
    enabled: open && !!clienteId,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  const deleteTreinoMutation = useMutation({
    mutationFn: (id) => Treino.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos-cliente-lista', clienteId] });
      queryClient.invalidateQueries({ queryKey: ['treinos-cliente', clienteId] });
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      queryClient.refetchQueries({ queryKey: ['treinos-cliente-lista', clienteId] });
      setTreinoParaExcluir(null);
    },
  });

  const handleVisualizar = (treino) => {
    setTreinoSelecionado(treino);
    setShowTreino(true);
  };

  const handleEditar = (treino) => {
    navigate(createPageUrl("EditarTreino") + `?id=${treino.id}`);
    onClose();
  };

  const confirmarExclusao = () => {
    if (treinoParaExcluir) {
      deleteTreinoMutation.mutate(treinoParaExcluir.id);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-600" />
              Treinos de {clienteNome}
            </DialogTitle>
            <p className="text-sm text-slate-600">
              {treinos.length} treino(s) cadastrado(s)
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : treinos.length === 0 ? (
              <div className="text-center py-12">
                <Dumbbell className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="font-semibold text-slate-900 mb-2">
                  Nenhum treino cadastrado
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  Este cliente ainda não possui treinos criados
                </p>
                <Button
                  onClick={() => {
                    navigate(createPageUrl("CriarTreino"));
                    onClose();
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Criar Primeiro Treino
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {treinos.map((treino) => (
                  <Card key={treino.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-base mb-2 break-words">
                            {treino.titulo}
                          </h3>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge className="bg-blue-600 text-white">
                              {treino.tipo}
                            </Badge>
                            {treino.duracao_estimada && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {treino.duracao_estimada} min
                              </Badge>
                            )}
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Dumbbell className="w-3 h-3" />
                              {treino.exercicios?.reduce((acc, item) => 
                                acc + (item.tipo_item === 'exercicio' ? 1 : item.exercicios_grupo?.length || 0), 0
                              ) || 0} exercícios
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(treino.created_at || treino.data_envio || new Date()), "dd/MM/yyyy", { locale: ptBR })}
                            </Badge>
                          </div>

                          {treino.descricao && (
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {treino.descricao}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVisualizar(treino)}
                            className="hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditar(treino)}
                            className="hover:bg-green-50 hover:text-green-700"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setTreinoParaExcluir(treino)}
                            className="hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TreinoVisualizacao
        treino={treinoSelecionado}
        open={showTreino}
        onClose={() => {
          setShowTreino(false);
          setTreinoSelecionado(null);
        }}
      />

      <AlertDialog open={!!treinoParaExcluir} onOpenChange={() => setTreinoParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o treino "{treinoParaExcluir?.titulo}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}