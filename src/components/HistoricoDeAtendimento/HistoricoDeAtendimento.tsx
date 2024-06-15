import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Collapse } from 'antd';
import { useAtendimentoContext, extrairMesDaData } from '../../context/AtendimentoContext'; // Importando o hook de contexto e função auxiliar
import { Atendimento } from '../../context/AtendimentoContext'; // Importando o tipo Atendimento
import moment from 'moment'; // Importando moment.js para formatação de data

interface Mes {
    mes: string;
    totalAtendimentos: number;
    totalRendimentos: number;
    clientesAtendidos: Cliente[];
}

interface Cliente {
    nome: string;
    procedimento: string;
    valor: number;
    dataHoraAgendada: string;
}

const { Panel } = Collapse;

const Historico: React.FC = () => {
    const { atendimentos } = useAtendimentoContext(); // Obtendo os atendimentos do contexto
    const [modalVisible, setModalVisible] = useState(false);
    const [clientesDoMes, setClientesDoMes] = useState<Cliente[]>([]);
    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

    const handleVerHistorico = (clientesAtendidos: Cliente[]) => {
        setClientesDoMes(clientesAtendidos);
        setModalVisible(true); // Abrir o modal ao clicar em "Ver Histórico"
    };

    const columns = [
        { title: 'Mês', dataIndex: 'mes', key: 'mes' },
        { title: 'Total de Atendimentos', dataIndex: 'totalAtendimentos', key: 'totalAtendimentos' },
        { 
            title: 'Total de Rendimentos', 
            dataIndex: 'totalRendimentos', 
            key: 'totalRendimentos', 
            render: (rendimentos: number) => `R$ ${rendimentos.toFixed(2)}` // Adicionando o símbolo 'R$' antes do valor
        },
        {
            title: 'Ações',
            dataIndex: 'actions',
            key: 'actions',
            render: (_text: any, record: Mes) => (
                <Button type="primary" onClick={() => handleVerHistorico(record.clientesAtendidos)}>Ver Histórico</Button>
            ),
        },
    ];

    // Função para transformar atendimentos em dataSource no formato desejado
    const transformarAtendimentosParaDataSource = (atendimentos: Atendimento[]): Mes[] => {
        const mesesMap = new Map<string, Mes>();
        
        atendimentos.forEach(atendimento => {
            const mes = extrairMesDaData(atendimento.dataHoraAgendada);
            if (!mesesMap.has(mes)) {
                mesesMap.set(mes, {
                    mes: mes,
                    totalAtendimentos: 0,
                    totalRendimentos: 0,
                    clientesAtendidos: []
                });
            }
            const mesAtual = mesesMap.get(mes);
            if (mesAtual) {
                mesAtual.totalAtendimentos++;
                mesAtual.totalRendimentos += atendimento.pagamento;
                mesAtual.clientesAtendidos.push({
                    nome: atendimento.nomeCliente,
                    procedimento: atendimento.procedimento,
                    valor: atendimento.pagamento,
                    dataHoraAgendada: atendimento.dataHoraAgendada
                });
                mesesMap.set(mes, mesAtual);
            }
        });

        return Array.from(mesesMap.values());
    };

    const dataSource = transformarAtendimentosParaDataSource(atendimentos);

    return (
        <div>
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                scroll={{ x: true }}
            />
            <Modal
                title="Clientes Atendidos no Mês"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)} // Fechar o modal ao clicar em "Cancelar"
                footer={null}
            >
                <Collapse accordion>
                    {clientesDoMes.map((cliente, index) => (
                        <Panel header={cliente.nome} key={index}>
                            <p><strong>Procedimento:</strong> {cliente.procedimento}</p>
                            <p><strong>Valor:</strong> R$ {cliente.valor.toFixed(2)}</p>
                            <p><strong>Data:</strong> {moment(cliente.dataHoraAgendada).format('DD/MM/YYYY HH:mm')}</p>
                        </Panel>
                    ))}
                </Collapse>
            </Modal>
        </div>
    );
};

export default Historico;
