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

// 1. Lógica de Validación de Registro (registro.html)
function validateRegistration(password, confirmPassword) {
    if (password.length < 8) {
        return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
    }
    if (password !== confirmPassword) {
        return { valid: false, error: 'Las contraseñas no coinciden.' };
    }
    return { valid: true };
}

// 2. Lógica de Autenticación de Login (login.html)
function authenticateUser(users, email, password) {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (foundUser) {
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        return foundUser;
    }
    return null;
}

// 3. Lógica de Filtrado de Médicos por Especialidad y Nombre (disponibilidad_citas.html)
function filterDoctors(doctorsList, specialty, query) {
    const normalizedQuery = query.toLowerCase().trim();
    return doctorsList.filter(doc => {
        const matchesSpec = specialty === 'all' || doc.specialty === specialty;
        const matchesName = doc.name.toLowerCase().includes(normalizedQuery) || doc.specialty.toLowerCase().includes(normalizedQuery);
        const isAvailable = doc.status === "Disponible";
        return matchesSpec && matchesName && isAvailable;
    });
}

// 4. Lógica de Actualización de Estado de Citas (perfil_medico.html)
function updateAppStatus(appointmentsList, appointmentId, newStatus) {
    const updatedList = appointmentsList.map(app => {
        if (app.id === appointmentId) {
            return { ...app, status: newStatus };
        }
        return app;
    });
    localStorage.setItem('appointments', JSON.stringify(updatedList));
    return updatedList;
}

// 5. Lógica de Adición de Testimonios (muro_experiencias.html)
function addNewStory(storiesList, newStory) {
    const updatedStories = [newStory, ...storiesList];
    localStorage.setItem('stories', JSON.stringify(updatedStories));
    return updatedStories;
}

// --- PRUEBAS UNITARIAS ---
describe('Pruebas Unitarias de SaludYa', () => {
    
    beforeEach(() => {
        localStorage.clear();
    });

    // PRUEBA 1: Validación de Registro
    test('1. Debe validar correctamente la longitud de la contraseña y coincidencia en el registro', () => {
        // Contraseña muy corta
        const res1 = validateRegistration('123', '123');
        expect(res1.valid).toBe(false);
        expect(res1.error).toContain('8 caracteres');

        // Contraseñas no coinciden
        const res2 = validateRegistration('password123', 'different123');
        expect(res2.valid).toBe(false);
        expect(res2.error).toContain('no coinciden');

        // Registro válido
        const res3 = validateRegistration('securepassword123', 'securepassword123');
        expect(res3.valid).toBe(true);
    });

    // PRUEBA 2: Autenticación de Login
    test('2. Debe autenticar correctamente al usuario y guardar la sesión en localStorage', () => {
        const mockUsers = [
            { name: 'Admin User', email: 'admin@saludya.com', password: 'password123', role: 'admin' },
            { name: 'Dr. Montoya', email: 'doc@saludya.com', password: 'securepassword', role: 'doctor' }
        ];

        // Intento fallido
        const authFail = authenticateUser(mockUsers, 'admin@saludya.com', 'wrongpassword');
        expect(authFail).toBeNull();
        expect(localStorage.getItem('currentUser')).toBeNull();

        // Intento exitoso
        const authSuccess = authenticateUser(mockUsers, 'admin@saludya.com', 'password123');
        expect(authSuccess).not.toBeNull();
        expect(authSuccess.name).toBe('Admin User');
        expect(JSON.parse(localStorage.getItem('currentUser')).name).toBe('Admin User');
    });

    // PRUEBA 3: Filtrado de Médicos
    test('3. Debe filtrar médicos disponibles por especialidad y por query de búsqueda', () => {
        const mockDoctors = [
            { name: "Dr. Juan Carlos Montoya", specialty: "Cardiología", status: "Disponible" },
            { name: "Dra. Beatriz Elena Henao", specialty: "Cardiología", status: "Disponible" },
            { name: "Dra. Liliana Patricia Restrepo", specialty: "Dermatología", status: "Ocupado" },
            { name: "Dr. Andrés Felipe Ospina", specialty: "Pediatría", status: "No disponible" }
        ];

        // Filtrar por especialidad Cardiología
        const res1 = filterDoctors(mockDoctors, 'Cardiología', '');
        expect(res1.length).toBe(2);

        // Filtrar por query de nombre
        const res2 = filterDoctors(mockDoctors, 'all', 'Beatriz');
        expect(res2.length).toBe(1);
        expect(res2[0].name).toContain('Beatriz');

        // No debe retornar médicos no disponibles
        const res3 = filterDoctors(mockDoctors, 'Pediatría', '');
        expect(res3.length).toBe(0);
    });

    // PRUEBA 4: Actualización de Estado de Citas
    test('4. Debe actualizar el estado de una cita y guardarla en localStorage', () => {
        const mockAppointments = [
            { id: 'app-1', patientName: 'Juliana', doctorName: 'Dr. Sarah Jenkins', status: 'Confirmada' },
            { id: 'app-2', patientName: 'Juan', doctorName: 'Dr. Francisco', status: 'Llegó' }
        ];

        const updated = updateAppStatus(mockAppointments, 'app-1', 'Completada');
        expect(updated.find(a => a.id === 'app-1').status).toBe('Completada');
        
        const stored = JSON.parse(localStorage.getItem('appointments'));
        expect(stored.find(a => a.id === 'app-1').status).toBe('Completada');
    });

    // PRUEBA 5: Adición de Testimonios
    test('5. Debe anteponer un nuevo testimonio y persistir la lista en localStorage', () => {
        const mockStories = [
            { id: 'story-1', name: 'Ana M.', content: 'Excelente atención.' }
        ];
        const newStory = { id: 'story-2', name: 'Carlos T.', content: 'Muy recomendado.' };

        const updated = addNewStory(mockStories, newStory);
        expect(updated.length).toBe(2);
        expect(updated[0].name).toBe('Carlos T.'); // Prepend check

        const stored = JSON.parse(localStorage.getItem('stories'));
        expect(stored[0].name).toBe('Carlos T.');
    });
});
