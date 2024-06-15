import React from 'react';
import { Card } from 'antd';
import { useAtendimentoContext } from '../../context/AtendimentoContext'; // Importe o contexto

const Dashboard: React.FC = () => {
    const { numeroAtendimentosMes, pessoasAgendadasMes, rendimentosMes } = useAtendimentoContext(); // Obtenha os dados do contexto

    return (
        <div className="site-layout-background" style={{ padding: 24, minHeight: 360, background: '#fef4f2' }}>
            <Card title="Número de Atendimentos do Mês" style={{ marginBottom: 16 }}>
                {numeroAtendimentosMes()}
            </Card>
            <Card title="Pessoas Agendadas do Mês" style={{ marginBottom: 16 }}>
                {pessoasAgendadasMes()}
            </Card>
            <Card title="Rendimentos do Mês">
                R$ {rendimentosMes().toFixed(2)}
            </Card>
        </div>
    );
};

export default Dashboard;
