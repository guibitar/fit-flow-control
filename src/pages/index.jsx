import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Clientes from "./Clientes";

import CriarTreino from "./CriarTreino";

import Avaliacoes from "./Avaliacoes";

import EditarTreino from "./EditarTreino";

import Administracao from "./Administracao";

import EscolherPerfil from "./EscolherPerfil";

import MinhaConta from "./MinhaConta";

import Calendario from "./Calendario";

import Financeiro from "./Financeiro";

import Progresso from "./Progresso";

import ProgressoCliente from "./ProgressoCliente";

import Login from "./Login";

import ProtectedRoute from "@/components/ProtectedRoute";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Clientes: Clientes,
    
    CriarTreino: CriarTreino,
    
    Avaliacoes: Avaliacoes,
    
    EditarTreino: EditarTreino,
    
    Administracao: Administracao,
    
    EscolherPerfil: EscolherPerfil,
    
    MinhaConta: MinhaConta,
    
    Calendario: Calendario,
    
    Financeiro: Financeiro,
    
    Progresso: Progresso,
    
    ProgressoCliente: ProgressoCliente,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Routes>
            {/* Rota pública de Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rotas protegidas - todas dentro do Layout */}
            <Route path="/*" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Routes>
                            <Route index element={<Dashboard />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="Dashboard" element={<Dashboard />} />
                            <Route path="Clientes" element={<Clientes />} />
                            <Route path="CriarTreino" element={<CriarTreino />} />
                            <Route path="Avaliacoes" element={<Avaliacoes />} />
                            <Route path="EditarTreino" element={<EditarTreino />} />
                            <Route path="Administracao" element={<Administracao />} />
                            <Route path="EscolherPerfil" element={<EscolherPerfil />} />
                            <Route path="MinhaConta" element={<MinhaConta />} />
                            <Route path="Calendario" element={<Calendario />} />
                            <Route path="Financeiro" element={<Financeiro />} />
                            <Route path="Progresso" element={<Progresso />} />
                            <Route path="ProgressoCliente" element={<ProgressoCliente />} />
                        </Routes>
                    </Layout>
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}