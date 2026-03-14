#!/bin/bash

# 🚀 BioNutrex Development Server Launcher
# Esta script inicia tanto el backend como el frontend en nuevas ventanas

echo "🚀 BioNutrex Development Server Launcher"
echo "========================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que PostgreSQL está corriendo
echo "🔍 Verificando PostgreSQL..."
if ! nc -z localhost 5432 2>/dev/null; then
  echo -e "${RED}❌ PostgreSQL no está corriendo en localhost:5432${NC}"
  echo "   Por favor inicia PostgreSQL y vuelve a intentar"
  exit 1
fi
echo -e "${GREEN}✅ PostgreSQL está corriendo${NC}"
echo ""

# Directorio del proyecto
PROJECT_DIR="/home/andres/dev/bionutrex-corporative-website"

# Iniciar Backend
echo -e "${YELLOW}▶️  Iniciando Backend...${NC}"
cd "$PROJECT_DIR/bionutrex-backend"

# Crear una nueva terminal con el backend (gnome-terminal)
if command -v gnome-terminal &> /dev/null; then
  gnome-terminal -- bash -c 'cd /home/andres/dev/bionutrex-corporative-website/bionutrex-backend && npm run dev; bash'
  echo -e "${GREEN}✅ Backend iniciado en nueva terminal${NC}"
elif command -v xterm &> /dev/null; then
  xterm -e "cd $PROJECT_DIR/bionutrex-backend && npm run dev" &
  echo -e "${GREEN}✅ Backend iniciado en xterm${NC}"
else
  echo -e "${YELLOW}⚠️  No se puede abrir terminal gráfica, iniciando en background...${NC}"
  npm run dev > /tmp/backend.log 2>&1 &
  BACKEND_PID=$!
  echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID)${NC}"
  echo "   Logs en: /tmp/backend.log"
fi

sleep 3

# Verificar que el backend está respondiendo
echo ""
echo "🔍 Verificando que el backend está respondiendo..."
RETRIES=5
for i in $(seq 1 $RETRIES); do
  if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend está respondiendo${NC}"
    break
  fi
  if [ $i -lt $RETRIES ]; then
    echo "   Intento $i de $RETRIES..."
    sleep 1
  else
    echo -e "${RED}❌ Backend no está respondiendo después de ${RETRIES}s${NC}"
    echo "   Verifica los logs: /tmp/backend.log"
  fi
done

echo ""

# Iniciar Frontend
echo -e "${YELLOW}▶️  Iniciando Frontend...${NC}"
cd "$PROJECT_DIR/bionutrex-frontend"

# Crear una nueva terminal con el frontend
if command -v gnome-terminal &> /dev/null; then
  gnome-terminal -- bash -c 'cd /home/andres/dev/bionutrex-corporative-website/bionutrex-frontend && npm run dev; bash'
  echo -e "${GREEN}✅ Frontend iniciado en nueva terminal${NC}"
elif command -v xterm &> /dev/null; then
  xterm -e "cd $PROJECT_DIR/bionutrex-frontend && npm run dev" &
  echo -e "${GREEN}✅ Frontend iniciado en xterm${NC}"
else
  echo -e "${YELLOW}⚠️  No se puede abrir terminal gráfica, iniciando en background...${NC}"
  npm run dev > /tmp/frontend.log 2>&1 &
  FRONTEND_PID=$!
  echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID)${NC}"
  echo "   Logs en: /tmp/frontend.log"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ BioNutrex está listo!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "📱 Accede a la aplicación:"
echo -e "   🌐 http://localhost:5173/"
echo ""
echo "🔐 Credenciales de prueba:"
echo "   Email: admin@bionutrex.com"
echo "   Password: admin123"
echo ""
echo "⚙️  URLs útiles:"
echo "   Backend API:  http://localhost:3001/api"
echo "   Admin Panel:  http://localhost:5173/admin"
echo "   Health Check: http://localhost:3001/api/health"
echo ""
echo -e "${YELLOW}💡 Para detener los servidores, cierra ambas ventanas de terminal${NC}"
echo ""
