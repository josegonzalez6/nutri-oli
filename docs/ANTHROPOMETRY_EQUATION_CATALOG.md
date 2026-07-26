# Anthropometry Equation Catalog

Arquitectura: las ecuaciones viven en `anthropometry_equation_catalog` y en funciones TypeScript tipadas. No se usa `eval` ni formulas ejecutables almacenadas en base de datos.

## Habilitadas

| Slug                    | Tipo   | Entradas             | Salida | Limitacion                                |
| ----------------------- | ------ | -------------------- | ------ | ----------------------------------------- |
| `bmi`                   | indice | masa kg, talla cm    | kg/m2  | No estima composicion corporal.           |
| `waist_to_height_ratio` | indice | cintura cm, talla cm | ratio  | Depende del protocolo usado para cintura. |

## Deshabilitadas o pendientes

| Slug                                            | Motivo                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| `durnin_womersley_1974_density`                 | Requiere revisar coeficientes por edad/sexo contra fuente primaria. |
| `siri_1961_density_to_fat`                      | Requiere revisar texto primario y unidades.                         |
| `brozek_1963_density_to_fat`                    | Requiere revisar supuestos bicompartimentales y transcripcion.      |
| `withers_1987_male_athletes`                    | Poblacion atleta masculina; no extrapolar.                          |
| `withers_1987_female_athletes`                  | Poblacion atleta femenina; no extrapolar.                           |
| `lee_2000_skeletal_muscle_mass`                 | Requiere validar variables, unidades y codificacion.                |
| `poortmans_2005_pediatric_skeletal_muscle_mass` | Pediatrica; deshabilitada para adultos.                             |
| `rocha_bone_mass`                               | Fuente primaria no verificada.                                      |
| `heath_carter_somatotype`                       | Requiere revision del manual autorizado.                            |
| `lorenz_reference_weight`                       | Referencia historica; no objetivo clinico predeterminado.           |
| `metropolitan_life_tables`                      | Tabla actuarial historica; no objetivo clinico predeterminado.      |

No se promedian modelos por defecto. El profesional debera seleccionar una ecuacion principal cuando se habiliten modelos avanzados.
