# Sistema de Gestión Veterinaria - Laboratorio 1 Taller de Base de Datos

Aplicación web para administrar una red de clínicas veterinarias: sedes, personal, tutores y mascotas, fichas clínicas, diagnósticos y recetas, planes de vacunación y estadísticas de atencion.
La logica vive en la base de datos, el backend expone un API REST protegida con JWT y control de acceso por rol y el frontend en Vue consume esa API.

## Integrantes

Felipe Becerra
María Belén Gajardo
Maitané O.Hostens
Catalina Parra
Matías Rojas

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
 
El script `ScriptCreacionVeterinaria.sql` crea todo (tablas, triggers, procedimientos, vista, índices) **y carga los datos de prueba**. Debe ejecutarse **una sola vez sobre una base de datos vacía**.
 
**Opción A: pgAdmin**
1. Conectarse al servidor (clic en *Servers → PostgreSQL*, contraseña del usuario `postgres`).
2. Clic derecho en *Databases → Create → Database…*, nombre `veterinaria`, *Save*.
3. Seleccionar `veterinaria` y abrir *Tools → Query Tool*. Arriba debe decir `veterinaria/postgres@…`.
4. Abrir `ScriptCreacionVeterinaria.sql` con el ícono de carpeta y ejecutar todo con **F5**.
5. Debe terminar con `Query returned successfully`. Los avisos `truncate cascades to table …` y `materialized view … does not exist, skipping` son normales.
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
JWT_SECRET=una_clave_larga_y_secreta
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

## Endpoints
 
URL base: `http://localhost:3000/api`


### Ejemplos
 
Las respuestas se obtuvieron ejecutando la API con los datos de prueba del script. En las listas largas se muestran solo los primeros elementos.
 
#### Iniciar sesión

#### Registrar un tutor

#### Crear un veterinario

 
#### Crear una sede


#### Registrar una mascota (como tutor)


#### Vacunas vencidas o por vencer


#### Aplicar un plan de vacunación


#### Registrar una atención completa


#### Receta rechazada por alergia (trigger)
#### Editar un diagnóstico (auditoría)

#### Estadísticas de atención

#### Crear una vacuna
