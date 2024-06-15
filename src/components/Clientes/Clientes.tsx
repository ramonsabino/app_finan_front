import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input } from 'antd';
import { useAtendimentoContext, Atendimento, Cliente as ClienteType } from '../../context/AtendimentoContext'; // Importe o contexto e tipos necessários
import moment from 'moment';
import './styles.css'

interface Cliente extends ClienteType {
  vezesAtendido: number;
  historico?: Atendimento[]; // Adiciona o campo de histórico ao Cliente
}

const Clientes: React.FC = () => {
  const { atendimentos } = useAtendimentoContext(); // Use o contexto de atendimento
  const [modalAdicionarClienteVisible, setModalAdicionarClienteVisible] = useState(false);
  const [modalHistoricoVisible, setModalHistoricoVisible] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    // Função para calcular quantas vezes cada cliente foi atendido
    const calcularVezesAtendido = (nomeCliente: string): number => {
      return atendimentos.filter(atendimento => atendimento.nomeCliente === nomeCliente).length;
    };

    // Monta a lista de clientes com base nos atendimentos recebidos
    const listaClientes = atendimentos.reduce<Cliente[]>((acc, atendimento) => {
      const existingClientIndex = acc.findIndex(cliente => cliente.nome === atendimento.nomeCliente);
      if (existingClientIndex !== -1) {
        // Cliente já existe na lista, atualiza a contagem de vezes atendido
        acc[existingClientIndex].vezesAtendido++;
      } else {
        // Cliente não existe na lista, adiciona à lista
        acc.push({
          _id: atendimento._id,
          nome: atendimento.nomeCliente,
          dataCadastro: '', // Você pode definir como desejar, depende da estrutura do seu backend
          vezesAtendido: 1, // Primeiro atendimento
        });
      }
      return acc;
    }, []);

    setClientes(listaClientes);
  }, [atendimentos]); // Atualiza sempre que os atendimentos mudarem

  const handleAddCliente = () => {
    setModalAdicionarClienteVisible(true);
  };

  const handleCancelAddCliente = () => {
    setModalAdicionarClienteVisible(false);
    setNovoClienteNome('');
  };

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNovoClienteNome(e.target.value);
  };

  const handleSubmitAddCliente = () => {
    console.log('Novo cliente:', novoClienteNome);
    setModalAdicionarClienteVisible(false);
    setNovoClienteNome('');
  };

  const handleHistorico = (cliente: Cliente) => {
    // Encontra o histórico do cliente usando o contexto de atendimento
    const historicoCliente = atendimentos.filter(atendimento => atendimento.nomeCliente === cliente.nome);
    setClienteSelecionado({ ...cliente, historico: historicoCliente });
    setModalHistoricoVisible(true);
  };

  const handleCancelHistorico = () => {
    setModalHistoricoVisible(false);
  };

  return (
    <div>
      <div style={{ textAlign: 'right', marginBottom: 16 }}>
        <Button type="primary" onClick={handleAddCliente} className='btn-clientes'>Adicionar Cliente</Button>
      </div>
      {clientes.map((cliente, index) => (
        <Card key={index} title={cliente.nome} style={{ marginBottom: 16 }}>
          <p>Vezes Atendido: {cliente.vezesAtendido}</p>
          <Button type="primary" onClick={() => handleHistorico(cliente)} className='btn-historico'>Histórico</Button>
        </Card>
      ))}
      <Modal
        title="Adicionar Cliente"
        visible={modalAdicionarClienteVisible}
        onCancel={handleCancelAddCliente}
        onOk={handleSubmitAddCliente}
      >
        <Form>
          <Form.Item label="Nome do Cliente">
            <Input value={novoClienteNome} onChange={handleNomeChange} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Histórico do Cliente"
        visible={modalHistoricoVisible}
        onCancel={handleCancelHistorico}
        footer={[
          <Button key="back" onClick={handleCancelHistorico}>
            Fechar
          </Button>,
        ]}
      >
        {clienteSelecionado && (
          <div>
            <p><strong>Nome do Cliente:</strong> {clienteSelecionado.nome}</p>
            <p><strong>Vezes Atendido:</strong> {clienteSelecionado.vezesAtendido}</p>
            {clienteSelecionado.historico && (
              <div>
                <p><strong>Histórico de Atendimentos:</strong></p>
                <ul>
                  {clienteSelecionado.historico.map(atendimento => (
                    <li key={atendimento._id}>
                      <p><strong>Procedimento Feito:</strong> {atendimento.procedimento}</p>
                      <p><strong>Data do Atendimento:</strong> {moment(atendimento.dataHoraAgendada).format('DD/MM/YYYY HH:mm')}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Clientes;
