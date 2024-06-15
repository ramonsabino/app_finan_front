// ClienteContext.tsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../axiosConfig';

export interface Cliente {
  _id: string;
  nome: string;
  dataCadastro: string;
}

interface ClienteContextData {
  clientes: Cliente[];
  carregarClientes: () => void;
  criarCliente: (novoCliente: Omit<Cliente, '_id'>) => Promise<void>;
}

const ClienteContext = createContext<ClienteContextData>({} as ClienteContextData);

export const ClienteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const response = await api.get<Cliente[]>('/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const criarCliente = async (novoCliente: Omit<Cliente, '_id'>) => {
    try {
      const response = await api.post<Cliente>('/clientes', novoCliente);
      setClientes([...clientes, response.data]); // Adiciona o novo cliente à lista
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error; // Você pode escolher tratar o erro ou lançá-lo para quem chamou
    }
  };

  return (
    <ClienteContext.Provider value={{ clientes, carregarClientes, criarCliente }}>
      {children}
    </ClienteContext.Provider>
  );
};

export const useClienteContext = () => useContext(ClienteContext);
