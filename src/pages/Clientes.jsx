import React, { useState } from "react";
import { Cliente } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, Filter, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import ClienteCard from "../components/clientes/ClienteCard";
import ClienteForm from "../components/clientes/ClienteForm";

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroObjetivo, setFiltroObjetivo] = useState("todos");
  const queryClient = useQueryClient();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: clientes = [], isLoading, error } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      try {
        const data = await Cliente.list('-created_at');
        console.log('Clientes retornados da API:', data);
        console.log('Tipo:', Array.isArray(data) ? 'array' : typeof data);
        console.log('Quantidade:', Array.isArray(data) ? data.length : 'não é array');
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        return [];
      }
    },
    enabled: !authLoading && isAuthenticated, // Só executar quando autenticado
    staleTime: 0, // Sempre considerar os dados como "stale" para forçar refetch
    cacheTime: 0, // Não manter cache
    refetchOnMount: true, // Sempre refazer a query quando o componente montar
    refetchOnWindowFocus: false, // Não refazer quando a janela ganhar foco
  });

  // Debug: mostrar erro se houver
  if (error) {
    console.error('Erro na query de clientes:', error);
  }

  const createClienteMutation = useMutation({
    mutationFn: (data) => Cliente.create(data),
    onSuccess: () => {
      // Invalidar e refazer todas as queries de clientes
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.refetchQueries({ queryKey: ['clientes'] });
      setShowForm(false);
      setEditingCliente(null);
    },
  });

  const updateClienteMutation = useMutation({
    mutationFn: ({ id, data }) => Cliente.update(id, data),
    onSuccess: () => {
      // Invalidar e refazer todas as queries de clientes
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.refetchQueries({ queryKey: ['clientes'] });
      setShowForm(false);
      setEditingCliente(null);
    },
  });

  const handleSubmit = (data) => {
    if (editingCliente) {
      updateClienteMutation.mutate({ id: editingCliente.id, data });
    } else {
      createClienteMutation.mutate(data);
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setShowForm(true);
  };

  // Debug: verificar dados
  console.log('Clientes no componente:', clientes);
  console.log('É array?', Array.isArray(clientes));
  console.log('Quantidade:', clientes?.length);

  // Filtros
  const filteredClientes = (Array.isArray(clientes) ? clientes : []).filter(cliente => {
    if (!cliente || !cliente.nome) return false;
    const matchSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = filtroStatus === "todos" || cliente.status === filtroStatus;
    const matchObjetivo = filtroObjetivo === "todos" || (cliente.objetivo && cliente.objetivo.toLowerCase().includes(filtroObjetivo.toLowerCase()));
    
    return matchSearch && matchStatus && matchObjetivo;
  });

  const objetivosUnicos = [...new Set((Array.isArray(clientes) ? clientes : []).map(c => c.objetivo).filter(Boolean))];
  const clientesAtivos = (Array.isArray(clientes) ? clientes : []).filter(c => c.status === 'ativo').length;
  const clientesInativos = (Array.isArray(clientes) ? clientes : []).filter(c => c.status === 'inativo').length;

  const temFiltrosAtivos = filtroStatus !== "todos" || filtroObjetivo !== "todos" || searchTerm !== "";

  const limparFiltros = () => {
    setSearchTerm("");
    setFiltroStatus("todos");
    setFiltroObjetivo("todos");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                Clientes
              </h1>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                {clientesAtivos} ativos • {clientesInativos} inativos • {(Array.isArray(clientes) ? clientes : []).length} total
              </p>
            </div>
            <Button 
              onClick={() => {
                setEditingCliente(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all w-full md:w-auto"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Filtros e Busca */}
        <div className="mb-6 space-y-4">
          {/* Barra de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-white shadow-sm border-slate-300 h-12 text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="bg-white border-slate-300 h-11">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="ativo">✅ Ativos</SelectItem>
                  <SelectItem value="inativo">⏸️ Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={filtroObjetivo} onValueChange={setFiltroObjetivo}>
                <SelectTrigger className="bg-white border-slate-300 h-11">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Objetivo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Objetivos</SelectItem>
                  {objetivosUnicos.map((obj) => (
                    <SelectItem key={obj} value={obj}>
                      {obj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {temFiltrosAtivos && (
              <Button
                variant="outline"
                onClick={limparFiltros}
                className="h-11"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>

          {/* Indicador de Filtros */}
          {temFiltrosAtivos && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-slate-600">Filtros ativos:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Busca: "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filtroStatus !== "todos" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filtroStatus}
                  <button onClick={() => setFiltroStatus("todos")} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filtroObjetivo !== "todos" && (
                <Badge variant="secondary" className="gap-1">
                  Objetivo: {filtroObjetivo}
                  <button onClick={() => setFiltroObjetivo("todos")} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Grid de Clientes */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white rounded-xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 md:w-12 md:h-12 text-slate-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">
              {searchTerm || temFiltrosAtivos ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
            </h3>
            <p className="text-sm md:text-base text-slate-600 mb-6">
              {searchTerm || temFiltrosAtivos ? "Tente ajustar os filtros de busca" : "Comece cadastrando seu primeiro cliente"}
            </p>
            {!searchTerm && !temFiltrosAtivos && (
              <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Cadastrar Primeiro Cliente
              </Button>
            )}
            {temFiltrosAtivos && (
              <Button onClick={limparFiltros} variant="outline" size="lg">
                <X className="w-5 h-5 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-slate-600">
              Mostrando <span className="font-semibold text-slate-900">{filteredClientes.length}</span> {filteredClientes.length === 1 ? 'cliente' : 'clientes'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredClientes.map((cliente) => (
                <ClienteCard
                  key={cliente.id}
                  cliente={cliente}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de Formulário */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingCliente ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <ClienteForm
            cliente={editingCliente}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingCliente(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}