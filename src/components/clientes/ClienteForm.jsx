import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClienteForm({ cliente, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(cliente || {
    nome: "",
    email: "",
    telefone: "",
    data_nascimento: "",
    sexo: "masculino",
    altura: "",
    peso_atual: "",
    objetivo: "",
    observacoes: "",
    status: "ativo",
    valor_aula: "",
    local_aula_padrao: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      // Converter strings vazias para null nos campos opcionais
      data_nascimento: formData.data_nascimento && formData.data_nascimento.trim() !== '' 
        ? formData.data_nascimento 
        : null,
      altura: formData.altura && formData.altura.trim() !== '' 
        ? parseFloat(formData.altura) 
        : null,
      peso_atual: formData.peso_atual && formData.peso_atual.trim() !== '' 
        ? parseFloat(formData.peso_atual) 
        : null,
      valor_aula: formData.valor_aula && formData.valor_aula.trim() !== '' 
        ? parseFloat(formData.valor_aula) 
        : null,
      // Limpar strings vazias de outros campos opcionais
      email: formData.email && formData.email.trim() !== '' ? formData.email : null,
      telefone: formData.telefone && formData.telefone.trim() !== '' ? formData.telefone : null,
      objetivo: formData.objetivo && formData.objetivo.trim() !== '' ? formData.objetivo : null,
      observacoes: formData.observacoes && formData.observacoes.trim() !== '' ? formData.observacoes : null,
      local_aula_padrao: formData.local_aula_padrao && formData.local_aula_padrao.trim() !== '' 
        ? formData.local_aula_padrao 
        : null,
    };
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome Completo *</Label>
          <Input
            required
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            placeholder="Nome do cliente"
          />
        </div>
        <div className="space-y-2">
          <Label>Email *</Label>
          <Input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="email@exemplo.com"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input
            value={formData.telefone}
            onChange={(e) => setFormData({...formData, telefone: e.target.value})}
            placeholder="(00) 00000-0000"
          />
        </div>
        <div className="space-y-2">
          <Label>Data de Nascimento</Label>
          <Input
            type="date"
            value={formData.data_nascimento}
            onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Sexo</Label>
          <Select value={formData.sexo} onValueChange={(value) => setFormData({...formData, sexo: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="feminino">Feminino</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Altura (m)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.altura}
            onChange={(e) => setFormData({...formData, altura: e.target.value})}
            placeholder="Ex: 1.75"
          />
        </div>
        <div className="space-y-2">
          <Label>Peso Atual (kg)</Label>
          <Input
            type="number"
            step="0.1"
            value={formData.peso_atual}
            onChange={(e) => setFormData({...formData, peso_atual: e.target.value})}
            placeholder="Ex: 70.5"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Objetivo</Label>
          <Input
            value={formData.objetivo}
            onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
            placeholder="Ex: Hipertrofia, Emagrecimento, Condicionamento..."
          />
        </div>
        <div className="space-y-2">
          <Label>Valor da Aula (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.valor_aula}
            onChange={(e) => setFormData({...formData, valor_aula: e.target.value})}
            placeholder="Ex: 80.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Local Padrão de Aula</Label>
        <Input
          value={formData.local_aula_padrao}
          onChange={(e) => setFormData({...formData, local_aula_padrao: e.target.value})}
          placeholder="Ex: Academia X, Parque da Cidade, Condomínio..."
        />
        <p className="text-xs text-slate-500">Este local será sugerido automaticamente ao agendar aulas para este cliente</p>
      </div>

      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea
          value={formData.observacoes}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          placeholder="Restrições, lesões, observações importantes..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {cliente ? "Atualizar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}