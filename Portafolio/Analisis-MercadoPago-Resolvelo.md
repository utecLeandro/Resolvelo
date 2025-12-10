# Análisis del Flujo de Pagos con MercadoPago en Resolvelo

## 1. Estado Actual: Modelo de Agregador

**Análisis de la implementación actual:**
Tras revisar el código fuente (`src/transacciones/transacciones.service.ts`), se confirma que la plataforma utiliza un único `MP_ACCESS_TOKEN` centralizado.

*   **Flujo de fondos:** Cuando un arrendatario realiza un pago, el 100% del dinero ingresa directamente a la cuenta de MercadoPago de **Resolvelo**.
*   **Situación del Propietario:** En esta instancia inicial, el dinero no se dispersa ni se transfiere automáticamente a la cuenta del propietario del instrumento.
*   **Modelo Operativo:** Estás operando bajo el modelo de **Agregador**. La plataforma actúa como intermediaria total, cobrando el monto completo y asumiendo la responsabilidad de liquidar posteriormente al usuario final.

---

## 2. Manejo de Comisiones

Dado el modelo actual (Agregador), **la plataforma ya tiene en su poder la comisión y el monto correspondiente al propietario** desde el momento del cobro.

*   **No es necesario "incluir" la comisión:** Al recibir el 100% del pago, la comisión ya está implícitamente cobrada.
*   **Gestión interna:** El sistema debe calcular internamente cuánto de ese total pertenece a Resolvelo (comisión) y cuánto debe ser transferido al propietario.

### Alternativa: Modelo Marketplace (Split Payment)
Existe otra modalidad en MercadoPago llamada *Split Payment*, donde el pago se divide en el momento de la transacción:
*   El dinero va directo a la cuenta del propietario.
*   La plataforma solo recibe su comisión.
*   **Desventaja:** Se pierde el control de los fondos para realizar retenciones de seguridad (ver punto 3).

---

## 3. Retención de Pagos (Escrow / Liberación de Fondos)

El objetivo es procesar el cobro pero "liberar" el pago al propietario solo cuando la reserva haya concluido exitosamente.

### Viabilidad Técnica
MercadoPago no ofrece un servicio de *Escrow* (depósito en garantía neutral) nativo para este tipo de flujo, pero **es totalmente posible simularlo con tu modelo actual**.

### Flujo Recomendado (Modelo Agregador)
Al tener el dinero en la cuenta de la plataforma, tienes el control total para decidir **cuándo** pagar.

1.  **Cobro Inicial:** El arrendatario paga. El dinero entra a la cuenta de Resolvelo.
2.  **Retención:** El sistema mantiene el dinero (contablemente) y marca la transacción como `PAGO_RECIBIDO`.
3.  **Ejecución del Servicio:** Transcurre el periodo de alquiler.
4.  **Validación:** Al finalizar, se abre una ventana de tiempo (ej. 24-48hs) para reclamos.
5.  **Liberación:** Si no hay incidencias, un proceso automático (Cron Job) ejecuta la transferencia de fondos al propietario.

---

## 4. Recomendación y Próximos Pasos

Para garantizar la seguridad y confianza en la plataforma Resolvelo, se recomienda **mantener el modelo actual de Agregador**, ya que ofrece mayor control ante disputas.

### Lo que falta implementar en el sistema:
1.  **Sistema de Liquidación:** Desarrollar la lógica para transferir el dinero desde la cuenta de Resolvelo a la del propietario (Payouts).
2.  **Registro de Cuentas:** Funcionalidad para que los propietarios carguen su CBU/CVU o cuenta de MercadoPago para recibir los fondos.
3.  **Estados Financieros:** Ampliar los estados de las transacciones para diferenciar entre `COBRADO` (dinero en plataforma) y `LIQUIDADO` (dinero enviado al dueño).
