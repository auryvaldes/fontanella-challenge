-- =========================================================================
-- ESQUEMA DE BASE DE DATOS Y SEED DATA MULTI-ZONAL
-- =========================================================================

-- Limpieza para repetición rápida de Demos locales.
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS lawyers CASCADE;

CREATE TABLE lawyers (
    id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    especialidad    VARCHAR(100),
    zona_horaria    VARCHAR(50) DEFAULT 'UTC' NOT NULL
);

CREATE TABLE clients (
    id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE availability_slots (
    id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lawyer_id       INT NOT NULL,
    dia_semana      INT NOT NULL,
    hora_inicio     TIMESTAMP WITH TIME ZONE NOT NULL,
    hora_fin        TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_avail_lawyer FOREIGN KEY (lawyer_id) REFERENCES lawyers (id) ON DELETE CASCADE,
    CONSTRAINT chk_dia_semana CHECK (dia_semana BETWEEN 1 AND 7),
    CONSTRAINT chk_rango_horas CHECK (hora_inicio < hora_fin)
);

CREATE TABLE appointments (
    id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lawyer_id       INT NOT NULL,
    client_id       INT NOT NULL,
    start_time      TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time        TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo            VARCHAR(20) NOT NULL,
    estado          VARCHAR(20) DEFAULT 'SCHEDULED' NOT NULL,
    CONSTRAINT fk_appt_lawyer FOREIGN KEY (lawyer_id) REFERENCES lawyers (id),
    CONSTRAINT fk_appt_client FOREIGN KEY (client_id) REFERENCES clients (id),
    CONSTRAINT chk_appt_tipo CHECK (tipo IN ('PRESENTIAL', 'VIDEO', 'PHONE')),
    CONSTRAINT chk_appt_estado CHECK (estado IN ('SCHEDULED', 'COMPLETED', 'CANCELED')),
    CONSTRAINT chk_appt_fechas CHECK (start_time < end_time)
);

CREATE INDEX idx_avail_lawyer ON availability_slots (lawyer_id);
CREATE INDEX idx_appt_lawyer ON appointments (lawyer_id);
CREATE INDEX idx_appt_client ON appointments (client_id);
CREATE INDEX idx_appt_agenda_search ON appointments (lawyer_id, start_time, estado);

-- =========================================================================
-- DATOS SEMILLA (DUMMY DATA) PARA EL DEMO
-- =========================================================================

-- 1. MÚLTIPLES ABOGADOS (Zonas Horarias Diversas para probar robustez de la API)
INSERT INTO lawyers (nombre, especialidad, zona_horaria) VALUES 
('Dr. Roberto Fontanella', 'Derecho Penal Corporativo', 'America/Argentina/Buenos_Aires'),
('Dra. Laura Gómez', 'Derecho Comercial', 'Europe/Madrid'),
('Dr. Alan Turing', 'Propiedad Intelectual', 'America/New_York');

-- 2. CLIENTES DE EJEMPLO
INSERT INTO clients (nombre, email) VALUES 
('Usuario Invitado (Portal)', 'guest@client.com'),
('Tech StartUp SL', 'ceo@startup.com');

-- 3. MATRIZ DE DISPONIBILIDAD ABSOLUTA (Franjas horarias libres base)
-- (Usamos la fecha dummy '1970-01-01' como estándar de "Horario base del día")
INSERT INTO availability_slots (lawyer_id, dia_semana, hora_inicio, hora_fin) VALUES 
-- Abogado 1 (Fontanella - Argentina) - Disponible Martes (Dia 2) y Miércoles (Dia 3)
(1, 2, '1970-01-01T14:00:00.000Z', '1970-01-01T15:00:00.000Z'),
(1, 2, '1970-01-01T15:00:00.000Z', '1970-01-01T16:00:00.000Z'),
(1, 3, '1970-01-01T10:00:00.000Z', '1970-01-01T11:00:00.000Z'),

-- Abogada 2 (Laura - España) - Disponible Jueves (Dia 4) y Viernes (Dia 5) - Horarios Europeos
(2, 4, '1970-01-01T09:00:00.000Z', '1970-01-01T10:00:00.000Z'),
(2, 4, '1970-01-01T10:00:00.000Z', '1970-01-01T11:00:00.000Z'),
(2, 5, '1970-01-01T11:00:00.000Z', '1970-01-01T12:00:00.000Z'),

-- Abogado 3 (Alan - USA) - Disponible Lunes (Dia 1)
(3, 1, '1970-01-01T14:00:00.000Z', '1970-01-01T15:00:00.000Z');

-- 4. SIMULAR UNA CITA YA OCUPADA PREVIAMENTE (Ejemplo 21 de Abril)
-- Fontanella tiene libre a las 15:00 el Martes 21-Abril-2026, pero la Dra. Laura tiene ocupado su Jueves.
INSERT INTO appointments (lawyer_id, client_id, start_time, end_time, tipo, estado) VALUES
(2, 2, '2026-04-23T10:00:00.000Z', '2026-04-23T11:00:00.000Z', 'PRESENTIAL', 'SCHEDULED');
