# Rate Limiter

Este proyecto tiene dos servicios en TypeScript:

- **backend**: una API simple con datos mock para probar el flujo completo.
- **rate-limiter**: un proxy reverse que protege las peticiones con Redis y limita el tráfico por usuario.

## Arquitectura

```text
Cliente → rate-limiter → backend
           ↕
         Redis
```

Las peticiones deberían pasar siempre por el rate limiter primero. Allí se valida si el usuario sigue dentro del límite permitido y, si corresponde, se reenvían al backend.

## Servicios

### Backend

El backend expone una API mínima para probar el funcionamiento del limitador:

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| POST | `/payments` | Crea un pago |
| GET | `/payments` | Obtiene los pagos |

### Rate limiter

El rate limiter expone las mismas rutas y aplica los límites antes de redirigir la solicitud al backend.

| Ruta | Límite por defecto |
| ---- | ------------------ |
| `POST /rate-limited-payments` | 5 requests por 60s por usuario |
| `GET /rate-limited-payments` | 10 requests por 60s por usuario |

En este ejemplo, el `userId` se toma desde los query params, por ejemplo `?userId=user-123`. En un sistema real, eso debería venir de un JWT o de la sesión del usuario.

### Headers de respuesta

Cada respuesta del rate limiter incluye los siguientes headers:

| Header | Descripción |
| ------ | ----------- |
| `X-RateLimit-Limit` | Máximo de requests permitidos en la ventana |
| `X-RateLimit-Remaining` | Requests restantes en la ventana actual |
| `X-RateLimit-Window` | Tamaño de la ventana en segundos |

Si el límite se excede, el servicio responde con `429 Too Many Requests`.

## Algoritmo

La implementación usa un algoritmo de **Fixed Window**.

Cada request incrementa un contador en Redis usando una clave que combina:

- el método HTTP,
- el recurso,
- y el user ID.

Si es la primera solicitud de la ventana, se asigna una expiración a esa clave. Cuando el contador supera el máximo configurado, la petición queda rechazada hasta que la ventana se reinicia.

Es un enfoque simple y liviano, pero tiene un tradeoff claro: cerca del cambio de ventana puede haber pequeñas ráfagas de requests más altas de lo ideal.

## Cómo correrlo

### Requisitos

- Docker
- Docker Compose

### Levantar el stack

```bash
docker compose up --build
```

Eso levanta Redis, el backend y el rate limiter usando la configuración del archivo `.env` en la raíz del proyecto.

### Variables de entorno

El stack lee la configuración desde el archivo `.env` de la raíz. Las principales son:

| Variable | Valor por defecto | Descripción |
| -------- | ----------------- | ----------- |
| `BACKEND_PORT` | `3000` | Puerto expuesto del backend |
| `RATE_LIMITER_PORT` | `4000` | Puerto expuesto del rate limiter |
| `REDIS_PORT` | `6379` | Puerto expuesto de Redis |
| `INSERT_MAX_REQUESTS` | `5` | Máximo de requests para operaciones de insert |
| `INSERT_WINDOW_SECONDS` | `60` | Tamaño de la ventana para insert |
| `GET_MAX_REQUESTS` | `10` | Máximo de requests para operaciones de get |
| `GET_WINDOW_SECONDS` | `60` | Tamaño de la ventana para get |

## Ejemplos de requests

### Crear un pago

```bash
curl -X POST "http://localhost:4000/rate-limited-payments?userId=user-123" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "ARS"}'
```

### Obtener pagos

```bash
curl "http://localhost:4000/rate-limited-payments?userId=user-123"
```