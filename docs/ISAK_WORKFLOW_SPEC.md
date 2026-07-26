# ISAK Workflow Spec

Nutri-Oli separa:

1. Protocolo de medicion.
2. Medidas brutas.
3. Control de calidad.
4. Indices simples.
5. Ecuaciones predictivas.
6. Interpretacion profesional.

Texto obligatorio en UI para perfiles compatibles:

> Medicion realizada con protocolo compatible con ISAK. No implica certificacion ISAK ni sustituye el manual vigente.

## Flujo v0.1

1. Crear sesion en estado `draft`.
2. Seleccionar perfil/protocolo.
3. Registrar primera medicion.
4. Continuar circuito.
5. Registrar segunda medicion.
6. Calcular diferencia absoluta y relativa.
7. Si esta dentro de tolerancia provisional, calcular valor final.
8. Si esta fuera de tolerancia, exigir tercera medicion.
9. Tras tercera medicion, calcular mediana provisional.
10. Guardar valores brutos y resultado.
11. Finalizar en estado `completed`, bloqueando edicion.

La regla media/mediana esta marcada como `NEEDS_MANUAL_VALIDATION`.
