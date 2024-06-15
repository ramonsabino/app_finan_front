import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../axiosConfig';


export interface Atendimento {
    _id: string;
    nomeCliente: string;
    procedimento: string;
    dataHoraAgendada: string;
    dataHoraRegistro: string;
    formaPagamento: string;
    pagamento: number;
}

export interface Cliente {
    _id: string;
    nome: string;
    dataCadastro: string;
}

interface AtendimentoContextData {
    atendimentos: Atendimento[];
    carregarAtendimentos: () => void;
    criarNovoAtendimento: (novoAtendimento: Omit<Atendimento, '_id'>) => Promise<void>;
    numeroAtendimentosMes: () => number;
    pessoasAgendadasMes: () => number;
    pessoasAgendadaDoDia: (data: Date) => number;
    atendimentosDoDia: () => any;
    rendimentosMes: () => number;
}

const AtendimentoContext = createContext<AtendimentoContextData>({} as AtendimentoContextData);

export const AtendimentoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);

    useEffect(() => {
        carregarAtendimentos();
    }, []);

    const carregarAtendimentos = async () => {
        try {
            const response = await api.get<Atendimento[]>('/atendimentos');
            setAtendimentos(response.data);
        } catch (error) {
            console.error('Erro ao buscar atendimentos:', error);
        }
    };

    const criarNovoAtendimento = async (novoAtendimento: Omit<Atendimento, '_id'>) => {
        try {
            // Primeiro, criar o novo atendimento
            const responseAtendimento = await api.post<Atendimento>('/atendimentos', novoAtendimento);
            const atendimentoCriado = responseAtendimento.data;
    
            // Segundo, criar ou atualizar o cliente relacionado ao atendimento
            const novoCliente = {
                nome: atendimentoCriado.nomeCliente,
                dataCadastro: atendimentoCriado.dataHoraRegistro, // Utiliza a dataHora do atendimento
            };
    
            // Verificar se o cliente já existe (exemplo de verificação pela API)
            const responseClientes = await api.get<Cliente[]>(`/clientes?nome=${encodeURIComponent(atendimentoCriado.nomeCliente)}`);
            let clienteExistente = responseClientes.data.find(cliente => cliente.nome === atendimentoCriado.nomeCliente);
    
            if (!clienteExistente) {
                // Se o cliente não existe, criar um novo
                const responseNovoCliente = await api.post<Cliente>('/clientes', novoCliente);
                clienteExistente = responseNovoCliente.data;
            }
    
            // Atualizar o estado de atendimentos
            setAtendimentos([...atendimentos, atendimentoCriado]);
        } catch (error) {
            console.error('Erro ao criar novo atendimento:', error);
            throw error; // Propaga o erro para quem chamar essa função
        }
    };

    const numeroAtendimentosMes = () => {
        // Lógica para contar o número de atendimentos no mês atual
        const dataAtual = new Date();
        return atendimentos.filter(atendimento => {
            const dataAtendimento = new Date(atendimento.dataHoraAgendada);
            return dataAtendimento.getMonth() === dataAtual.getMonth() && dataAtendimento.getFullYear() === dataAtual.getFullYear();
        }).length;
    };

    const pessoasAgendadasMes = () => {
        // Lógica para contar o número de pessoas agendadas no mês atual
        const dataAtual = new Date();
        const atendimentosMesAtual = atendimentos.filter(atendimento => {
            const dataAtendimento = new Date(atendimento.dataHoraAgendada);
            return dataAtendimento.getMonth() === dataAtual.getMonth() && dataAtendimento.getFullYear() === dataAtual.getFullYear();
        });
    
        
        // Utilize um Set para contar apenas uma vez cada cliente
        const clientesUnicos = new Set<string>();
        atendimentosMesAtual.forEach(atendimento => {
            clientesUnicos.add(atendimento.nomeCliente);
        });
    
        return clientesUnicos.size;
    };

    const pessoasAgendadaDoDia = (data: Date) => {
        // Filtrar atendimentos para a data específica e contar clientes únicos
        const atendimentosDoDia = atendimentos.filter(atendimento => {
            const dataAtendimento = new Date(atendimento.dataHoraAgendada);
            return (
                dataAtendimento.getDate() === data.getDate() &&
                dataAtendimento.getMonth() === data.getMonth() &&
                dataAtendimento.getFullYear() === data.getFullYear()
            );
        });
        const clientesUnicos = new Set<string>();
        atendimentosDoDia.forEach(atendimento => {
            clientesUnicos.add(atendimento.nomeCliente);
        });

        return clientesUnicos.size;
    };

    const atendimentosDoDia = () => {
        const dataAtual = new Date();
        return atendimentos.filter(atendimento => {
          const dataAtendimento = new Date(atendimento.dataHoraAgendada);
          return (
            dataAtendimento.getDate() === dataAtual.getDate() &&
            dataAtendimento.getMonth() === dataAtual.getMonth() &&
            dataAtendimento.getFullYear() === dataAtual.getFullYear()
          );
        });
      };

    const rendimentosMes = () => {
        // Lógica para calcular os rendimentos do mês atual
        const dataAtual = new Date();
        return atendimentos.filter(atendimento => {
            const dataAtendimento = new Date(atendimento.dataHoraAgendada);
            return dataAtendimento.getMonth() === dataAtual.getMonth() && dataAtendimento.getFullYear() === dataAtual.getFullYear();
        }).reduce((total, atendimento) => {
            return total + atendimento.pagamento;
        }, 0);
    };

    return (
        <AtendimentoContext.Provider value={{ atendimentos, carregarAtendimentos, criarNovoAtendimento, numeroAtendimentosMes, pessoasAgendadasMes, rendimentosMes, pessoasAgendadaDoDia, atendimentosDoDia  }}>
            {children}
        </AtendimentoContext.Provider>
    );
};

export const useAtendimentoContext = () => useContext(AtendimentoContext);

// Função auxiliar para extrair o mês da data
export const extrairMesDaData = (data: string): string => {
    const date = new Date(data);
    const month = date.toLocaleString('default', { month: 'long' });
    return month.charAt(0).toUpperCase() + month.slice(1); // Primeira letra em maiúsculo
};