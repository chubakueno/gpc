import type { TranslationKey } from "./en";

export const translations: Record<TranslationKey, string> = {
  // Navigation
  "nav.home": "Inicio",
  "nav.hashing": "Hashing",
  "nav.ufds": "Union-Find",
  "nav.lang": "EN",

  // Home page
  "home.title": "Fundamentos de Algoritmos",
  "home.subtitle": "Visualizaciones interactivas, demostraciones matemáticas e implementaciones en C++ de algoritmos fundamentales de programación competitiva.",
  "home.card.hashing.title": "Hashing de Cadenas",
  "home.card.hashing.desc": "Hashing polinomial Rabin-Karp: normal y rolling. Incluye paradoja del cumpleaños y calculadora de probabilidad de colisión.",
  "home.card.ufds.title": "Union-Find (UFDS)",
  "home.card.ufds.desc": "Conjuntos disjuntos con compresión de caminos y unión por rango/tamaño. Visualización gráfica interactiva.",
  "home.explore": "Explorar →",

  // Hashing page
  "hashing.title": "Hashing de Cadenas",
  "hashing.subtitle": "Hashing polinomial Rabin-Karp — normal y ventana deslizante (rolling).",
  "hashing.tab.normal": "Hash Normal",
  "hashing.tab.rolling": "Hash Rolling",
  "hashing.tab.birthday": "Paradoja del Cumpleaños",
  "hashing.tab.calculator": "Calculadora de Colisiones",
  "hashing.tab.code": "Código C++",

  // Normal hash demo
  "hashing.normal.title": "Hash Carácter por Carácter",
  "hashing.normal.desc": "Cada carácter contribuye: hash = (hash × base + char) mod P. Observa la acumulación paso a paso.",
  "hashing.normal.input.label": "Cadena de entrada",
  "hashing.normal.input.placeholder": "Escribe una cadena...",
  "hashing.normal.base.label": "Base",
  "hashing.normal.mod.label": "Módulo P",
  "hashing.normal.step.adding": "Agregando carácter",
  "hashing.normal.step.formula": "Fórmula",
  "hashing.normal.step.running": "Hash acumulado",
  "hashing.normal.char.label": "Char",
  "hashing.normal.ascii.label": "ASCII",
  "hashing.normal.contrib.label": "Contribución",
  "hashing.normal.hash.label": "Hash",
  "hashing.normal.final": "Hash final",

  // Rolling hash demo
  "hashing.rolling.title": "Hash Rolling — Ventana Deslizante",
  "hashing.rolling.desc": "Calcula eficientemente el hash de cada subcadena de longitud k en O(n) total. Elimina el carácter saliente y agrega el entrante.",
  "hashing.rolling.input.label": "Cadena de entrada",
  "hashing.rolling.window.label": "Tamaño de ventana k",
  "hashing.rolling.base.label": "Base",
  "hashing.rolling.mod.label": "Módulo P",
  "hashing.rolling.window": "Ventana",
  "hashing.rolling.removing": "Eliminando",
  "hashing.rolling.adding": "Agregando",
  "hashing.rolling.hash": "Hash",
  "hashing.rolling.all": "Todos los hashes de ventana",

  // Birthday paradox
  "hashing.birthday.title": "Paradoja del Cumpleaños",
  "hashing.birthday.desc": "¿Cuántos valores aleatorios de {0, …, P−1} necesitas antes de obtener un repetido? Menos de lo que imaginas.",
  "hashing.birthday.tab.curve": "Curva de Probabilidad",
  "hashing.birthday.tab.sim": "Simulación",
  "hashing.birthday.mod.label": "Módulo P",
  "hashing.birthday.k.label": "k elementos",
  "hashing.birthday.prob": "P(colisión) ≈",
  "hashing.birthday.formula": "Fórmula de aproximación",
  "hashing.birthday.sim.start": "Iniciar Simulación",
  "hashing.birthday.sim.reset": "Reiniciar",
  "hashing.birthday.sim.collision": "Primera colisión después de",
  "hashing.birthday.sim.items": "elementos",
  "hashing.birthday.sim.running": "Ejecutando…",
  "hashing.birthday.axis.x": "Número de hashes k",
  "hashing.birthday.axis.y": "P(colisión)",
  "hashing.birthday.cursor": "k = {k}, P ≈ {p}%",

  // Collision calculator
  "hashing.calc.title": "Calculadora de Probabilidad de Colisión",
  "hashing.calc.desc": "Dado un módulo primo P y X valores de hash, ¿cuál es la probabilidad de al menos una colisión?",
  "hashing.calc.p.label": "Módulo primo P",
  "hashing.calc.x.label": "Número de hashes X",
  "hashing.calc.p.placeholder": "ej. 1000000007",
  "hashing.calc.x.placeholder": "ej. 100000",
  "hashing.calc.not.prime": "⚠ P no parece ser primo. La aproximación asume que P es primo.",
  "hashing.calc.trivial": "X ≥ P: la colisión es segura por el principio del palomar.",
  "hashing.calc.derivation": "Derivación",
  "hashing.calc.result": "Resultado",
  "hashing.calc.threshold": "Umbral del 50%",
  "hashing.calc.threshold.desc": "Con P = {p}, necesitas aproximadamente {k} hashes para un 50% de probabilidad de colisión.",

  // Hashing code
  "hashing.code.title": "Implementación en C++",
  "hashing.code.tab.normal": "Hash Normal",
  "hashing.code.tab.rolling": "Hash Rolling",
  "hashing.code.tab.double": "Hash Doble",

  // UFDS page
  "ufds.title": "Union-Find (Conjuntos Disjuntos)",
  "ufds.subtitle": "Compresión de caminos y unión por rango/tamaño — de O(n log n) a tiempo casi constante.",
  "ufds.tab.interactive": "Interactivo",
  "ufds.tab.proof": "Demostración O(n log n)",
  "ufds.tab.ackermann": "Sketch α(n)",
  "ufds.tab.code": "Código C++",

  // UFDS interactive
  "ufds.interactive.title": "Union-Find Interactivo",
  "ufds.interactive.desc": "Arrastra un nodo sobre otro para unirlos. Haz clic en un nodo para llamar a find() y ver la compresión de caminos.",
  "ufds.controls.addNode": "Agregar Nodo",
  "ufds.controls.reset": "Reiniciar",
  "ufds.controls.mode": "Optimización",
  "ufds.controls.mode.none": "Ninguna",
  "ufds.controls.mode.compression": "Compresión de Caminos",
  "ufds.controls.mode.rank": "Unión por Rango",
  "ufds.controls.mode.both": "Ambas",
  "ufds.controls.log.title": "Registro de Operaciones",
  "ufds.controls.log.empty": "Sin operaciones aún.",
  "ufds.controls.drag.hint": "Arrastra un nodo sobre otro para unir. Haz clic en un nodo para encontrar su raíz.",
  "ufds.op.union": "union({a}, {b}) → raíz: {r}",
  "ufds.op.find": "find({x}) → raíz: {r}",
  "ufds.op.compress": "Camino comprimido: {path} → {root}",
  "ufds.op.already": "{a} y {b} ya están en el mismo conjunto",

  // UFDS rank proof
  "ufds.proof.title": "Por qué la Unión por Rango es O(n log n)",
  "ufds.proof.subtitle": "Un argumento formal de que el trabajo total en n operaciones find es O(n log n).",

  // UFDS Ackermann
  "ufds.ack.title": "Por qué Compresión + Rango ≈ O(n α(n))",
  "ufds.ack.subtitle": "Un sketch informal del análisis de Tarjan-Hopcroft y la función inversa de Ackermann.",

  // UFDS code
  "ufds.code.title": "Implementación en C++",
  "ufds.code.tab.basic": "Básico",
  "ufds.code.tab.rank": "Unión por Rango",
  "ufds.code.tab.full": "Completo (Ambos)",

  // Shared
  "controls.play": "Reproducir",
  "controls.pause": "Pausar",
  "controls.step": "Paso →",
  "controls.prev": "← Anterior",
  "controls.reset": "Reiniciar",
  "controls.step.of": "Paso {n} de {total}",
};
