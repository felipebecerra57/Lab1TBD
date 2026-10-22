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
            detalleNuevo
            -- idUsuario se podría pasar desde el backend si implementamos variables de sesión en Postgres, 
            -- por ahora lo dejaremos nulo para que la DB se encargue solo del historial del cambio.
        ) VALUES (
            NEW.idDiagnostico, 
            OLD.nombre, 
            NEW.nombre, 
            OLD.detalle, 
            NEW.detalle
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