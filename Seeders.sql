-- =====================================================================
-- Usuarios de prueba (contraseñas encriptadas con bcrypt):
--   ADMIN  admin@veterinaria.cl     / Admin123
--   ADMIN  admin2@veterinaria.cl    / Admin123
--   VET    cperez@veterinaria.cl    / Vet123
--   VET    dsoto@veterinaria.cl     / Vet123
--   VET    mrojas@veterinaria.cl    / Vet123
--   TUTOR  ana.munoz@correo.cl      / Tutor123
--   TUTOR  jorge.diaz@correo.cl     / Tutor123
--   TUTOR  camila.reyes@correo.cl   / Tutor123
--
-- Turno.diaSemana usa 1 = lunes ... 7 = domingo
-- (igual que EXTRACT(ISODOW FROM fecha) en PostgreSQL).
-- =====================================================================

BEGIN;

-- Limpiar datos anteriores
TRUNCATE Usuario, Sede, Especie, PrincipioActivo, Vacuna, Medicamento
    RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------
-- Usuarios
-- ---------------------------------------------------------------------
INSERT INTO Usuario (idUsuario, email, passwordHash) VALUES
    (1, 'admin@veterinaria.cl',   '$2b$10$FO2Z9.rb.pBLIsO1DPU.8eP0P6YfnB9B.CAXl9iCsEoBuk4snnQxK'),
    (2, 'admin2@veterinaria.cl',  '$2b$10$FO2Z9.rb.pBLIsO1DPU.8eP0P6YfnB9B.CAXl9iCsEoBuk4snnQxK'),
    (3, 'cperez@veterinaria.cl',  '$2b$10$svfUeIUDRLP7oXY5YWvRQOh1Hig7VeNrvLVMtI8L7Jn5X.M4TOGXe'),
    (4, 'dsoto@veterinaria.cl',   '$2b$10$svfUeIUDRLP7oXY5YWvRQOh1Hig7VeNrvLVMtI8L7Jn5X.M4TOGXe'),
    (5, 'mrojas@veterinaria.cl',  '$2b$10$svfUeIUDRLP7oXY5YWvRQOh1Hig7VeNrvLVMtI8L7Jn5X.M4TOGXe'),
    (6, 'ana.munoz@correo.cl',    '$2b$10$Qa27wve8P8Gob5KryfTbheh6PCwFfehIE1zaEJll1XhLMHnBzPf3i'),
    (7, 'jorge.diaz@correo.cl',   '$2b$10$Qa27wve8P8Gob5KryfTbheh6PCwFfehIE1zaEJll1XhLMHnBzPf3i'),
    (8, 'camila.reyes@correo.cl', '$2b$10$Qa27wve8P8Gob5KryfTbheh6PCwFfehIE1zaEJll1XhLMHnBzPf3i');

-- ---------------------------------------------------------------------
-- Sedes (idAdmin se asigna al final por la relación circular)
-- ---------------------------------------------------------------------
INSERT INTO Sede (idSede, nombre, calle, numero, comuna, telefono) VALUES
    (1, 'Sede Providencia', 'Av. Providencia', 1550, 'Providencia', '+56222334455'),
    (2, 'Sede Maipú',       'Av. Pajaritos',   3020, 'Maipú',       '+56226677889');

-- ---------------------------------------------------------------------
-- Empleados, administradores y veterinarios
-- ---------------------------------------------------------------------
INSERT INTO Empleado (idEmpleado, nombreEmp, apellidoEmp, rut, telefono, idSede) VALUES
    (1, 'Patricia', 'González', '12.345.678-5', '+56911111111', 1),
    (2, 'Rodrigo',  'Fuentes',  '13.456.789-2', '+56922222222', 2),
    (3, 'Carolina', 'Pérez',    '15.678.901-3', '+56933333333', 1),
    (4, 'Diego',    'Soto',     '16.789.012-4', '+56944444444', 2),
    (5, 'Martina',  'Rojas',    '17.890.123-5', '+56955555555', 1);

INSERT INTO Administrador (idAdministrador) VALUES (1), (2);

INSERT INTO Veterinario (idVeterinario, especialidad) VALUES
    (3, 'Medicina general'),
    (4, 'Dermatología'),
    (5, 'Cirugía');

UPDATE Sede SET idAdmin = 1 WHERE idSede = 1;
UPDATE Sede SET idAdmin = 2 WHERE idSede = 2;

-- ---------------------------------------------------------------------
-- Tutores
-- ---------------------------------------------------------------------
INSERT INTO Tutor (idTutor, rut, telefono, calle, numero, comuna) VALUES
    (6, '18.111.222-3', '+56966666666', 'Los Leones',     450, 'Providencia'),
    (7, '19.222.333-4', '+56977777777', 'Av. 5 de Abril', 1200, 'Maipú'),
    (8, '20.333.444-5', '+56988888888', 'Irarrázaval',    3300, 'Ñuñoa');

-- ---------------------------------------------------------------------
-- Catálogos
-- ---------------------------------------------------------------------
INSERT INTO Especie (idEspecie, tipo) VALUES
    (1, 'Perro'), (2, 'Gato'), (3, 'Conejo'), (4, 'Hámster');

INSERT INTO PrincipioActivo (idPrincipioActivo, nombre) VALUES
    (1, 'Amoxicilina'),
    (2, 'Ácido clavulánico'),
    (3, 'Meloxicam'),
    (4, 'Ivermectina'),
    (5, 'Prednisolona'),
    (6, 'Metronidazol'),
    (7, 'Tramadol');

INSERT INTO Medicamento (idMedicamento, nombre, tipo) VALUES
    (1, 'Clavamox 250 mg',       'Antibiótico'),
    (2, 'Metacam 1.5 mg/ml',     'Antiinflamatorio'),
    (3, 'Ivomec 1%',             'Antiparasitario'),
    (4, 'Prednisolona 5 mg',     'Corticoide'),
    (5, 'Metronidazol 250 mg',   'Antibiótico'),
    (6, 'Tramadol 50 mg',        'Analgésico');

INSERT INTO MedCompone (idPrincipioActivo, idMedicamento) VALUES
    (1, 1), (2, 1),   -- Clavamox = amoxicilina + ácido clavulánico
    (3, 2),
    (4, 3),
    (5, 4),
    (6, 5),
    (7, 6);

INSERT INTO Inventario (sede, idMedicamento, cantidad) VALUES
    (1, 1, 40), (1, 2, 25), (1, 3, 15), (1, 4, 30), (1, 5, 20), (1, 6, 10),
    (2, 1, 35), (2, 2, 18), (2, 3, 12), (2, 4, 22), (2, 5, 5),  (2, 6, 0);

INSERT INTO Vacuna (idVacuna, nombreV, totalDosis, intervaloDias) VALUES
    (1, 'Óctuple canina',         3, 21),
    (2, 'Antirrábica',            1, 365),
    (3, 'Triple felina',          2, 21),
    (4, 'Leucemia felina',        2, 21),
    (5, 'Tos de las perreras',    1, 365);

-- ---------------------------------------------------------------------
-- Mascotas, fichas clínicas y alergias
-- ---------------------------------------------------------------------
INSERT INTO Mascota (idMascota, nombre, idTutor, idEspecie, anioNacimiento, peso) VALUES
    (1, 'Firulais', 6, 1, 2019, 18.50),
    (2, 'Michi',    6, 2, 2021,  4.20),
    (3, 'Rocky',    7, 1, 2017, 32.00),
    (4, 'Luna',     7, 2, 2022,  3.80),
    (5, 'Copito',   8, 3, 2023,  1.90),
    (6, 'Toby',     8, 1, 2024,  6.30);

INSERT INTO FichaClinica (idFicha, idMascota, fechaCreacion, esterilizado, observacionesGenerales) VALUES
    (1, 1, current_date - 700, true,  'Perro activo, dieta balanceada.'),
    (2, 2, current_date - 500, true,  'Gata de interior.'),
    (3, 3, current_date - 900, false, 'Antecedentes de displasia de cadera.'),
    (4, 4, current_date - 300, true,  NULL),
    (5, 5, current_date - 200, false, 'Requiere manejo cuidadoso por estrés.'),
    (6, 6, current_date - 60,  false, 'Cachorro, plan de vacunas en curso.');

INSERT INTO MascotaAlergia (idMascota, idPrincipioActivo, severidad, fechaDeteccion) VALUES
    (1, 1, 'Alta',     current_date - 400),  -- Firulais: amoxicilina
    (2, 3, 'Moderada', current_date - 250),  -- Michi: meloxicam
    (3, 7, 'Leve',     current_date - 600);  -- Rocky: tramadol

-- ---------------------------------------------------------------------
-- Turnos (1 = lunes ... 7 = domingo)
-- ---------------------------------------------------------------------
INSERT INTO Turno (idVeterinario, idSede, diaSemana, horaInicio, horaTermino) VALUES
    (3, 1, 1, '09:00', '13:00'), (3, 1, 2, '09:00', '13:00'), (3, 1, 3, '09:00', '13:00'),
    (3, 1, 4, '09:00', '13:00'), (3, 1, 5, '09:00', '13:00'), (3, 1, 6, '10:00', '14:00'),
    (4, 2, 1, '14:00', '19:00'), (4, 2, 2, '14:00', '19:00'), (4, 2, 3, '14:00', '19:00'),
    (4, 2, 4, '14:00', '19:00'), (4, 2, 5, '14:00', '19:00'),
    (5, 1, 1, '14:00', '18:00'), (5, 1, 3, '14:00', '18:00'), (5, 1, 5, '14:00', '18:00'),
    (5, 1, 7, '10:00', '13:00');

-- ---------------------------------------------------------------------
-- Citas médicas (fechas relativas a hoy para que siempre sirvan)
-- ---------------------------------------------------------------------
INSERT INTO CitaMedica (idCita, fecha, idVeterinario, idMascota, idSede, estado, modalidad, direccionDomicilio, duracionMin) VALUES
    -- Pasadas (asociadas a atenciones)
    (1,  current_date - 300 + time '10:00', 3, 1, 1, 'REALIZADA',  'SEDE',      NULL, 30),
    (2,  current_date - 200 + time '15:00', 4, 3, 2, 'REALIZADA',  'SEDE',      NULL, 30),
    (3,  current_date - 120 + time '11:00', 3, 2, 1, 'REALIZADA',  'SEDE',      NULL, 30),
    (4,  current_date - 45  + time '16:00', 4, 4, 2, 'REALIZADA',  'DOMICILIO', 'Av. 5 de Abril 1200, Maipú', 45),
    (5,  current_date - 20  + time '14:30', 5, 5, 1, 'REALIZADA',  'SEDE',      NULL, 60),
    (6,  current_date - 10  + time '09:30', 3, 6, 1, 'CANCELADA',  'SEDE',      NULL, 30),
    -- Futuras (sirven para probar la agenda y los bloques libres)
    (7,  current_date + 1 + time '09:00', 3, 1, 1, 'PROGRAMADA', 'SEDE',      NULL, 30),
    (8,  current_date + 1 + time '10:30', 3, 6, 1, 'PROGRAMADA', 'SEDE',      NULL, 30),
    (9,  current_date + 2 + time '15:00', 4, 3, 2, 'PROGRAMADA', 'SEDE',      NULL, 30),
    (10, current_date + 3 + time '14:00', 5, 2, 1, 'PROGRAMADA', 'SEDE',      NULL, 60),
    (11, current_date + 5 + time '16:00', 4, 4, 2, 'PROGRAMADA', 'DOMICILIO', 'Av. 5 de Abril 1200, Maipú', 45),
    (12, current_date + 7 + time '11:00', 3, 5, 1, 'CANCELADA',  'SEDE',      NULL, 30);

-- ---------------------------------------------------------------------
-- Atenciones clínicas, diagnósticos y recetas
-- (las recetas respetan las alergias, si no el trigger 1 las rechaza)
-- ---------------------------------------------------------------------
INSERT INTO AtencionClinica (idAtencion, idFicha, idVeterinario, idCita, cerrada, fecha, motivoConsulta, peso, tratamientoGeneral) VALUES
    (1, 1, 3, 1,    true,  current_date - 300 + time '10:00', 'Cojera en pata trasera derecha', 18.20, 'Reposo y antiinflamatorio'),
    (2, 3, 4, 2,    true,  current_date - 200 + time '15:00', 'Picazón y caída de pelo',        31.50, 'Antiparasitario y control en 3 semanas'),
    (3, 2, 3, 3,    true,  current_date - 120 + time '11:00', 'Vómitos y decaimiento',           4.10, 'Dieta blanda y antibiótico'),
    (4, 4, 4, 4,    true,  current_date - 45  + time '16:00', 'Dermatitis en el cuello',         3.80, 'Corticoide por 5 días'),
    (5, 5, 5, 5,    false, current_date - 20  + time '14:30', 'Control post cirugía dental',     1.90, 'Analgésico y control'),
    (6, 1, 3, NULL, false, current_date - 5   + time '12:00', 'Diarrea',                        18.50, 'Hidratación y antibiótico');

INSERT INTO Diagnostico (idDiagnostico, idAtencion, nombre, detalle) VALUES
    (1, 1, 'Esguince',              'Esguince leve de rodilla, sin fractura en radiografía.'),
    (2, 2, 'Sarna sarcóptica',      'Lesiones costrosas en orejas y codos.'),
    (3, 3, 'Gastroenteritis',       'Gastroenteritis aguda de origen alimentario.'),
    (4, 4, 'Dermatitis alérgica',   'Dermatitis por contacto, zona del collar.'),
    (5, 5, 'Post operatorio',       'Evolución favorable tras extracción dental.'),
    (6, 6, 'Gastroenteritis',       'Diarrea sin sangre, buen estado general.');

INSERT INTO Receta (idDiagnostico, idMedicamento, cantidad, dosis, duracionMeses) VALUES
    (1, 2, 1, 1, 1),   -- Firulais: Metacam (no es alérgico a meloxicam)
    (2, 3, 1, 1, 1),   -- Rocky: Ivomec
    (3, 1, 1, 2, 1),   -- Michi: Clavamox (es alérgica a meloxicam, no a amoxicilina)
    (4, 4, 1, 1, 1),   -- Luna: Prednisolona
    (5, 6, 1, 1, 1),   -- Copito: Tramadol
    (6, 5, 2, 2, 1);   -- Firulais: Metronidazol (es alérgico a amoxicilina)

-- Edición de un diagnóstico de una atención cerrada:
-- el trigger 2 la registra automáticamente en AuditoriaDiagnostico.
UPDATE Diagnostico
SET detalle = 'Esguince leve de rodilla derecha, sin fractura. Control en 2 semanas.'
WHERE idDiagnostico = 1;

-- ---------------------------------------------------------------------
-- Vacunaciones (mezcla de vencidas, por vencer en 30 días y al día)
-- ---------------------------------------------------------------------
INSERT INTO Vacunacion (idMascota, idVacuna, numeroDosis, fechaAplicacion, fechaProximaDosis) VALUES
    (1, 2, 1, current_date - 380, current_date - 15),   -- vencida
    (1, 5, 1, current_date - 350, current_date + 15),   -- por vencer
    (2, 3, 1, current_date - 60,  current_date - 39),   -- vencida
    (2, 3, 2, current_date - 39,  NULL),
    (3, 2, 1, current_date - 340, current_date + 25),   -- por vencer
    (4, 4, 1, current_date - 15,  current_date + 6),    -- por vencer
    (5, 2, 1, current_date - 100, current_date + 265),  -- al día
    (6, 1, 1, current_date - 35,  current_date - 14),   -- vencida
    (6, 1, 2, current_date - 14,  current_date + 7);    -- por vencer

-- ---------------------------------------------------------------------
-- Ajustar los contadores (serial) después de insertar con ID fijos
-- ---------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('usuario', 'idusuario'),                 (SELECT MAX(idUsuario) FROM Usuario));
SELECT setval(pg_get_serial_sequence('sede', 'idsede'),                       (SELECT MAX(idSede) FROM Sede));
SELECT setval(pg_get_serial_sequence('especie', 'idespecie'),                 (SELECT MAX(idEspecie) FROM Especie));
SELECT setval(pg_get_serial_sequence('principioactivo', 'idprincipioactivo'), (SELECT MAX(idPrincipioActivo) FROM PrincipioActivo));
SELECT setval(pg_get_serial_sequence('vacuna', 'idvacuna'),                   (SELECT MAX(idVacuna) FROM Vacuna));
SELECT setval(pg_get_serial_sequence('medicamento', 'idmedicamento'),         (SELECT MAX(idMedicamento) FROM Medicamento));
SELECT setval(pg_get_serial_sequence('mascota', 'idmascota'),                 (SELECT MAX(idMascota) FROM Mascota));
SELECT setval(pg_get_serial_sequence('fichaclinica', 'idficha'),              (SELECT MAX(idFicha) FROM FichaClinica));
SELECT setval(pg_get_serial_sequence('citamedica', 'idcita'),                 (SELECT MAX(idCita) FROM CitaMedica));
SELECT setval(pg_get_serial_sequence('atencionclinica', 'idatencion'),        (SELECT MAX(idAtencion) FROM AtencionClinica));
SELECT setval(pg_get_serial_sequence('diagnostico', 'iddiagnostico'),         (SELECT MAX(idDiagnostico) FROM Diagnostico));

COMMIT;

-- Refrescar la vista materializada con los datos nuevos
SELECT fn_refrescar_estadisticas();
