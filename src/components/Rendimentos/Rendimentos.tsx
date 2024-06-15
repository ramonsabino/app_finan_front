import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import { Card, Button, Modal, Form, Input, Select, Radio } from "antd";
import './styles.css'
const { Option } = Select;

interface EntradaValor {
  mes: string;
  tipo: string;
  valor: number;
  descricao?: string;
  pagamento: number;
  categoria: string; // Incluímos o campo categoria aqui
}

interface NovaEntrada {
  categoria: string;
  descricao: string;
  pagamento: number;
  tipo: string;
  data: string;
  mes: string;
}

const Rendimentos = () => {
  const [modalAddVisible, setModalAddVisible] = useState(false);
  const [modalDetalhesVisible, setModalDetalhesVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{
    [key: string]: EntradaValor[];
  }>({});
  const [categoria, setCategoria] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");
  const [pagamento, setPagamento] = useState<number | undefined>(undefined);
  const [tipo, setTipo] = useState<string>("Entrada");
  const [entradasValores, setEntradasValores] = useState<EntradaValor[]>([]);

  useEffect(() => {
    const fetchRendimentos = async () => {
      try {
        const response = await axios.get("/rendimentos");
        const rendimentos = response.data;

        const aggregatedData: { [key: string]: EntradaValor } = {};

        rendimentos.forEach(
          (item: {
            pagamento: number;
            mes: string;
            tipo: string;
            descricao?: string;
            categoria: string;
          }) => {
            const key = `${item.mes}-${item.tipo}`;
            if (!aggregatedData[key]) {
              aggregatedData[key] = {
                mes: item.mes,
                tipo: item.tipo,
                valor: 0,
                descricao: item.descricao,
                pagamento: item.pagamento,
                categoria: item.categoria,
              };
            }
            aggregatedData[key].valor += item.pagamento;
          }
        );

        setEntradasValores(Object.values(aggregatedData));
      } catch (error) {
        console.error("Erro ao buscar rendimentos:", error);
      }
    };

    fetchRendimentos();
  }, []);

  const handleAddEntrada = () => {
    setModalAddVisible(true);
  };

  const handleVerDetalhes = async (mes: string, tipo: string) => {
    await fetchDetalhes(mes, tipo);
    setModalDetalhesVisible(true);
  };

  const fetchDetalhes = async (mes: string, tipo: string) => {
    try {
      const response = await axios.get("/rendimentos", {
        params: { mes, tipo }, // Filtrando apenas os rendimentos do tipo 'Saida'
      });
      const detalhes = response.data.filter(
        (item: EntradaValor) => item.tipo === "Saida"
      );

      // Adicionar ou atualizar modalContent para manter múltiplas entradas de saída por mes-tipo
      setModalContent((prevState) => ({
        ...prevState,
        [`${mes}-${tipo}`]: detalhes,
      }));
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error);
    }
  };

  const handleCancel = () => {
    setModalAddVisible(false);
    setModalDetalhesVisible(false);
    setCategoria("");
    setDescricao("");
    setPagamento(undefined);
    setTipo("Entrada");
  };

  const handleCategoriaChange = (value: string) => {
    setCategoria(value);
  };

  const handleTipoChange = (e: any) => {
    setTipo(e.target.value);
  };

  const handleSubmit = async () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString("default", {
      month: "long",
    });

    const newEntrada: NovaEntrada = {
      categoria,
      descricao,
      pagamento: pagamento || 0,
      tipo,
      data: currentDate.toISOString(),
      mes: currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1),
    };

    try {
      await axios.post("/rendimentos", newEntrada);

      // Atualizar modalContent para manter múltiplas entradas de saída por mes-tipo
      if (newEntrada.tipo === "Saida") {
        const detalhes =
          modalContent[`${newEntrada.mes}-${newEntrada.tipo}`] || [];
        detalhes.push({
          mes: newEntrada.mes,
          tipo: newEntrada.tipo,
          valor: newEntrada.pagamento,
          descricao: newEntrada.descricao,
          pagamento: newEntrada.pagamento,
          categoria: newEntrada.categoria,
        });
        setModalContent((prevState) => ({
          ...prevState,
          [`${newEntrada.mes}-${newEntrada.tipo}`]: detalhes,
        }));
      }

      // Atualizar entradasValores para refletir a mudança
      const updatedEntradas = [...entradasValores];
      const existingEntryIndex = updatedEntradas.findIndex(
        (entrada) =>
          entrada.mes === newEntrada.mes && entrada.tipo === newEntrada.tipo
      );

      if (existingEntryIndex > -1) {
        updatedEntradas[existingEntryIndex].valor += newEntrada.pagamento;
        if (newEntrada.tipo === "Saida") {
          updatedEntradas[existingEntryIndex].descricao = newEntrada.descricao;
        }
      } else {
        updatedEntradas.push({
          mes: newEntrada.mes,
          tipo: newEntrada.tipo,
          valor: newEntrada.pagamento,
          descricao:
            newEntrada.tipo === "Saida" ? newEntrada.descricao : undefined,
          pagamento: newEntrada.pagamento,
          categoria: newEntrada.categoria,
        });
      }

      setEntradasValores(updatedEntradas);
      handleCancel();
    } catch (error) {
      console.error("Erro ao adicionar rendimento:", error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button type="primary" onClick={handleAddEntrada} className="btn-rend">
          Adicionar Entrada de Valor
        </Button>
      </div>
      {entradasValores.map((entrada, index) => (
        <Card
          key={index}
          title={`${entrada.mes} - ${entrada.tipo}`}
          style={{
            marginBottom: 16,
            backgroundColor: entrada.tipo === "Saida" ? "#ff0303" : "#03ff70",
          }}
          extra={
            entrada.tipo === "Saida" && (
              <Button
                onClick={() => handleVerDetalhes(entrada.mes, entrada.tipo)}
              >
                Ver Detalhes
              </Button>
            )
          }
        >
          <p>
            <strong>Mês:</strong> {entrada.mes}
          </p>
          <p>
            <strong>Tipo:</strong> {entrada.tipo}
          </p>
          <p>
            <strong>Valor:</strong> R$ {entrada.valor}
          </p>
        </Card>
      ))}
      <Modal
        title="Detalhes das Saidas"
        visible={modalDetalhesVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="ok" type="primary" onClick={handleCancel}>
            Fechar
          </Button>,
        ]}
      >
        {Object.keys(modalContent).map((key, index) =>
          modalContent[key].map((entrada, subIndex) => (
            <Card
              key={subIndex}
              title={`${entrada.mes} - ${entrada.tipo}`}
              style={{
                marginBottom: 16,
                backgroundColor:
                  entrada.tipo === "Saida" ? "#FFCCCC" : "inherit",
              }}
            >
              <p>
                <strong>Mês:</strong> {entrada.mes}
              </p>
              <p>
                <strong>Tipo:</strong> {entrada.tipo}
              </p>
              <p>
                <strong>Categoria:</strong> {entrada.categoria}
              </p>
              <p>
                <strong>Valor:</strong> R$ {entrada.pagamento.toFixed(2)}
              </p>{" "}
              {/* Mostrar o valor do pagamento */}
              {entrada.descricao && (
                <p>
                  <strong>Descrição:</strong> {entrada.descricao}
                </p>
              )}
            </Card>
          ))
        )}
      </Modal>
      <Modal
        title="Adicionar Entrada de Valor"
        visible={modalAddVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
      >
        <Form layout="vertical">
          <Form.Item label="Categoria" required>
            <Select value={categoria} onChange={handleCategoriaChange}>
              <Option value="Reposição de Material">
                Reposição de Material
              </Option>
              <Option value="Gastos com Salão">Gastos com Salão</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Descrição" required>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Pagamento" required>
            <Input
              type="number"
              value={pagamento}
              onChange={(e) => setPagamento(parseFloat(e.target.value))}
              style={{
                borderColor:
                  pagamento !== undefined && pagamento < 0
                    ? "#ff0000"
                    : undefined,
              }}
            />
          </Form.Item>
          <Form.Item label="Tipo" required>
            <Radio.Group value={tipo} onChange={handleTipoChange}>
              <Radio value="Entrada">Entrada</Radio>
              <Radio value="Saida">Saida</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Rendimentos;
