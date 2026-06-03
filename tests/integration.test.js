// Mock LocalStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) {
            return store[key] || null;
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        removeItem: function(key) {
            delete store[key];
        },
        clear: function() {
            store = {};
        }
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// --- LÓGICA DE INTEGRACIÓN DE SALUDYA ---

// Simulación de Registro (registro.html)
function registerUser(name, email, password, role, specialty = '') {
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('users')) || [];
    } catch (e) {}

    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return { success: false, error: 'El usuario ya existe' };

    const newUser = { name, email, password, role, specialty, img: '' };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Si es doctor, también se registra en la lista de médicos disponibles
    if (role === 'doctor') {
        let doctors = [];
        try {
            doctors = JSON.parse(localStorage.getItem('doctors')) || [];
        } catch (e) {}
        doctors.push({
            id: 'doc-' + Date.now(),
            name: name,
            specialty: specialty,
            status: 'Disponible',
            img: ''
        });
        localStorage.setItem('doctors', JSON.stringify(doctors));
    }

    return { success: true, user: newUser };
}

// Simulación de Login (login.html)
function loginUser(email, password) {
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('users')) || [];
    } catch (e) {}

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
    }
    return { success: false, error: 'Credenciales inválidas' };
}

// Simulación de Reservar Cita (agendar_cita.html)
function bookAppointment(patientEmail, patientName, doctorName, specialty, date, time) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.email !== patientEmail) {
        return { success: false, error: 'Usuario no autenticado' };
    }

    let appointments = [];
    try {
        appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    } catch (e) {}

    const newApp = {
        id: 'app-' + Date.now(),
        patientName,
        patientEmail,
        doctorName,
        specialty,
        date,
        time,
        status: 'Confirmada',
        room: 'Consultorio virtual'
    };
    appointments.push(newApp);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    return { success: true, appointment: newApp };
}

// Simulación de Actualización de Perfil (perfil_medico.html)
function updateProfile(newName, newSpecialty = '', base64Img = '') {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return { success: false, error: 'Sin sesión' };

    const oldName = currentUser.name;

    currentUser.name = newName;
    if (newSpecialty) currentUser.specialty = newSpecialty;
    if (base64Img) currentUser.img = base64Img;

    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Actualizar en lista de usuarios
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const uIdx = users.findIndex(u => u.email === currentUser.email);
    if (uIdx !== -1) {
        users[uIdx].name = newName;
        if (newSpecialty) users[uIdx].specialty = newSpecialty;
        if (base64Img) users[uIdx].img = base64Img;
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Actualizar en lista de doctores si aplica
    if (currentUser.role === 'doctor') {
        let doctors = JSON.parse(localStorage.getItem('doctors')) || [];
        const dIdx = doctors.findIndex(d => d.name === oldName);
        if (dIdx !== -1) {
            doctors[dIdx].name = newName;
            if (base64Img) doctors[dIdx].img = base64Img;
            localStorage.setItem('doctors', JSON.stringify(doctors));
        }
    }

    return { success: true, user: currentUser };
}


// --- INTEGRATION TESTS ---
describe('Pruebas de Integración de SaludYa', () => {

    beforeEach(() => {
        localStorage.clear();
    });

    // FLUJO 1: Registro de Paciente -> Login -> Creación de Sesión Activa
    test('Flujo 1: Debe registrar un nuevo paciente, iniciar sesión con éxito y guardar la sesión activa', () => {
        // 1. Registro
        const regRes = registerUser('Carlos Perez', 'carlos@example.com', 'securepass123', 'patient');
        expect(regRes.success).toBe(true);

        // Verificar persistencia en base de datos local
        const storedUsers = JSON.parse(localStorage.getItem('users'));
        expect(storedUsers.length).toBe(1);
        expect(storedUsers[0].name).toBe('Carlos Perez');

        // 2. Login fallido
        const loginFail = loginUser('carlos@example.com', 'wrongpassword');
        expect(loginFail.success).toBe(false);
        expect(localStorage.getItem('currentUser')).toBeNull();

        // 3. Login exitoso
        const loginSuccess = loginUser('carlos@example.com', 'securepass123');
        expect(loginSuccess.success).toBe(true);
        expect(JSON.parse(localStorage.getItem('currentUser')).name).toBe('Carlos Perez');
    });

    // FLUJO 2: Paciente Logueado -> Agendar Cita -> Visibilidad en el Panel del Administrador
    test('Flujo 2: Cita agendada por el paciente debe aparecer correctamente en la lista del Administrador', () => {
        // 1. Setup usuario logueado
        registerUser('Ana Gomez', 'ana@example.com', 'password123', 'patient');
        loginUser('ana@example.com', 'password123');

        // 2. Agendar Cita
        const bookRes = bookAppointment(
            'ana@example.com', 
            'Ana Gomez', 
            'Dr. Juan Carlos Montoya', 
            'Cardiología', 
            '2026-10-15', 
            '10:30 AM'
        );
        expect(bookRes.success).toBe(true);

        // 3. Simulación de carga en Panel Administrativo
        const storedApps = JSON.parse(localStorage.getItem('appointments')) || [];
        expect(storedApps.length).toBe(1);
        expect(storedApps[0].patientName).toBe('Ana Gomez');
        expect(storedApps[0].doctorName).toBe('Dr. Juan Carlos Montoya');
        expect(storedApps[0].specialty).toBe('Cardiología');
        expect(storedApps[0].status).toBe('Confirmada');
    });

    // FLUJO 3: Registro de Médico -> Carga de Perfil -> Personalización de Foto e Impacto en Lista de Médicos
    test('Flujo 3: La edición de perfil del médico (nombre y foto) debe reflejarse en la lista global de doctores', () => {
        // 1. Registrar y loguear médico
        registerUser('Dr. William Alape', 'william@saludya.com', 'docpassword123', 'doctor', 'Cardiología');
        loginUser('william@saludya.com', 'docpassword123');

        // Verificar registro automático en lista de doctores
        const initialDocs = JSON.parse(localStorage.getItem('doctors'));
        expect(initialDocs.some(d => d.name === 'Dr. William Alape')).toBe(true);

        // 2. Editar perfil (nombre y avatar)
        const updateRes = updateProfile('Dr. William Alape Modificado', 'Cardiología', 'data:image/png;base64,mockbinaryavatar');
        expect(updateRes.success).toBe(true);

        // 3. Verificar impacto en lista de doctores disponibles
        const updatedDocs = JSON.parse(localStorage.getItem('doctors'));
        const matchedDoc = updatedDocs.find(d => d.img === 'data:image/png;base64,mockbinaryavatar');
        expect(matchedDoc).toBeDefined();
        expect(matchedDoc.name).toBe('Dr. William Alape Modificado');
    });
});
