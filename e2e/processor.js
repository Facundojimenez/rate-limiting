'use strict';

/**
 * E2E Test Processor para el Rate Limiter
 * Contiene funciones de validación custom usadas en los escenarios de Artillery
 */

const GET_MAX = parseInt(process.env.GET_MAX || '5');
const POST_MAX = parseInt(process.env.POST_MAX || '3');

/**
 * Inicializa el contexto para el test de rate limit en GET:
 * - Genera un userId único por ejecución (para no interferir con corridas anteriores)
 * - Resetea el contador de requests
 */
function initGetRateLimitTest(context, events, done) {
  context.vars.rateLimitUserId = `test-get-ratelimit-${Date.now()}`;
  context.vars.requestCount = 0;
  return done();
}

/**
 * Inicializa el contexto para el test de rate limit en POST:
 * - Genera un userId único por ejecución
 * - Resetea el contador de requests
 */
function initPostRateLimitTest(context, events, done) {
  context.vars.rateLimitUserId = `test-post-ratelimit-${Date.now()}`;
  context.vars.requestCount = 0;
  return done();
}

/**
 * Inicializa el contexto para el test de reset de ventana:
 * - Genera un userId único para no interferir con otros tests
 */
function initWindowResetTest(context, events, done) {
  context.vars.resetTestUserId = `test-window-reset-${Date.now()}`;
  return done();
}

/**
 * Incrementa el contador de requests antes de cada request en el loop
 */
function incrementRequestCount(context, events, done) {
  context.vars.requestCount = (context.vars.requestCount || 0) + 1;
  return done();
}

/**
 * Valida la respuesta del GET rate limit:
 * - Requests 1..GET_MAX → esperamos 200
 * - Requests > GET_MAX  → esperamos 429
 */
function validateGetRateLimitResponse(requestParams, response, context, ee, next) {
  const count = context.vars.requestCount;
  const expectedStatus = count <= GET_MAX ? 200 : 429;

  if (response.statusCode !== expectedStatus) {
    const msg = `[GET Rate Limit] Request #${count}: Se esperaba HTTP ${expectedStatus} pero se obtuvo ${response.statusCode}`;
    console.error(`FALLO: ${msg}`);
    ee.emit('counter', 'engine.http.assertion.error', 1);
    return next(new Error(msg));
  }

  const tag = count <= GET_MAX ? 'OK (200)' : 'LIMITADO (429)';
  console.log(`[GET Rate Limit] Request #${count}: ${tag} - correcto`);
  return next();
}

/**
 * Valida la respuesta del POST rate limit:
 * - Requests 1..POST_MAX → esperamos 201
 * - Requests > POST_MAX  → esperamos 429
 */
function validatePostRateLimitResponse(requestParams, response, context, ee, next) {
  const count = context.vars.requestCount;
  const expectedStatus = count <= POST_MAX ? 201 : 429;

  if (response.statusCode !== expectedStatus) {
    const msg = `[POST Rate Limit] Request #${count}: Se esperaba HTTP ${expectedStatus} pero se obtuvo ${response.statusCode}`;
    console.error(`FALLO: ${msg}`);
    ee.emit('counter', 'engine.http.assertion.error', 1);
    return next(new Error(msg));
  }

  const tag = count <= POST_MAX ? 'OK (201)' : 'LIMITADO (429)';
  console.log(`[POST Rate Limit] Request #${count}: ${tag} - correcto`);
  return next();
}

/**
 * Valida que los headers de rate limit estén presentes en la respuesta
 */
function validateRateLimitHeaders(requestParams, response, context, ee, next) {
  const requiredHeaders = [
    'x-ratelimit-limit',
    'x-ratelimit-remaining',
    'x-ratelimit-window',
  ];

  for (const header of requiredHeaders) {
    if (response.headers[header] === undefined) {
      const msg = `Header requerido ausente: ${header}`;
      console.error(`FALLO: ${msg}`);
      ee.emit('counter', 'engine.http.assertion.error', 1);
      return next(new Error(msg));
    }
  }

  console.log('[Headers] Todos los headers de rate limit están presentes');
  return next();
}

module.exports = {
  initGetRateLimitTest,
  initPostRateLimitTest,
  initWindowResetTest,
  incrementRequestCount,
  validateGetRateLimitResponse,
  validatePostRateLimitResponse,
  validateRateLimitHeaders,
};
