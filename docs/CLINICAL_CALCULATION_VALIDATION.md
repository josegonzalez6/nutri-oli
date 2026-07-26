# Clinical Calculation Validation

## Estados permitidos

- VERIFIED_PRIMARY_SOURCE
- VERIFIED_SECONDARY_SOURCE
- NEEDS_MANUAL_VALIDATION
- EXPERIMENTAL
- DISABLED
- REJECTED

## Reglas de activacion

- Una ecuacion predictiva requiere fuente primaria o consenso tecnico fiable.
- La formula debe registrar poblacion, edad, sexo, unidades, variables, limitaciones, error y validacion externa cuando exista.
- Los tests numericos deben incluir al menos un caso reproducible, borde de rango y caso no aplicable.
- Las formulas dudosas se catalogan pero quedan deshabilitadas.
- La UI debe mostrar `No calculable` si faltan datos o la poblacion no aplica.
