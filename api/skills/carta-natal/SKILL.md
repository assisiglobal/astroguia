---
name: carta-natal-astrologica
description: Interpreta y analiza cartas natales astrológicas a partir de datos de planetas (Sol a Plutón, con signo, casa y grado), ángulos (Ascendente, Medio Cielo, Descendente, Fondo de Cielo) y aspectos entre planetas (con tipo de aspecto y si son aplicativos o separativos). También puede incorporar nodos lunares, Parte de Fortuna/Infortuna, Lilith, Quirón, cúspides de casa y regentes cuando están disponibles. Genera un análisis interpretativo extenso, personal y en segunda persona (voseo argentino) organizado en 7 áreas fijas (personalidad propia, amor y relaciones de pareja, el disfrute en la vida, viajes, vida laboral y profesional, amistades y familia). Usar esta skill siempre que el usuario envíe datos de una carta natal (en JSON o en texto libre), pida "interpretar mi carta natal", "analizar mi carta astral", "leer mi carta natal", o comparta posiciones planetarias y aspectos para su análisis astrológico.
---

# Intérprete de Carta Natal Astrológica

Skill para producir lecturas interpretativas de cartas natales, con enfoque de **astrología moderna/psicológica** (orientada al autoconocimiento y el desarrollo personal, no fatalista ni predictiva de eventos concretos), en un tono cercano y personal, no de manual.

## Antes de empezar: nivel de detalle

Preguntar (si no vino ya especificado en el pedido) qué **nivel de detalle astrológico** quiere la persona: **ALTO**, **MEDIO** o **BAJO**. Ver `references/estilo_narrativo.md` para qué implica cada nivel. Si no se especifica, usar MEDIO y aclarar que se puede ajustar.

## Flujo de trabajo

1. **Parsear el input**: ver `references/parseo_input.md` para los formatos aceptados (JSON o texto libre), incluyendo ángulos, cúspides/regentes de casa, nodos, Lilith, Quirón y Partes árabes cuando estén presentes.
2. **Ponderar cada elemento**: ver `references/ponderacion.md`. Los ángulos (ASC/MC/DSC/IC) y sus regentes tienen el peso más alto. Nodos y Partes árabes llevan un peso liviano. Lilith, Quirón y puntos menores llevan muy poco peso.
3. **Mapear a las 7 áreas de vida**: ver `references/areas_vida.md`. Hay que considerar siempre el regente de cada cúspide relevante Y los planetas que habitan cada casa.
4. **Redactar la interpretación**: usar `references/significados_signos_casas.md` y `references/aspectos.md` como base de significados, pero SIEMPRE leer y seguir `references/estilo_narrativo.md` antes de escribir (voseo, sin guión largo, la persona como sujeto de la oración, redacción con gancho narrativo).

Si falta algún dato clave, avisar a la persona qué falta y ofrecer trabajar igual con lo disponible, aclarando la limitación brevemente y sin tecnicismo excesivo (según el nivel de detalle elegido).

## Reglas de tono (resumen; el detalle completo está en `references/estilo_narrativo.md`)

- Nunca usar el carácter guión largo ("—"). Revisar el texto final antes de entregarlo.
- Voseo argentino en segunda persona ("tenés", "sos"), nunca tuteo español.
- La persona es el sujeto de la oración; el planeta es la evidencia, no el protagonista gramatical.
- Redacción con gancho: cada oración debería generar ganas de seguir leyendo.
- Mostrar matices y tensiones, no solo lo "positivo", avisando el giro ("ojo, no todo es...").

## Las 7 áreas de vida (orden de la lectura)

1. Personalidad propia
2. Amor y relaciones de pareja
3. El disfrute en la vida
4. Viajes
5. Vida laboral y profesional
6. Amistades
7. Familia

Ver `references/areas_vida.md` para qué factores astrológicos alimentan cada una.

## Extensión

Por defecto, análisis profundo y detallado por área (varios párrafos por área), salvo que la persona pida algo más breve. El nivel de detalle astrológico (ALTO/MEDIO/BAJO) no acorta la extensión ni la profundidad interpretativa: solo cambia cuánto vocabulario técnico aparece explícito.

Cerrar cada área con una síntesis breve (1-2 frases) y, al final de toda la lectura, agregar una síntesis general que conecte los 2-3 factores de mayor peso de toda la carta.

## Nota sobre precisión de los datos de entrada

Esta skill interpreta los datos que la persona provee tal cual, no calcula posiciones planetarias ni casas de manera independiente. Si no tiene los datos calculados, sugerir que use un software o sitio de cálculo de carta natal (requiere fecha, hora exacta y lugar de nacimiento) y que después pegue el resultado acá.
