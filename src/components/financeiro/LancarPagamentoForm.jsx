import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";

export default function LancarPagamentoForm({ open, onClose, cliente, onSubmit }) {
  const [formData, setFormData] = useState({
    valor: "",
    data_transacao: new Date().toISOString().split('T')[0],
    referencia: "Pagamento de aulas",
    metodo_pagamento: "pix"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const pagamento = {
      cliente_id: parseInt(cliente.id),
      cliente_nome: cliente.nome || '',
      tipo_transacao: "pagamento",
      data_transacao: new Date(formData.data_transacao).toISOString(),
      valor: -Math.abs(parseFloat(formData.valor)), // Negativo para pagamento
      descricao: formData.referencia || 'Pagamento de aulas',
      metodo_pagamento: formData.metodo_pagamento
    };

    onSubmit(pagamento);
    
    // Reset form
    setFormData({
      valor: "",
      data_transacao: new Date().toISOString().split('T')[0],
      referencia: "Pagamento de aulas",
      metodo_pagamento: "pix"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Lançar Pagamento - {cliente?.nome}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Valor (R$) *</Label>
            <Input
              type="number"
              step="0.01"
              required
              value={formData.valor}
              onChange={(e) => setFormData({...formData, valor: e.target.value})}
              placeholder="Ex: 150.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Data do Pagamento *</Label>
            <Input
              type="date"
              required
              value={formData.data_transacao}
              onChange={(e) => setFormData({...formData, data_transacao: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Método de Pagamento *</Label>
            <Select
              value={formData.metodo_pagamento}
              onValueChange={(value) => setFormData({...formData, metodo_pagamento: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">📱 PIX</SelectItem>
                <SelectItem value="dinheiro">💵 Dinheiro</SelectItem>
                <SelectItem value="cartao_credito">💳 Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">💳 Cartão de Débito</SelectItem>
                <SelectItem value="transferencia">🏦 Transferência Bancária</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Referência</Label>
            <Textarea
              value={formData.referencia}
              onChange={(e) => setFormData({...formData, referencia: e.target.value})}
              placeholder="Descrição do pagamento..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Confirmar Pagamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}