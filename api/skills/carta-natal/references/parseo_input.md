# Parseo de input

El input puede llegar en JSON (como el que devuelven los softwares de cálculo, con muchos campos) o en texto libre. Normalizar internamente a: ángulos (asc, mc, dsc, ic con signo y grado), planetas (nombre, signo, casa, grado, retrógrado), puntos extra (nodos, Lilith, Quirón, Partes árabes), casas (cúspide, signo, regente), aspectos (cuerpo 1, cuerpo 2, tipo, orbe, modo aplicativo/separativo) y nivel de detalle.

## Formato JSON

Suele traer: `angles` (asc/desc/mc/ic), `planets` (con house, retrograde), `houses` (cúspides con signo y grado), `northNode`/`southNode`, `lilith`, `chiron`, `partOfFortune`/`partOfMisfortune`, y `aspects` con `phase` (applying/separating) y `orb`. Mapear todo a la estructura interna. Aceptar variaciones de nombres de clave sin pedir que se reformatee. Ignorar entradas vacías (por ejemplo `earth` con valores null).

**Regentes de casa**: si no vienen explícitos, calcularlos desde el signo de la cúspide con la tabla de regencias de `significados_signos_casas.md`.

**Planetas que habitan cada casa**: reunir siempre qué cuerpos caen dentro de cada casa relevante. No alcanza con mirar el regente: los "inquilinos" de la casa pesan igual.

## Formato texto libre

Ejemplo: "Sol en Aries grado 21 casa 12, Sol conjunción Luna orbe separativa 5 grados, Ascendente en Tauro grado 4".

- Planetas: `[Planeta] en [Signo] grado [N] casa [M]`. Si falta la casa, marcarla como no informada.
- Ángulos: `Ascendente/Medio Cielo/Descendente/Fondo de Cielo en [Signo] grado [N]`.
- Aspectos: `[Cuerpo A] [tipo] [Cuerpo B] orbe [aplicativa|separativa] [N grados]`.
- Nivel de detalle: si lo menciona ("nivel alto", "poco detalle técnico"), capturarlo; si no, preguntar o usar MEDIO.

## Datos faltantes

- Si faltan algunos de los 10 planetas, seguir con los disponibles y avisar brevemente.
- Si faltan los ángulos, es la limitación más importante (tienen el mayor peso del sistema). Avisarlo específicamente y sugerir conseguir hora y lugar de nacimiento exactos.
- Nodos, Lilith, Quirón y Partes árabes son opcionales: si no vienen, no se mencionan ni hace falta aclararlo.
