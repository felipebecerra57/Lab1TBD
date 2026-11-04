# Sistema de Gestión Veterinaria - Laboratorio 1 Taller de Base de Datos

Aplicación web para administrar una red de clínicas veterinarias: sedes, personal, tutores y mascotas, fichas clínicas, diagnósticos y recetas, planes de vacunación y estadísticas de atencion.
La logica vive en la base de datos, el backend expone un API REST protegida con JWT y control de acceso por rol y el frontend en Vue consume esa API.

## Integrantes

- Felipe Becerra
- María Belén Gajardo
- Maitané O.Hostens
- Catalina Parra
- Matías Rojas

## Arquitectura

El sistema tiene tres partes que se comunican en cadena:

1. **Frontend** (Vue 3, en http://localhost:5173): son las pantallas que usa la persona, cuando necesita datos le hace una petición HTTP al backend y envía el token de sesión en el header Authorization: Bearer <token>.
2. **Backend** (Node.js con Express, en http://localhost:3000/api): recibe la petición, revisa que el token sea válido y que el rol tenga permiso, consulta la base de datos y responde en formato JSON.
3. **Base de datos** (PostgreSQL): guarda la información y ejecuta la lógica crítica del negocio mediante triggers, procedimientos almacenados y una vista materializada.

La respuesta hace el camino inverso: la base de datos le entrega los resultados al backend, y el backend se los devuelve al frontend para mostrarlos en pantalla.

**Backend: arquitectura por capas.**

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Rutas | `backend/src/routes/` | Define la URL y qué roles pueden usarla (`verificarToken`, `verificarRol`). |
| Controladores | `backend/src/controllers/` | Recibe la petición, valida los datos y arma la respuesta HTTP. |
| Repositorios | `backend/src/repositories/` | Ejecuta las consultas SQL con `pg`. |

- backend/src/middlewares/authMiddleware.js: valida el JWT y el rol.
- backend/src/jobs/refrescarEstadisticas.js: tarea programada que refresca la vista de estadísticas todos los días a las 03:00 hora de Chile.
- backend/src/config/db.js: pool de conexiones a PostgreSQL, leído desde .env.

**Frontend.** `services/api.js` crea una instancia de axios que agrega el token a cada petición, `router/index.js` define las pantallas y redirige al login si no hay sesión.

## Tecnologias

**Base de datos**
- PostgreSQL (probado con las versiones 16 y 18)
**Backend**
- Node.js 22.18 o superior (o 24.12 o superior)
- Express 5
- pg 8, cliente de PostgreSQL
- jsonwebtoken 9, para los tokens JWT
- bcryptjs 3, para el hash de contraseñas
- node-cron 4, para las tareas programadas
- dotenv y cors
- nodemon 3, en desarrollo
**Frontend**
- Vue 3.5
- Vue Router 5
- Vite 8
- axios 1
- jwt-decode 4
---

## Requisitos previos a la instalación

- **Node.js** 22.18 o superior, con npm. Comprobar con `node -v`.
- **PostgreSQL** instalado y en ejecución, y saber la contraseña del usuario `postgres`.
- **pgAdmin 4** (viene con el instalador de PostgreSQL) o la terminal `psql`.
- **Git**.

---

## Instalación paso a paso
 
### 1. Clonar el repositorio
 
```bash
git clone https://github.com/felipebecerra57/Lab1TBD.git
cd Lab1TBD
```
 
### 2. Crear la base de datos
 
El script `ScriptCreacionVeterinaria.sql` crea todo (tablas, triggers, procedimientos, vista, índices) y carga los datos de prueba. Debe ejecutarse una sola vez sobre una base de datos vacía.
 
**Opción A: pgAdmin**
1. Conectarse al servidor (clic en *Servers → PostgreSQL*, contraseña del usuario `postgres`).
2. Clic derecho en *Databases → Create → Database…*, nombre `veterinaria`, *Save*.
3. Seleccionar `veterinaria` y abrir *Tools → Query Tool*. Arriba debe decir `veterinaria/postgres@…`.
4. Abrir `ScriptCreacionVeterinaria.sql` con el ícono de carpeta y ejecutar todo con **F5**.
5. Debe terminar con `Query returned successfully`.
**Opción B: terminal**
```bash
createdb -U postgres veterinaria
psql -U postgres -d veterinaria -f ScriptCreacionVeterinaria.sql
```
 
Para empezar de nuevo, se borra la base (`DROP DATABASE veterinaria;`), se crea vacía y se vuelve a ejecutar el script.
 
### 3. Configurar las variables de entorno del backend
 
Copiar `backend/.env.example` como `backend/.env` (en la carpeta `backend`, al lado de `package.json`) y completar los valores:
 
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=la_contraseña_de_tu_postgres
DB_NAME=veterinaria
JWT_SECRET=una_clave_ultralarga
PORT=3000
```
 
En Windows se puede copiar con `copy backend\.env.example backend\.env`. El archivo `.env` no se sube al repositorio (está en `.gitignore`).
 
### 4. Levantar el backend
 
```bash
cd backend
npm install
npm run dev
```
 
Debe aparecer `Servidor de Veterinaria corriendo en http://localhost:3000`. Para comprobar la conexión con la base: abrir `http://localhost:3000/api/ping` en el navegador, que debe responder `"Conexión exitosa a PostgreSQL"`.
 
### 5. Levantar el frontend
 
En **otra terminal** (el backend debe seguir corriendo):
 
```bash
cd frontend
npm install
npm run dev
```
 
Vite muestra la dirección, normalmente `http://localhost:5173`. Abrir `http://localhost:5173/login` e iniciar sesión con alguno de los usuarios de prueba.
 

---

## Usuarios de prueba
 
Los crea el propio script. Las contraseñas están guardadas con bcrypt.
 
| Rol | Correo | Contraseña |
|---|---|---|
| ADMIN | `admin@veterinaria.cl` | `Admin123` |
| ADMIN | `admin2@veterinaria.cl` | `Admin123` |
| VET | `cperez@veterinaria.cl` | `Vet123` |
| VET | `dsoto@veterinaria.cl` | `Vet123` |
| VET | `mrojas@veterinaria.cl` | `Vet123` |
| TUTOR | `ana.munoz@correo.cl` | `Tutor123` |
| TUTOR | `jorge.diaz@correo.cl` | `Tutor123` |
| TUTOR | `camila.reyes@correo.cl` | `Tutor123` |

---

## Endpoints
 
URL base: `http://localhost:3000/api`


### Ejemplos
 
Las respuestas se obtuvieron ejecutando la API con los datos de prueba del script. En las listas largas se muestran solo los primeros elementos.
 
#### Iniciar sesión
`POST /api/auth/login`
```json
{ "email": "admin@veterinaria.cl", "password": "Admin123" }
```
Respuesta `200`:
```json
{
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "rol": "ADMIN"
}
```

#### Registrar un tutor
`POST /api/auth/register`
```json
{ "email": "pedro@correo.cl", "password": "Pedro123", "rut": "21.444.555-6", "telefono": "+56999999999" }
```
Respuesta `201`:
```json
{ "mensaje": "Tutor registrado exitosamente", "idUsuario": 9 }
```

#### Crear un veterinario
`POST /api/usuarios/veterinario` · ADMIN
```json
{
  "email": "lvera@veterinaria.cl",
  "password": "Vet123",
  "nombreEmp": "Laura",
  "apellidoEmp": "Vera",
  "rut": "18.999.000-1",
  "telefono": "+56912121212",
  "especialidad": "Cardiología"
}
```
Respuesta `201`:
```json
{ "mensaje": "Veterinario registrado exitosamente", "idUsuario": 10 }
```
 
#### Crear una sede
`POST /api/sedes` · ADMIN
```json
{ "nombre": "Sede Ñuñoa", "calle": "Irarrázaval", "numero": 2100, "comuna": "Ñuñoa", "telefono": "+56223334444", "idAdmin": 1 }
```
Respuesta `201`:
```json
{ "idSede": 3, "nombre": "Sede Ñuñoa", "calle": "Irarrázaval", "numero": 2100, "comuna": "Ñuñoa", "telefono": "+56223334444", "idAdmin": 1 }
```

#### Registrar una mascota siendo tutor
`POST /api/mascotas` · TUTOR (el `idTutor` se toma del token; un ADMIN debe enviarlo en el body)
```json
{ "nombre": "Pelusa", "idEspecie": 2, "anioNacimiento": 2024, "peso": 3.1 }
```
Respuesta `201`:
```json
{ "idMascota": 7, "nombre": "Pelusa", "idTutor": 6, "idEspecie": 2, "especie": "Gato", "anioNacimiento": 2024, "peso": "3.10" }
```

#### Vacunas vencidas o por vencer
`GET /api/mascotas/vacunas-pendientes` · respuesta `200` (extracto):
```json
[
  {
    "idMascota": 1, "mascota": "Firulais", "especie": "Perro",
    "idTutor": 6, "emailTutor": "ana.munoz@correo.cl", "telefonoTutor": "+56966666666",
    "idVacuna": 2, "vacuna": "Antirrábica", "ultimaDosis": 1, "totalDosis": 1,
    "fechaUltimaDosis": "2025-10-19", "fechaProximaDosis": "2026-10-19",
    "diasRestantes": -15, "estado": "VENCIDA"
  },
  {
    "idMascota": 1, "mascota": "Firulais", "especie": "Perro",
    "idVacuna": 5, "vacuna": "Tos de las perreras",
    "fechaProximaDosis": "2026-11-18", "diasRestantes": 15, "estado": "POR_VENCER"
  }
]
```

#### Registrar una atención completa
`POST /api/atenciones` · VET (usa el procedimiento `prd_registrar_atencion`; el veterinario se toma del token)
```json
{
  "idMascota": 2,
  "idSede": 1,
  "motivoConsulta": "Control anual",
  "peso": 4.3,
  "tratamientoGeneral": "Sin tratamiento",
  "diagnostico": { "nombre": "Sano", "detalle": "Sin hallazgos" },
  "medicamentos": [
    { "idMedicamento": 5, "cantidad": 1, "dosis": 1, "duracionMeses": 1 }
  ]
}
```
En vez de `idSede` se puede enviar `idCita`; en ese caso la cita queda como `REALIZADA`.

Respuesta `201`:
```json
{
  "idAtencion": 7, "idFicha": 2, "idMascota": 2, "idVeterinario": 3, "idCita": null,
  "cerrada": false, "fecha": "2026-11-04T01:00:22.129Z",
  "motivoConsulta": "Control anual", "peso": "4.30", "tratamientoGeneral": "Sin tratamiento",
  "diagnosticos": [
    {
      "idDiagnostico": 7, "nombre": "Sano", "detalle": "Sin hallazgos",
      "recetas": [
        { "idDiagnostico": 7, "idMedicamento": 5, "medicamento": "Metronidazol 250 mg", "cantidad": 1, "dosis": 1, "duracionMeses": 1 }
      ]
    }
  ]
}
```

#### Receta rechazada por alergia (trigger)
`POST /api/recetas` · VET. Firulais es alérgico a la amoxicilina y el medicamento 1 la contiene.
```json
{ "idDiagnostico": 1, "idMedicamento": 1, "cantidad": 1, "dosis": 2, "duracionMeses": 1 }
```
Respuesta `400`:
```json
{ "error": "ALERTA MÉDICA: La mascota es alérgica a un principio activo de este medicamento. Receta rechazada." }
```

#### Editar un diagnóstico (auditoría)
`PUT /api/diagnosticos/1` · VET. La atención 1 está cerrada, así que el cambio queda registrado en `AuditoriaDiagnostico`.
```json
{ "nombre": "Esguince", "detalle": "Esguince de rodilla derecha, grado 1." }
```
Respuesta `200`:
```json
{ "idDiagnostico": 1, "idAtencion": 1, "nombre": "Esguince", "detalle": "Esguince de rodilla derecha, grado 1." }
```

#### Estadísticas de atención
`GET /api/reportes/estadisticas` · ADMIN · respuesta `200` (extracto):
```json
[
  { "especie": "Conejo", "sede": "Sede Providencia", "diagnostico": "Post operatorio", "cantidad_atenciones": 1 },
  { "especie": "Gato", "sede": "Sede Maipú", "diagnostico": "Dermatitis alérgica", "cantidad_atenciones": 1 },
  { "especie": "Perro", "sede": "Sede Providencia", "diagnostico": "Esguince", "cantidad_atenciones": 1 }
]
```
Con un usuario que no es ADMIN, la respuesta es `403` 

#### Crear una vacuna
#### Crear una vacuna
`POST /api/vacunas` · ADMIN (`intervaloDias` es obligatorio si `totalDosis` es mayor que 1)
```json
{ "nombreV": "Giardia", "totalDosis": 2, "intervaloDias": 21 }
```
Respuesta `201`:
```json
{ "idVacuna": 6, "nombreV": "Giardia", "totalDosis": 2, "intervaloDias": 21 }
```
