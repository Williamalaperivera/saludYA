# SaludYa

**SaludYa** es una aplicación web estática de gestión de salud que permite a pacientes y profesionales médicos registrar, iniciar sesión, reservar citas, y consultar disponibilidad de médicos. Todo el proyecto está construido con HTML, Tailwind CSS y JavaScript puro, sin frameworks pesados, lo que lo hace fácil de desplegar y mantener.

---

## ✨ Características principales

- **Autenticación simple** mediante `localStorage` (registro y login).
- **Roles**: paciente, médico y administrador, con interfaces adaptativas.
- **Reserva de citas** con selección de médico, especialidad y horario.
- **Disponibilidad de médicos** filtrable por especialidad y nombre.
- **Panel administrativo** para visualizar todas las citas.
- **Muro de experiencias** donde los usuarios pueden compartir testimonios.
- **Favicon personalizado** (🩺) y diseño premium con Tailwind CSS.
- **Pruebas unitarias y de integración** con Jest (5 pruebas unitarias + 3 flujos de integración).
- **Despliegue en GitHub Pages** configurado mediante `gh-pages`.

---

## 📦 Instalación y puesta en marcha

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Williamalaperivera/saludYA.git
   cd saludYA
   ```
2. **Instalar dependencias** (solo `jest` y `gh-pages`)
   ```bash
   npm install
   ```
3. **Abrir la aplicación**
   - Como el proyecto es estático, basta con abrir `index.html` en el navegador:
     ```bash
     start index.html   # Windows
     # o simplemente doble‑clic en el archivo
     ```
   - Si prefieres usar un servidor local rápido:
     ```bash
     npx serve .   # instala serve temporalmente y sirve el directorio
     ```

---

## 🧪 Ejecutar pruebas

Se incluyen pruebas unitarias e integrales para validar la lógica de registro, login, filtrado de médicos, reserva de citas y actualización de perfil.

```bash
npm test
```

Todas las pruebas pasan:
```
PASS tests/saludya.test.js
PASS tests/integration.test.js
Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
```

---

## 🚀 Despliegue en GitHub Pages

El proyecto está configurado para publicar la carpeta raíz en GitHub Pages mediante el script `gh-pages`.

1. **Construir la página (opcional)** – no hay compilación, los archivos estáticos están listos.
2. **Publicar**
   ```bash
   npm run deploy   # se ejecutará "gh-pages -d ."
   ```
   El comando empuja los archivos al branch `gh-pages` y GitHub los sirve bajo `https://<usuario>.github.io/saludYA/`.

---

## 📂 Estructura del proyecto

```
📦saludYA
 ┣ 📂tests               # pruebas unitarias e integrales (Jest)
 ┣ 📜index.html          # página principal (renombrada de inicio.html)
 ┣ 📜login.html          # formulario de inicio de sesión
 ┣ 📜registro.html       # formulario de registro
 ┣ 📜disponibilidad_citas.html  # lista de médicos y disponibilidad
 ┣ 📜agendar_cita.html   # formulario de reserva de cita
 ┣ 📜perfil_medico.html  # perfil del médico / usuario
 ┣ 📜panel_administrativo.html  # panel de administración
 ┣ 📜muro_experiencias.html    # muro de testimonios
 ┣ 📜package.json        # dependencias (jest, gh-pages) y scripts
 ┗ 📜README.md           # <--- este archivo
```

---

## 🎨 Diseño y estilo

- **Tailwind CSS** con plugins `forms` y `container-queries`.
- Paleta de colores y tipografía basada en la guía Material Design.
- Dark mode automática basada en la preferencia del sistema.
- Iconos SVG incrustados como favicon y símbolos de Google Fonts.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor abre un *issue* o envía un *pull request* siguiendo estos pasos:

1. Fork del repositorio.
2. Crea una rama para tu feature/bugfix:
   ```bash
   git checkout -b nombre-de-la-rama
   ```
3. Realiza tus cambios y asegúrate de que las pruebas siguen pasando.
4. Abre un *pull request* descrito claramente.

---

## 📧 Contacto

Desarrollador: **William Alaperivera**
GitHub: <https://github.com/Williamalaperivera>

---

*¡Gracias por visitar SaludYa! Esperamos que te ayude a organizar tu salud de manera fácil y segura.*
