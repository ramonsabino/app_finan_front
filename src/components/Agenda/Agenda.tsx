import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal } from 'antd';
import { useAtendimentoContext } from '../../context/AtendimentoContext'; // Importe o contexto

const localizer = momentLocalizer(moment);

const Agenda = () => {
    const { atendimentos } = useAtendimentoContext(); // Obtenha os atendimentos do contexto
    const [modalVisible, setModalVisible] = useState(false);
    const [eventoSelecionado, setEventoSelecionado] = useState<any>(null); // Altere o tipo de evento para any ou ajuste conforme necessário

    useEffect(() => {
        // Atualize a agenda quando os atendimentos mudarem
        // Isso garante que a agenda seja atualizada automaticamente quando um novo atendimento for criado
    }, [atendimentos]);

    const handleEventoClick = (evento: any) => {
        setEventoSelecionado(evento);
        setModalVisible(true);
    };

    // Mapeia os atendimentos para os eventos do calendário
    const eventos = atendimentos.map(atendimento => {
        const start = moment(atendimento.dataHoraAgendada).add(3, "hours").toDate(); // Adicione 2 horas
        const end = moment(start).add(1.30, 'hours').toDate(); // Adicione 2 horas para o fim do evento
        return {
            title: `${atendimento.nomeCliente} - Procedimento: ${atendimento.procedimento}`,
            start: start,
            end: end,
        };
    });

    return (
        <div style={{ height: '500px' }}>
            <Calendar
                localizer={localizer}
                events={eventos}
                startAccessor="start"
                endAccessor="end"
                defaultView="week"
                onSelectEvent={handleEventoClick}
                messages={{
                    next: "Próximo",
                    previous: "Anterior",
                    today: "Hoje",
                    month: "Mês",
                    week: "Semana",
                    day: "Dia",
                    event: "Atendimento",
                    date: "Data",
                    time: "Hora"
                }}
            />

            <Modal
                title="Detalhes do Atendimento"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                {eventoSelecionado && (
                    <div>
                        <p><strong>Cliente:</strong> {eventoSelecionado.title.split(' - ')[0]}</p>
                        <p><strong>Procedimento:</strong> {eventoSelecionado.title.split(' - ')[1]}</p>
                        <p><strong>Hora do Atendimento:</strong> {moment(eventoSelecionado.start).format('HH:mm')} - {moment(eventoSelecionado.end).format('HH:mm')}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Agenda;
