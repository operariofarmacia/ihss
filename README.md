# IHSS a tu Casa (MediFlow) — Web + Firebase (CDN ES Modules)

Proyecto multipágina (HTML) con JavaScript modular usando Firebase por CDN (ES Modules).

## Requisitos
- Navegador moderno (Chrome/Edge)
- Servidor local (recomendado: **VSCode Live Server**) — no abrir los HTML con `file://`.

## 1) Correr local
1. Abre la carpeta del proyecto en VSCode
2. Instala la extensión **Live Server**
3. Click derecho en `index.html` → **Open with Live Server**

## 2) Deploy en GitHub (opcional)
- Puedes subir el repo a GitHub y usar GitHub Pages si quieres (solo sitios estáticos).

## 3) Deploy en Netlify
### Opción A (Drag & Drop)
1. En Netlify crea un sitio nuevo
2. Arrastra la carpeta del proyecto (o el ZIP descomprimido)

### Opción B (Conectado a GitHub)
1. Conecta el repositorio
2. Build command: *(vacío)*
3. Publish directory: `/` (raíz del repo)

## 4) Firebase Auth → Authorized domains (OBLIGATORIO)
En Firebase Console → Authentication → Settings → Authorized domains, agrega:
- `localhost` (para pruebas)
- `TUUSUARIO.github.io` (si usas GitHub Pages)
- `TU-SITIO.netlify.app` (Netlify)
- Tu dominio custom (si aplica)

## 5) Configuración Firebase usada
Se centraliza en:
- `/js/core/firebase.js`

> ⚠️ Nota: el proyecto usa Firebase **por CDN ES Modules** (no bundlers).

## 6) Admin de emergencia
El sistema intenta crear/asegurar (idempotente) un usuario:
- usuario: `admin`
- contraseña: `admin2025`

> ⚠️ CAMBIAR `admin2025` en producción.

## 7) Firestore Rules
Incluye 2 versiones:
- `firestore.rules.bootstrap` → usar SOLO la primera vez para permitir bootstrap del admin
- `firestore.rules.production` → regla final recomendada

### Aplicar Rules
Firebase Console → Firestore Database → Rules:
1. Copia el contenido del archivo que corresponda
2. Publica
3. Cuando el admin ya exista, cambia a `firestore.rules.production`

## 8) Checklist rápida de pruebas
- Login correcto y redirección por rol
- Sesión única (activeSessionId) por dispositivo
- Autorización por dispositivo cuando `requireIpApproval === true`
- Inactividad 30 min (logout)
- Admin: crear DH manual / importar CSV / importar Excel
- Asignación equitativa a:
  - Farmacia: `Revisión y Asignación`
  - Contact Center: `Agente(s) de Contact Center`
- Botón "Equilibrar carga" respeta elegibilidad

