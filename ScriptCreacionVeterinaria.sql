-- Creación de tablas
create table if not exists Usuario(
    idUsuario serial primary key,
    email varchar(100) unique not null,
    passwordHash varchar(100) not null
);

create table if not exists Tutor(
    idTutor int primary key,
    rut varchar(20) unique,
    telefono varchar(20),
    calle varchar(100),
    numero int,
    comuna varchar(50),
    constraint fk_IdTutor
        foreign key (idTutor)
        references Usuario(idUsuario)
        on delete cascade
);

create table if not exists Sede(
    idSede serial primary key,
    nombre varchar(50),
    calle varchar(50),
    numero smallint,
    comuna varchar(50),
    telefono varchar(20)
);

create table if not exists Empleado(
    idEmpleado int primary key,
    nombreEmp varchar(50),
    apellidoEmp varchar(50),
    rut varchar(20) unique,
    telefono varchar(20),
    constraint fk_Emp
        foreign key (idEmpleado)
        references Usuario(idUsuario)
        on delete cascade
);

create table if not exists Administrador(
    idAdministrador int primary key,
    constraint fk_AdminEmpleado
        foreign key (idAdministrador)
        references Empleado(idEmpleado)
        on delete cascade
);

create table if not exists Veterinario(
    idVeterinario int primary key,
    especialidad varchar(100),
    constraint fk_idVeterinario
        foreign key (idVeterinario)
        references Empleado(idEmpleado)
        on delete cascade
);

create table if not exists Especie(
    idEspecie serial primary key,
    tipo varchar(50) unique not null
);

create table if not exists PrincipioActivo(
    idPrincipioActivo serial primary key,
    nombre varchar(100) unique not null
);

create table if not exists Vacuna(
    idVacuna serial primary key,
    nombreV varchar(100),
    totalDosis smallint,
    intervaloDias int
);

create table if not exists Medicamento(
    idMedicamento serial primary key,
    nombre varchar(50) unique not null,
    tipo varchar(50)
);

create table if not exists MedCompone(
    idPrincipioActivo int,
    idMedicamento int,
    primary key (idPrincipioActivo, idMedicamento),
    constraint fk_principioCompone
        foreign key (idPrincipioActivo)
        references PrincipioActivo(idPrincipioActivo),
    constraint fk_componeMedicamento
        foreign key (idMedicamento)
        references Medicamento(idMedicamento)
);

create table if not exists Inventario(
    sede int not null,
    idMedicamento int not null,
    cantidad int check (cantidad >= 0),
    primary key (idMedicamento, sede),
    constraint fk_MedicamentoInv
        foreign key (idMedicamento)
        references Medicamento(idMedicamento)
        on delete cascade,
    constraint fk_InvSede
        foreign key (sede)
        references Sede(idSede)
        on delete cascade
);

create table if not exists Mascota(
    idMascota serial primary key,
    nombre varchar(100),
    idTutor int not null,
    idEspecie int not null,
    anioNacimiento smallint,
    peso numeric(5,2),
    constraint fk_Tutor
        foreign key (idTutor)
        references Tutor(idTutor)
        on delete restrict,
    constraint fk_Especie
        foreign key (idEspecie)
        references Especie(idEspecie)
        on delete restrict
);

create table if not exists FichaClinica(
    idFicha serial primary key,
    idMascota int not null unique,
    fechaCreacion date not null default current_date,
    esterilizado boolean default false,
    observacionesGenerales text,
    constraint fk_mascota_ficha
        foreign key (idMascota)
        references Mascota(idMascota)
        on delete cascade
);

create table if not exists MascotaAlergia(
    idMascota int not null,
    idPrincipioActivo int not null,
    severidad varchar(20),
    fechaDeteccion date default current_date,
    primary key (idMascota, idPrincipioActivo),
    constraint fk_alergiaMascota
        foreign key (idMascota)
        references Mascota(idMascota)
        on delete cascade,
    constraint fk_alergiaPrincipio
        foreign key (idPrincipioActivo)
        references PrincipioActivo(idPrincipioActivo)
);

create table if not exists CitaMedica(
    idCita serial primary key,
    fecha timestamp not null,
    idVeterinario int not null,
    idMascota int not null,
    idSede int not null,
    estado varchar(25) not null default 'PROGRAMADA'
        check (estado in ('PROGRAMADA','REALIZADA','CANCELADA')),
        
    modalidad varchar(25) not null default 'SEDE'
        check (modalidad in ('SEDE','DOMICILIO')),
        
    direccionDomicilio varchar(200),
    duracionMin int not null default 30,
    constraint chk_domicilio
        check (modalidad = 'SEDE' or direccionDomicilio is not null),
        
    constraint fk_vetCita
        foreign key (idVeterinario)
        references Veterinario(idVeterinario),
        
    constraint fk_mascotaCita
        foreign key (idMascota)
        references Mascota(idMascota)
        on delete cascade,
        
    constraint fk_sedeCita
        foreign key (idSede)
        references Sede(idSede)
);

create table if not exists Turno(
    idTurno serial primary key,
    idVeterinario int not null,
    idSede int not null,
    diaSemana smallint not null check (diaSemana between 1 and 7),
    horaInicio time not null,
    horaTermino time not null,
    check (horaInicio < horaTermino),
    
    constraint fk_idVeterinarioTurno
        foreign key (idVeterinario)
        references Veterinario(idVeterinario),
        
    constraint fk_idSedeTurno
        foreign key (idSede)
        references Sede(idSede)
);

create table if not exists AtencionClinica(
    idAtencion serial primary key,
    idFicha int not null,
    idVeterinario int not null,
    idCita int,
    cerrada boolean not null default false,
    fecha timestamp not null default current_timestamp,
    motivoConsulta text not null,
    peso numeric(5,2),
    tratamientoGeneral text,
    constraint fk_atencionFicha
        foreign key (idFicha)
        references FichaClinica(idFicha),
        
    constraint fk_atencionVet
        foreign key (idVeterinario)
        references Veterinario(idVeterinario),
        
    constraint fk_atencionCita
        foreign key (idCita)
        references CitaMedica(idCita)
);

create table if not exists Diagnostico(
    idDiagnostico serial primary key,
    idAtencion int not null,
    nombre varchar(50),
    detalle text not null,
    constraint fk_diagnosticoAtencion
        foreign key (idAtencion)
        references AtencionClinica(idAtencion)
);

create table if not exists Receta(
    idDiagnostico int not null,
    idMedicamento int not null,
    cantidad int not null check (cantidad > 0),
    dosis smallint,
    duracionMeses smallint,
    primary key (idDiagnostico, idMedicamento),
    constraint fk_RecetaDiagnostico
        foreign key (idDiagnostico)
        references Diagnostico(idDiagnostico),
        
    constraint fk_RecetaMedicamento
        foreign key (idMedicamento)
        references Medicamento(idMedicamento)
);


create table if not exists Vacunacion(
    idMascota int not null,
    idVacuna int not null,
    numeroDosis smallint not null,
    fechaAplicacion date,
    fechaProximaDosis date,
    primary key (idMascota, idVacuna, numeroDosis),
    constraint fk_VacunacionMascota
        foreign key (idMascota)
        references Mascota(idMascota)
        on delete cascade,
    constraint fk_VacunacionVacuna
        foreign key (idVacuna)
        references Vacuna(idVacuna)
);

create table if not exists AuditoriaDiagnostico(
    idAuditoria serial primary key,
    idDiagnostico int not null,
    nombreAnterior varchar(50),
    nombreNuevo varchar(50),
    detalleAnterior text,
    detalleNuevo text,
    idUsuario int,
    fechaModificacion timestamp not null default current_timestamp,
    constraint fk_audit_diagnostico
        foreign key (idDiagnostico)
        references Diagnostico(idDiagnostico),
    constraint fk_audit_usuario
        foreign key (idUsuario)
        references Usuario(idUsuario)
);

-- Relaciones circulares Sede <-> Administrador <-> Empleado
alter table Sede
    add column if not exists idAdmin int,
    add constraint fk_adminSede
        foreign key (idAdmin)
        references Administrador(idAdministrador);

alter table Empleado
    add column if not exists idSede int,
    add constraint fk_empleadoSede
        foreign key (idSede)
        references Sede(idSede);


-- Trigger 1: Impedir que se recete un medicamento a una mascota que tenga registrada una alergia al principio activo de dicho medicamento.
create or replace function fn_validar_alergia_receta()
returns trigger as $$
declare
	v_idMascota int;
	v_conflictos int;
BEGIN
    -- Paso A: Descubrir a qué mascota pertenece la receta.
    -- Navegamos desde el idDiagnostico (que viene en la nueva receta) hacia arriba hasta llegar a la FichaClinica.
    SELECT fc.idMascota INTO v_idMascota
    FROM Diagnostico d
    JOIN AtencionClinica ac ON d.idAtencion = ac.idAtencion
    JOIN FichaClinica fc ON ac.idFicha = fc.idFicha
    WHERE d.idDiagnostico = NEW.idDiagnostico;

    -- Paso B: Verificar si el medicamento contiene algún principio activo al que la mascota sea alérgica.
    SELECT COUNT(*) INTO v_conflictos
    FROM MedCompone mc
    JOIN MascotaAlergia ma ON mc.idPrincipioActivo = ma.idPrincipioActivo
    WHERE mc.idMedicamento = NEW.idMedicamento
      AND ma.idMascota = v_idMascota;

    -- Paso C: Si hay al menos un conflicto, bloqueamos la inserción y lanzamos un error.
    IF v_conflictos > 0 THEN
        RAISE EXCEPTION 'ALERTA MÉDICA: La mascota es alérgica a un principio activo de este medicamento. Receta rechazada.';
    END IF;

    -- Si todo está bien, permitimos que la inserción continúe.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el Trigger y vincularlo a la tabla Receta
CREATE TRIGGER trg_verificar_alergias
BEFORE INSERT OR UPDATE ON Receta
FOR EACH ROW
EXECUTE FUNCTION fn_validar_alergia_receta();

-- Trigger 2: 
CREATE OR REPLACE FUNCTION fn_auditoria_diagnostico()
RETURNS TRIGGER AS $$
DECLARE
    v_atencion_cerrada BOOLEAN;
BEGIN
    -- Verificar si la atención clínica a la que pertenece el diagnóstico ya fue cerrada
    SELECT cerrada INTO v_atencion_cerrada
    FROM AtencionClinica
    WHERE idAtencion = NEW.idAtencion;

    -- Si está cerrada y hubo un cambio real en el texto del diagnóstico o detalle, se audita.
    IF v_atencion_cerrada = true AND (OLD.nombre <> NEW.nombre OR OLD.detalle <> NEW.detalle) THEN
        INSERT INTO AuditoriaDiagnostico (
            idDiagnostico, 
            nombreAnterior, 
            nombreNuevo, 
            detalleAnterior, 
            detalleNuevo, 
            idUsuario
        ) VALUES (
            NEW.idDiagnostico, 
            OLD.nombre, 
            NEW.nombre, 
            OLD.detalle, 
            NEW.detalle, 
            NULLIF(current_setting('app.id_usuario', true), '')::int
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el Trigger y vincularlo a la tabla Diagnostico
CREATE TRIGGER trg_auditar_diagnostico
AFTER UPDATE ON Diagnostico
FOR EACH ROW
EXECUTE FUNCTION fn_auditoria_diagnostico();


-- Procedimiento 1: Registrar atención clínica completa
CREATE or replace PROCEDURE prd_registrar_atencion(
	p_idMascota int,
	p_idVeterinario int,
	p_idSede int,
	p_idCita int,
	p_motivo text,
	p_peso numeric(5,2),
	p_tratamiento text,
	
	p_diagNombre varchar(50),
	p_diagDetalle text,
	
	p_medicamentos int[],
	p_cantidades int[],
	p_dosis smallint[],
	p_duraciones smallint[]
)
LANGUAGE plpgsql
AS $$
DECLARE
	v_idVeterinario int;
	v_idAtencion int;
	v_idDiagnostico int;
	v_idSede int;
	v_stockActual int;
	v_idFicha int;
	i int;
BEGIN 
	IF p_idCita IS NOT NULL THEN
        SELECT idSede, idVeterinario 
        INTO v_idSede, v_idVeterinario
        FROM CitaMedica 
        WHERE idCita = p_idCita;
    ELSE
        v_idSede := p_idSede;
        v_idVeterinario := p_idVeterinario;
    END IF;
	
	SELECT idFicha
	INTO v_idFicha
	FROM FichaClinica
	WHERE idMascota = p_idMascota;
	
	INSERT INTO AtencionClinica(idFicha, idVeterinario, idCita, motivoConsulta, peso, tratamientoGeneral)
	VALUES (v_idFicha, v_idVeterinario, p_idCita, p_motivo, p_peso, p_tratamiento)
	RETURNING idAtencion INTO v_idAtencion;
	
	INSERT INTO Diagnostico(idAtencion, nombre, detalle)
	VALUES (v_idAtencion, p_diagNombre, p_diagDetalle)
	RETURNING idDiagnostico INTO v_idDiagnostico;
	
	IF p_medicamentos IS NOT NULL AND array_length(p_medicamentos, 1) > 0 THEN
		FOR i IN 1 .. array_length(p_medicamentos, 1) LOOP
		
			-- Consultar el stock actual en la sede
            SELECT cantidad INTO v_stockActual
            FROM Inventario
            WHERE sede = v_idSede 
              AND idMedicamento = p_medicamentos[i];

            -- Validar si el medicamento no existe en el inventario de la sede
            IF v_stockActual IS NULL THEN
                RAISE EXCEPTION 'El medicamento con ID % no está registrado en el inventario de la sede %.', 
                    p_medicamentos[i], v_idSede;
            END IF;

            -- Validar si no alcanza la cantidad solicitada
            IF v_stockActual < p_cantidades[i] THEN
                RAISE EXCEPTION 'Stock insuficiente para el medicamento ID % en la sede %. Disponible: %, Solicitado: %.', 
                    p_medicamentos[i], v_idSede, v_stockActual, p_cantidades[i];
            END IF;
            
			INSERT INTO Receta (idDiagnostico, idMedicamento, cantidad, dosis, duracionMeses)
        	VALUES (
            	v_idDiagnostico, 
            	p_medicamentos[i], 
            	p_cantidades[i], 
            	p_dosis[i], 
            	p_duraciones[i]
        	);

        -- Actualizar inventario para ese medicamento específico
        	UPDATE Inventario
        	SET cantidad = cantidad - p_cantidades[i]
        	WHERE sede = v_idSede 
          	AND idMedicamento = p_medicamentos[i];
		END LOOP;
	END IF;
	
	IF p_idCita IS NOT NULL THEN
        UPDATE CitaMedica
        SET estado = 'REALIZADA'
        WHERE idCita = p_idCita;
    END IF;
END;
$$;

-- Procedimiento 2: Aplicar plan de vacunación y agendar futuras citas
CREATE OR REPLACE PROCEDURE prc_aplicar_plan_vacunacion(
    p_id_mascota INT,
    p_id_vacuna INT,
    p_id_veterinario INT,
    p_id_sede INT,
    p_fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    p_modalidad VARCHAR(25) DEFAULT 'SEDE',
    p_direccion_domicilio VARCHAR(200) DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_dosis SMALLINT;
    v_intervalo_dias INT;
    v_dosis SMALLINT;
    v_fecha_proxima DATE;
    v_fechaCitaRefuerzo TIMESTAMP;
BEGIN
    -- Obtener info de la vacuna: totalDosis e intervaloDias
    SELECT totalDosis, intervaloDias
    INTO v_total_dosis, v_intervalo_dias
    FROM Vacuna
    WHERE idVacuna = p_id_vacuna;

    IF v_total_dosis IS NULL THEN
        RAISE EXCEPTION 'La vacuna con ID % no existe.', p_id_vacuna;
    END IF;

    -- Calcular próxima cita si requiere más de una dosis
    IF v_total_dosis > 1 THEN
        v_fecha_proxima := (p_fecha_inicio::date + (v_intervalo_dias * INTERVAL '1 day'))::date;
    ELSE
        v_fecha_proxima := NULL;
    END IF;

    -- Registrar la primera dosis (numeroDosis = 1) en Vacunacion
    INSERT INTO Vacunacion (idMascota, idVacuna, numeroDosis, fechaAplicacion, fechaProximaDosis)
    VALUES (p_id_mascota, p_id_vacuna, 1, p_fecha_inicio::date, v_fecha_proxima);

    -- Generar automáticamente las citas futuras para las dosis de refuerzo (2..totalDosis)
    IF v_total_dosis > 1 THEN
        FOR v_dosis IN 2 .. v_total_dosis LOOP
            v_fechaCitaRefuerzo := p_fecha_inicio + ((v_dosis - 1) * v_intervalo_dias * INTERVAL '1 day');

            INSERT INTO CitaMedica (
                fecha, idVeterinario, idMascota, idSede,
                estado, modalidad, direccionDomicilio, duracionMin
            ) VALUES (
             v_fechaCitaRefuerzo, p_id_veterinario, p_id_mascota, p_id_sede,
             'PROGRAMADA', p_modalidad, p_direccion_domicilio, 30
            );
        END LOOP;
    END IF;
END;
$$;

-- Vista Materializada: Estadísticas de Atención por Especie y Sede
DROP MATERIALIZED VIEW IF EXISTS mv_estadisticas_atencion;

CREATE MATERIALIZED VIEW mv_estadisticas_atencion AS
SELECT es.tipo   AS especie,
       s.nombre  AS sede,
       d.nombre  AS diagnostico,
       COUNT(DISTINCT ac.idAtencion) AS cantidad_atenciones
FROM AtencionClinica ac
JOIN FichaClinica fc ON fc.idFicha = ac.idFicha
JOIN Mascota m       ON m.idMascota = fc.idMascota
JOIN Especie es      ON es.idEspecie = m.idEspecie
JOIN Empleado e      ON e.idEmpleado = ac.idVeterinario
JOIN Sede s          ON s.idSede = e.idSede
JOIN Diagnostico d   ON d.idAtencion = ac.idAtencion
WHERE ac.fecha >= current_date - INTERVAL '12 months'
GROUP BY es.tipo, s.nombre, d.nombre;

-- Función para refrescar la vista (el backend la llama una vez al día)
CREATE OR REPLACE FUNCTION fn_refrescar_estadisticas()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_estadisticas_atencion;
END;
$$ LANGUAGE plpgsql;


-- 1. Índice de búsqueda de citas por mascota
CREATE INDEX IF NOT EXISTS idx_citamedica_idmascota 
    ON CitaMedica(idMascota);

-- 2. Índice de búsqueda de cita por fecha
CREATE INDEX IF NOT EXISTS idx_citamedica_fecha 
    ON CitaMedica(fecha);

-- 3. Índice de búsqueda de vacunas vencidas / próximas a vencer
CREATE INDEX IF NOT EXISTS idx_vacunacion_fechaproximadosis 
    ON Vacunacion(fechaProximaDosis);

-- 4. Soporte para el cálculo de bloques horarios libres
CREATE INDEX IF NOT EXISTS idx_citamedica_vet_fecha_estado 
    ON CitaMedica(idVeterinario, fecha, estado);




-- SEEDERS --
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
