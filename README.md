# Astroguía · API de carta natal

API en Node y TypeScript que calcula la carta natal con Swiss Ephemeris (`@swisseph/node`) y devuelve los planetas y sus posiciones.

## Requisitos

- Node.js 18+

## Puesta en marcha

```bash
cd api
npm install
npm start
```

Escucha en `http://localhost:3001`.

## Endpoint

`POST /api/natal`

```bash
curl -X POST http://localhost:3001/api/natal \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","date":"1997-04-24","time":"14:36","province":"Ciudad Autónoma de Buenos Aires","city":"Buenos Aires"}'
```

Campos obligatorios: `date` (`YYYY-MM-DD`), `time` (`HH:MM`), `province` y `city`. Si no se envía `country`, se usa Argentina. Las coordenadas salen de `data/argentina.json`.

La respuesta incluye `planets` (signo, grado, longitud, casa y retrogradación), además de ángulos, casas y aspectos.
