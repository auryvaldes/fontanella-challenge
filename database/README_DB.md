# Base de Datos - Fontanella-Challenge (PostgreSQL)

Este directorio contiene los scripts de inicialización, configuración y los datos de prueba (seed data) para la base de datos PostgreSQL del proyecto Fontanella-Challenge.

## Requisitos Previos
- Una instancia de **PostgreSQL 10+** (o superior), ya que se utiliza la característica `IDENTITY COLUMNS`.
- Credenciales de acceso (usuario y contraseña) a una base de datos donde tengas permisos de creación de tablas e índices (`CREATE TABLE`, `CREATE INDEX`).

## Cómo ejecutar el script de inicialización

### Usando psql (Línea de comandos)
1. Abre tu terminal o símbolo del sistema.
2. Ejecuta el script apuntando a tu base de datos con el siguiente comando:
   ```bash
   psql -U tu_usuario -d nombre_base_datos -f database/init_schema.sql
   ```
   *Te pedirá la contraseña del usuario especificado.*
3. Verifica en pantalla que todas las tablas e índices se crearon con éxito, y que los datos iniciales fueron insertados.

### Usando pgAdmin / DBeaver (Recomendado para entorno gráfico)
1. Abre **pgAdmin** o tu gestor de base de datos preferido (como DBeaver).
2. Conéctate a tu base de datos y abre una herramienta de consultas (Query Tool).
3. Carga el contenido del archivo `init_schema.sql` (puedes arrastrar el archivo o usar `File > Open`).
4. Ejecuta el script (usualmente F5 o el botón "Play").
5. En la salida de mensajes (Messages), deberías ver la confirmación de las tablas creadas y las filas insertadas.

## Estructura del Script (`init_schema.sql`)
1. **Limpieza inicial**: Usa `DROP TABLE IF EXISTS ... CASCADE` para borrar el esquema anterior y permitir pruebas o despliegues rápidos.
2. **Creación de Tablas**: Se crean las tablas `lawyers`, `clients`, `availability_slots` y `appointments`.
3. **Índices**: Se generan índices para mejorar el rendimiento de las consultas más comunes.
4. **Datos Semilla (Dummy Data)**: Se insertan abogados con múltiples zonas horarias, clientes y citas pre-agendadas para que la API tenga datos que mostrar en las demos.

## Notas Importantes
- Las tablas hacen un fuerte uso de la característica `TIMESTAMP WITH TIME ZONE` de PostgreSQL. Asegúrate de que las inserciones del backend siempre provean o manejen coherentemente el formato UTC para evitar conflictos de agendamiento entre distintas zonas horarias.
