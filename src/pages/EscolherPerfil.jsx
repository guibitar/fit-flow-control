import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EscolherPerfil() {
  const navigate = useNavigate();
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);

  const configurarPerfil = async (tipo) => {
    try {
      await base44.auth.updateMe({
        tipo_perfil: tipo
      });
      
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Erro ao configurar perfil:", error);
      alert("Erro ao configurar perfil. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Bem-vindo ao FitTrainer Pro!
          </h1>
          <p className="text-slate-600 text-lg">
            Para começar, escolha como você vai usar o sistema:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
              perfilSelecionado === 'personal_trainer' ? 'ring-4 ring-blue-500 shadow-xl' : 'hover:shadow-xl'
            }`}
            onClick={() => setPerfilSelecionado('personal_trainer')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Dumbbell className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Personal Trainer</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-slate-600">
                Crio e gerencio treinos para meus clientes
              </p>
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-left">
                <p className="font-semibold text-blue-900 mb-2">Com este perfil você pode:</p>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Cadastrar e gerenciar clientes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Criar treinos personalizados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Fazer avaliações físicas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Acompanhar evolução dos alunos</span>
                  </li>
                </ul>
              </div>
              {perfilSelecionado === 'personal_trainer' && (
                <Button 
                  onClick={() => configurarPerfil('personal_trainer')}
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                  size="lg"
                >
                  Continuar como Personal Trainer
                </Button>
              )}
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
              perfilSelecionado === 'cliente' ? 'ring-4 ring-green-500 shadow-xl' : 'hover:shadow-xl'
            }`}
            onClick={() => setPerfilSelecionado('cliente')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-slate-600">
                Quero acompanhar meus treinos e evolução
              </p>
              <div className="bg-green-50 rounded-lg p-4 text-sm text-left">
                <p className="font-semibold text-green-900 mb-2">Com este perfil você pode:</p>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Visualizar seus treinos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Acompanhar exercícios com vídeos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Ver histórico de avaliações</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Acompanhar sua evolução</span>
                  </li>
                </ul>
              </div>
              {perfilSelecionado === 'cliente' && (
                <Button 
                  onClick={() => configurarPerfil('cliente')}
                  className="w-full bg-green-600 hover:bg-green-700 mt-4"
                  size="lg"
                >
                  Continuar como Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            Você poderá alterar seu perfil posteriormente nas configurações
          </p>
        </div>
      </div>
    </div>
  );
}