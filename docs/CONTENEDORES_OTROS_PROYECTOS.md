# Puertos de otros contenedores (referencia)

Resumen de los proyectos Docker que tienes (decampoacampo y otros) para evitar conflictos con **racing**.

## Bases de datos

| Proyecto        | Servicio | Puerto host | Contenedor |
|-----------------|----------|-------------|------------|
| **db**          | MariaDB  | **3306**    | db_mariadb_1 |
| **racing**      | MySQL 8  | **3307**    | racing-mysql |
| ms-notificaciones | MongoDB | 27017       | ms-notificaciones-mongodb |
| ms-faena       | MongoDB   | 27018       | ms-faena-mongodb |
| ms-invernada   | MongoDB   | 27019       | ms-invernada (27019:27017) |

Por eso **racing** usa MySQL en el puerto **3307**: el **3306** ya lo usa el proyecto **db** (MariaDB).

## Aplicaciones / APIs

| Proyecto           | Puerto host | Uso        |
|--------------------|-------------|------------|
| apigateway         | 80          | API Gateway |
| webadmin           | 8085        | Admin web  |
| ms-usuarios        | 8080        | Microservicio |
| ms-precios         | 8090        | Microservicio |
| ms-multimedia      | 8081        | Microservicio |
| ms-faena           | 8082        | Microservicio |
| ms-ofertas         | 8083        | Microservicio |
| ms-cotizaciones    | 8084        | Microservicio |
| ms-compra_inmediata| 8086        | Microservicio |
| ms-notificaciones  | 8087        | Microservicio |
| cronjobs-api       | 8100        | Cronjobs    |
| ms-transportes     | 9510        | Microservicio |
| **racing**         | **8001**    | Laravel + React |
| racing (Vite dev)  | 5173        | Frontend HMR |

## Otros

| Proyecto | Puertos     | Uso   |
|----------|-------------|--------|
| smtp     | 5050, 5025, 143 | smtp4dev |
| redis    | (interno)   | Redis |

## Conclusión

- **Racing** está en **8001** (Laravel) y **3307** (MySQL), y **5173** (Vite con `--profile dev`).
- No hay solapamiento con db (3306), ni con los microservicios (8080–8100, 9510) ni con apigateway (80).
