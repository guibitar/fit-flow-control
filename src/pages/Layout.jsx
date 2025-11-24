

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Users, Dumbbell, Activity, Shield, User, Calendar, DollarSign, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Calendário",
    url: createPageUrl("Calendario"),
    icon: Calendar,
  },
  {
    title: "Clientes",
    url: createPageUrl("Clientes"),
    icon: Users,
  },
  {
    title: "Progresso",
    url: createPageUrl("Progresso"),
    icon: Activity,
  },
  {
    title: "Criar Treino",
    url: createPageUrl("CriarTreino"),
    icon: Dumbbell,
  },
  {
    title: "Avaliações",
    url: createPageUrl("Avaliacoes"),
    icon: Activity,
  },
  {
    title: "Financeiro",
    url: createPageUrl("Financeiro"),
    icon: DollarSign,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = currentUser?.role === 'admin';
  const isCliente = currentUser?.tipo_perfil === 'cliente';

  const obterSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  const primeiroNome = currentUser?.full_name?.split(' ')[0] || 'Usuário';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-200 p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Dumbbell className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-slate-900 text-base md:text-lg truncate">FitTrainer Pro</h2>
                <p className="text-[10px] md:text-xs text-slate-500 truncate">Gestão de Treinos</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2 md:p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 md:px-3 py-2">
                Menu Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mb-1 min-h-[44px] ${
                          location.pathname === item.url ? 'bg-blue-50 text-blue-700 font-medium' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5">
                          <item.icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                          <span className="text-sm md:text-base truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  
                  {isAdmin && (
                    <>
                      <div className="my-2 border-t border-slate-200" />
                      <SidebarGroupLabel className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 md:px-3 py-2">
                        Administração
                      </SidebarGroupLabel>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover:bg-red-50 hover:text-red-700 transition-all duration-200 rounded-lg mb-1 min-h-[44px] ${
                            location.pathname === createPageUrl("Administracao") ? 'bg-red-50 text-red-700 font-medium' : ''
                          }`}
                        >
                          <Link to={createPageUrl("Administracao")} className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5">
                            <Shield className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                            <span className="text-sm md:text-base truncate">Administrador</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}

                  {isCliente && (
                    <>
                      <div className="my-2 border-t border-slate-200" />
                      <SidebarGroupLabel className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 md:px-3 py-2">
                        Configurações
                      </SidebarGroupLabel>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 rounded-lg mb-1 min-h-[44px] ${
                            location.pathname === createPageUrl("MinhaConta") ? 'bg-purple-50 text-purple-700 font-medium' : ''
                          }`}
                        >
                          <Link to={createPageUrl("MinhaConta")} className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5">
                            <User className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                            <span className="text-sm md:text-base truncate">Minha Conta</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-3 md:p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isAdmin ? 'bg-gradient-to-br from-red-400 to-red-500' : 
                  isCliente ? 'bg-gradient-to-br from-purple-400 to-purple-500' :
                  'bg-gradient-to-br from-slate-300 to-slate-400'
                }`}>
                  <span className="text-white font-semibold text-xs md:text-sm">
                    {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-xs md:text-sm truncate">
                    {currentUser?.full_name || 'Usuário'}
                  </p>
                  <p className="text-[10px] md:text-xs text-slate-500 truncate">
                    {isAdmin ? '👨‍💼 Administrador' : 
                     currentUser?.tipo_perfil === 'personal_trainer' ? '💪 Personal Trainer' : 
                     '🧑 Cliente'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 h-9"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col w-full">
          <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
            {/* Mobile Header */}
            <div className="px-3 py-3 md:px-6 md:py-4 flex items-center gap-3 md:gap-4 lg:hidden">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center" />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base md:text-lg font-bold text-slate-900 truncate">
                    FitTrainer Pro
                  </h1>
                </div>
              </div>
            </div>

            {/* Desktop Header - Saudação */}
            <div className="hidden lg:flex items-center justify-between px-6 py-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {obterSaudacao()}, {primeiroNome}! 👋
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Bem-vindo ao FitTrainer Pro
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isAdmin ? 'bg-gradient-to-br from-red-400 to-red-500' : 
                  isCliente ? 'bg-gradient-to-br from-purple-400 to-purple-500' :
                  'bg-gradient-to-br from-blue-400 to-blue-500'
                }`}>
                  <span className="text-white font-semibold text-sm">
                    {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

