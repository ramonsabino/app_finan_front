import React, { useState, useRef } from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CustomHeader from './components/CustomHeader/CustomHeader';
import CustomFooter from './components/CustomFooter/CustomFooter';
import Dashboard from './components/Dashboard/Dashboard';
import RegistroAtendimento from './components/RegistroAtendimento/RegistroAtendimento';
import Clientes from './components/Clientes/Clientes';
import Agenda from './components/Agenda/Agenda';
import Rendimentos from './components/Rendimentos/Rendimentos';
import Historico from './components/HistoricoDeAtendimento/HistoricoDeAtendimento';

import { AtendimentoProvider } from './context/AtendimentoContext'; // Importe o AtendimentoProvider

const { Content } = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const siderRef = useRef<HTMLDivElement>(null);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Router>
      <AtendimentoProvider> {/* Adicione o AtendimentoProvider aqui */}
        <Layout style={{ minHeight: '100vh', backgroundColor: '#fef4f2' }}>
          <Layout className="site-layout" style={{ backgroundColor: '#fef4f2' }}>
            <CustomHeader collapsed={collapsed} toggleCollapsed={toggleCollapsed} siderRef={siderRef} />
            <Content style={{ margin: '16px 16px 0', backgroundColor: '#fef4f2' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/registro-atendimento" element={<RegistroAtendimento />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/rendimentos" element={<Rendimentos />} />
                <Route path="/historico-atendimentos" element={<Historico />} />
              </Routes>
            </Content>
            <CustomFooter />
          </Layout>
        </Layout>
      </AtendimentoProvider>
    </Router>
  );
};

export default App;
