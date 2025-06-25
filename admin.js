// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    const appointmentsList = document.getElementById('appointments-list');
    const statusFilter = document.getElementById('status-filter');

    const getAppointments = () => {
        try {
            const appointmentsJSON = localStorage.getItem('lavaJatoAgendamentos');
            return appointmentsJSON ? JSON.parse(appointmentsJSON) : [];
        } catch (error) {
            console.error("Erro ao ler dados do localStorage: ", error);
            localStorage.removeItem('lavaJatoAgendamentos');
            return [];
        }
    };

    const saveAppointments = (appointments) => {
        localStorage.setItem('lavaJatoAgendamentos', JSON.stringify(appointments));
    };
    
    const renderAppointments = () => {
        appointmentsList.innerHTML = '';
        let appointments = getAppointments();
        const filterValue = statusFilter.value;

        if (filterValue !== 'all') {
            appointments = appointments.filter(app => app.status === filterValue);
        }

        appointments.sort((a, b) => new Date(b.slotId) - new Date(a.slotId));

        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<p>Nenhum agendamento encontrado para este filtro.</p>';
            return;
        }

        appointments.forEach(app => {
            const [dateStr, time] = app.slotId.split('T');
            const dateObj = new Date(dateStr + 'T00:00:00Z');
            const formattedDate = dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

            const card = document.createElement('div');
            card.className = `appointment-card status-${app.status}`;
            
            card.innerHTML = `
                <h4>${app.serviceType} - ${formattedDate} às ${time}</h4>
                <p><strong>Cliente:</strong> ${app.clientName}</p>
                <p><strong>Telefone:</strong> ${app.clientPhone}</p>
                <p><strong>Carro:</strong> ${app.carModel}</p>
                <p><strong>Status:</strong> <span class="status-text">${app.status === 'booked' ? 'Agendado' : 'Concluído'}</span></p>
                <div class="card-actions">
                    <button class="conclude-btn" data-id="${app.uniqueId}" ${app.status === 'concluded' ? 'disabled' : ''}>
                        <i class="fas fa-check"></i> Concluir Serviço
                    </button>
                    <button class="cancel-btn" data-id="${app.uniqueId}">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            `;
            
            appointmentsList.appendChild(card);
        });
        
        document.querySelectorAll('.conclude-btn').forEach(button => {
            button.addEventListener('click', concludeService);
        });
        document.querySelectorAll('.cancel-btn').forEach(button => {
            button.addEventListener('click', cancelService);
        });
    };

    const concludeService = (e) => {
        const uniqueId = e.target.dataset.id;
        const appointments = getAppointments();
        const appIndex = appointments.findIndex(app => app.uniqueId === uniqueId);

        if (appIndex > -1) {
            appointments[appIndex].status = 'concluded';
            saveAppointments(appointments);
            renderAppointments();
        }
    };

    const cancelService = (e) => {
        const uniqueId = e.target.dataset.id;
        if (confirm('Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.')) {
            let appointments = getAppointments();
            appointments = appointments.filter(app => app.uniqueId !== uniqueId);
            saveAppointments(appointments);
            renderAppointments();
        }
    };
    
    statusFilter.addEventListener('change', renderAppointments);
    
    renderAppointments();
});