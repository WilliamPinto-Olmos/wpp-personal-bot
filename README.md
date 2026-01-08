# WhatsApp AI Personal Bot

Un bot personal de WhatsApp construido con [wppconnect](https://github.com/wppconnect-team/wppconnect) y [Vercel AI SDK](https://sdk.vercel.ai/).

Este bot está diseñado para ser un asistente personal en grupos de WhatsApp, permitiendo generar resúmenes de conversaciones y responder preguntas sobre su propio funcionamiento.

Extiende las funcionalidades de lo que actualmente proporciona Meta mediante @MetaAI, ya que el servicio no suele tener acceso a los mensajes o acciones como encuestas, archivos, etc.

## Características

- **Resúmenes con IA**: Capacidad para resumir conversaciones recientes filtrando por usuario, cantidad de mensajes o fecha.
- **Detección de Intenciones**: Utiliza procesamiento de lenguaje natural para entender qué quiere el usuario.
- **Modos de Operación**:
  - **Dry Run**: Procesa mensajes y muestra la respuesta en consola sin enviar nada a WhatsApp.
  - **Mantenimiento**: Responde automáticamente informando que está fuera de servicio temporalmente.
- **Abstracción de Canales**: Arquitectura que separa la lógica de negocio del medio de entrega (WhatsApp/Consola/Email/Etc).

## Ejemplos

**Funcionamiento**

<img width="578" height="340" alt="Captura de pantalla 2026-01-04 a la(s) 10 33 37 p m" src="https://github.com/user-attachments/assets/312c6454-d54f-4809-846b-586cfa1b9125" />

**Resumen por contacto**

<img width="571" height="226" alt="Captura de pantalla 2026-01-04 a la(s) 10 33 18 p m" src="https://github.com/user-attachments/assets/c1556ec2-1476-41e6-bac1-055745af0d3e" />

**Resumen por número de mensajes**

<img width="578" height="301" alt="Captura de pantalla 2026-01-04 a la(s) 11 10 07 p m" src="https://github.com/user-attachments/assets/b9fb49dd-1200-4ed9-841a-790463ffef5a" />

## Roadmap

- [x] Implementar MVP para resumir conversaciones.
- [ ] Soporte de filtrado avanzado de conversaciones, ejemplo por "esta semana" o "el mes pasado".
- [x] Implementar soporte para recordatorios.
- [x] Implementar soporte para búsqueda en la web.
- [ ] Implementar soporte para resumir multimedia enviada por whatsapp
- [x] Implementar soporte para resumir enlaces y vídeos de youtube.
- [x] Implementar repositorios con driver de firestore para persistencia

## Requisitos Previos

- [Node.js](https://nodejs.org/) (v22 o superior)
- [npm](https://www.npmjs.com/)
- Una cuenta de WhatsApp activa.
- Una API Key de [Google Generative AI](https://aistudio.google.com/) o [OpenAI](https://platform.openai.com/).

## Instalación

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/WilliamPinto-Olmos/wpp-personal-bot.git
   cd wpp-personal-bot
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Copea el archivo `.env.example` a `.env` y completa los valores:

   ```bash
   cp .env.example .env
   ```

   Variables principales:

   - `GOOGLE_GENERATIVE_AI_API_KEY`: Tu llave de Gemini.
   - `OPENAI_API_KEY`: Tu llave de OpenAI.
   - `AI_PROVIDER`: `google` o `openai`.
   - `AI_MODEL`: El modelo de IA a usar.
   - `TRIGGER_PHRASE`: La frase con la que el bot responderá (ej: "willy willito...").
   - `DRY_RUN`: `true` para probar sin enviar mensajes mediante los canales configurados por defecto.
   - `MAINTENANCE_MODE`: `true` para activar el mensaje de mantenimiento.

## Ejecución

Para iniciar el bot en modo de desarrollo:

```bash
npm run dev
```

Escanea el código QR que aparecerá en la terminal con tu móvil (WhatsApp > Dispositivos vinculados).

### Cómo usar el bot

El bot solo responderá a los mensajes que comiencen con la **TRIGGER_PHRASE** configurada.

#### Ejemplos de Comandos:

- **Resumen general**:
  > "willy willito resumen de los últimos 50 mensajes"
- **Resumen por persona**:
  > "willy willito qué ha dicho Juan hoy?"
- **Información del bot**:
  > "willy willito quién eres y qué sabes hacer?"

### Testing

Para ejecutar los tests unitarios (Vitest):

```bash
npm run test
```

### Estructura del Proyecto

- `src/ai/`: Lógica de integración con el proveedor de IA (detector, summarizer, contact matcher).
- `src/channels/`: Abstracción de envío de mensajes (WhatsApp/Console).
- `src/pipeline/`: Motor de procesamiento y validadores.
- `src/intents/`: Controladores de las diferentes acciones.
- `src/repositories/`: Capa de persistencia (In-memory/Firestore ready).
- `src/whatsapp/`: Configuración del cliente y fetching de mensajes.

## Disclaimer

El uso de wppconnect puede infringir los términos de servicio de Meta y resultar en la suspensión de tu cuenta. Utiliza este proyecto bajo tu propio riesgo.

## Licencia

Este proyecto está bajo la Licencia MIT.