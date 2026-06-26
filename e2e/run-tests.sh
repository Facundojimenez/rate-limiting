#!/bin/sh
# =============================================================================
# Script de ejecución de tests E2E para el Rate Limiter
# Ejecuta todos los escenarios de Artillery en orden secuencial
# =============================================================================

PASS=0
FAIL=0
TOTAL=0

# Colores para output (compatible con sh)
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TARGET="${TARGET:-http://localhost:4000}"
GET_MAX="${GET_MAX:-5}"
POST_MAX="${POST_MAX:-3}"
WINDOW_SECONDS="${WINDOW_SECONDS:-10}"

# -----------------------------------------------------------------------------
# Función para ejecutar un test y registrar resultado
# -----------------------------------------------------------------------------
run_test() {
  local name="$1"
  local file="$2"
  TOTAL=$((TOTAL + 1))

  echo ""
  echo "======================================================================="
  printf "${YELLOW}TEST $TOTAL: $name${NC}\n"
  echo "======================================================================="

  if TARGET="$TARGET" GET_MAX="$GET_MAX" POST_MAX="$POST_MAX" WINDOW_SECONDS="$WINDOW_SECONDS" \
     artillery run "$file"; then
    PASS=$((PASS + 1))
    printf "${GREEN}RESULTADO: PASÓ${NC}\n"
  else
    FAIL=$((FAIL + 1))
    printf "${RED}RESULTADO: FALLÓ${NC}\n"
  fi
}

# -----------------------------------------------------------------------------
# Esperar que el rate-limiter esté listo
# -----------------------------------------------------------------------------
echo ""
echo "======================================================================="
echo "  Rate Limiter E2E Tests"
echo "  Target: $TARGET"
echo "  GET_MAX=$GET_MAX | POST_MAX=$POST_MAX | WINDOW_SECONDS=$WINDOW_SECONDS"
echo "======================================================================="
echo ""
echo "Esperando que el rate-limiter esté disponible..."

# Usa node (disponible en la imagen de Artillery) para verificar que el servidor
# responda a cualquier petición HTTP, independientemente del status code (200/400/etc.)
RETRIES=0
MAX_RETRIES=30
until node -e "
  require('http').get('$TARGET/payments/get', function(r) {
    process.exit(0);
  }).on('error', function() {
    process.exit(1);
  });
" 2>/dev/null || [ "$RETRIES" -ge "$MAX_RETRIES" ]; do
  RETRIES=$((RETRIES + 1))
  echo "  Intento $RETRIES/$MAX_RETRIES - esperando 2s..."
  sleep 2
done

if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
  printf "${RED}ERROR: El rate-limiter no está disponible después de ${MAX_RETRIES} intentos${NC}\n"
  exit 1
fi

echo "Rate-limiter listo. Iniciando tests..."
sleep 2  # Pequeño buffer adicional

# -----------------------------------------------------------------------------
# Ejecución de todos los escenarios
# -----------------------------------------------------------------------------

run_test "Caso 1: userId faltante → 400 Bad Request" \
  "/e2e/scenarios/1-missing-userid.yml"

run_test "Caso 2: GET dentro del límite → 200 OK" \
  "/e2e/scenarios/2-get-happy-path.yml"

run_test "Caso 3: POST dentro del límite → 201 Created" \
  "/e2e/scenarios/3-post-happy-path.yml"

run_test "Caso 4: Headers de rate limit presentes en respuesta" \
  "/e2e/scenarios/4-rate-limit-headers.yml"

run_test "Caso 5: GET excede el límite → 429 Too Many Requests" \
  "/e2e/scenarios/5-get-rate-limited.yml"

run_test "Caso 6: POST excede el límite → 429 Too Many Requests" \
  "/e2e/scenarios/6-post-rate-limited.yml"

run_test "Caso 7: El límite se resetea después del window (tarda ~${WINDOW_SECONDS}s)" \
  "/e2e/scenarios/7-window-reset.yml"

# -----------------------------------------------------------------------------
# Resumen final
# -----------------------------------------------------------------------------
echo ""
echo "======================================================================="
printf "  RESUMEN FINAL DE TESTS E2E\n"
echo "======================================================================="
printf "  Total:   $TOTAL\n"
printf "  ${GREEN}Pasaron: $PASS${NC}\n"
printf "  ${RED}Fallaron: $FAIL${NC}\n"
echo "======================================================================="
echo ""

if [ "$FAIL" -gt 0 ]; then
  printf "${RED}RESULTADO: Algunos tests fallaron${NC}\n"
  exit 1
fi

printf "${GREEN}RESULTADO: Todos los tests pasaron!${NC}\n"
exit 0
