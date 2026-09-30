// Oráculo del I Ching, calculado 100% local (sin API externa, sin límites).
// Tirada tradicional de 3 monedas, 6 veces: cada línea puede ser yin/yang estable
// o "en movimiento" (cambiante), lo que da un segundo hexagrama de transformación.
(function (root) {
    // Cada entrada: [nombre, líneas de abajo hacia arriba (1=yang/firme, 0=yin/partida), sentido, consejo]
    var H = [
        ['Lo Creativo', [1,1,1,1,1,1], 'La fuerza pura, el impulso creador en su máxima expresión.', 'Es momento de actuar con firmeza y liderar, pero sin caer en la soberbia: la verdadera fuerza sabe cuándo ceder.'],
        ['Lo Receptivo', [0,0,0,0,0,0], 'La entrega, la tierra que sostiene y nutre todo lo que crece.', 'Dejá que las cosas vengan a vos en vez de forzarlas. La paciencia y la receptividad son tu fuerza ahora.'],
        ['La Dificultad Inicial', [0,1,0,0,0,1], 'El caos fértil de todo comienzo, como una semilla que empuja la tierra.', 'Los primeros pasos son confusos y lentos; no te desanimes, pedí ayuda y avanzá de a poco.'],
        ['La Insensatez Juvenil', [1,0,0,0,1,0], 'La inexperiencia que todavía no sabe, pero tiene las ganas de aprender.', 'Reconocé lo que no sabés y buscá guía con humildad; la pregunta sincera abre más puertas que la certeza falsa.'],
        ['La Espera', [1,1,1,0,1,0], 'Un momento de pausa necesaria antes de que las condiciones maduren.', 'No te apures. Esperá con confianza, nutrite mientras tanto, y el momento justo va a llegar solo.'],
        ['El Conflicto', [0,1,0,1,1,1], 'Una tensión entre posiciones opuestas que exige ser resuelta con cuidado.', 'Evitá escalar la disputa; buscá un mediador o un acuerdo intermedio antes de que el conflicto se profundice.'],
        ['El Ejército', [0,1,0,0,0,0], 'La disciplina y la organización colectiva puestas al servicio de un objetivo.', 'Organizate, sumá aliados y actuá con método. La fuerza de un grupo bien dirigido supera a la de uno solo.'],
        ['La Solidaridad', [0,0,0,0,1,0], 'La unión genuina entre personas que se sostienen mutuamente.', 'Acercate a quienes comparten tu camino. Este es un buen momento para fortalecer vínculos y trabajar en equipo.'],
        ['La Fuerza Domesticadora de lo Pequeño', [1,1,1,0,1,1], 'Pequeñas influencias que, con constancia, logran contener algo grande.', 'Los cambios grandes ahora tienen que esperar; concentrate en ajustes pequeños y sostenidos.'],
        ['El Paso Cuidadoso', [1,1,0,1,1,1], 'Caminar con cautela sobre terreno delicado, sin perder la calma.', 'Avanzá con tacto y buenos modos, incluso frente a alguien poderoso o una situación tensa; la prudencia te protege.'],
        ['La Paz', [1,1,1,0,0,0], 'El cielo y la tierra en armonía: un período de prosperidad y buena fortuna.', 'Aprovechá este momento favorable para construir y compartir; la generosidad multiplica lo que ya tenés.'],
        ['El Estancamiento', [0,0,0,1,1,1], 'Un momento donde la comunicación se corta y las cosas no fluyen.', 'No fuerces lo que no avanza. Replegate, ordená tu mundo interior y esperá a que el bloqueo se disuelva solo.'],
        ['La Comunidad con los Otros', [1,0,1,1,1,1], 'Los vínculos genuinos, más allá de intereses personales.', 'Buscá una causa o un grupo donde puedas colaborar de corazón; la unión sincera trae grandes logros.'],
        ['La Posesión de lo Grande', [1,1,1,1,0,1], 'Abundancia y claridad, sostenidas por la modestia y la buena voluntad.', 'Tenés más de lo que creés: usalo con generosidad y sin apego, y esa abundancia va a seguir creciendo.'],
        ['La Modestia', [0,0,1,0,0,0], 'La humildad genuina, que no necesita mostrarse para ser reconocida.', 'Mantené los pies en la tierra aún en el éxito; la modestia sincera es la que más respeto y apoyo genera.'],
        ['El Entusiasmo', [0,0,0,1,0,0], 'El impulso vital que moviliza y contagia a los demás.', 'Dejate llevar por tu entusiasmo genuino, pero organizá bien los detalles para que no se disperse en el camino.'],
        ['El Seguimiento', [1,0,0,1,1,0], 'Adaptarse al momento y seguir el flujo de lo que está sucediendo.', 'Soltá el control rígido y adaptate a las circunstancias; seguir con inteligencia no es debilidad, es sabiduría.'],
        ['El Trabajo en lo Corrompido', [0,1,1,0,0,1], 'Aquello que quedó descuidado y ahora pide ser reparado.', 'Hay algo postergado que necesita tu atención. Enfrentalo con seriedad: reparar a tiempo evita un daño mayor.'],
        ['El Acercamiento', [1,1,0,0,0,0], 'Una fuerza en crecimiento que se aproxima con buenas intenciones.', 'Las condiciones están mejorando. Acercate a las personas y proyectos con confianza, sin apuro.'],
        ['La Contemplación', [0,0,0,0,1,1], 'Observar con calma antes de actuar, para entender el panorama completo.', 'Tomate un tiempo para observar sin intervenir. La claridad que ganes ahora va a guiar tu próxima acción.'],
        ['Morder Atravesando', [1,0,0,1,0,1], 'Remover con decisión un obstáculo que impide la unión o la justicia.', 'Hay algo que necesita resolverse con firmeza, aunque incomode. La claridad y la justicia requieren acción directa.'],
        ['La Gracia', [1,0,1,0,0,1], 'La belleza y la forma que embellecen el fondo de las cosas.', 'Cuidá también las formas, no solo el contenido: un gesto elegante o una buena presentación abren puertas.'],
        ['La Desintegración', [0,0,0,0,0,1], 'Un proceso de deterioro que, llevado hasta el final, permite renovar.', 'Algo viejo se está cayendo a pedazos. No te aferres: dejalo ir para que pueda nacer algo nuevo.'],
        ['El Retorno', [1,0,0,0,0,0], 'El punto de inflexión donde algo vuelve a su curso natural.', 'Es momento de volver sobre tus pasos, corregir el rumbo y empezar de nuevo con lo aprendido.'],
        ['La Inocencia', [1,0,0,1,1,1], 'Actuar desde la espontaneidad genuina, sin segundas intenciones.', 'Confiá en tu instinto natural y actuá sin calcular de más; la sinceridad es tu mejor herramienta ahora.'],
        ['La Fuerza Domesticadora de lo Grande', [1,1,1,0,0,1], 'Acumular fuerza y sabiduría antes de actuar en gran escala.', 'Estás juntando recursos y experiencia. No te apresures: este período de preparación va a dar frutos grandes.'],
        ['Las Comisuras de la Boca', [1,0,0,0,0,1], 'La nutrición: lo que alimentás con tus palabras y tus actos.', 'Prestá atención a qué alimentás (ideas, vínculos, hábitos): cuidá tu cuerpo y tus palabras, también nutren a otros.'],
        ['La Preponderancia de lo Grande', [0,1,1,1,1,0], 'Una carga o situación que excede la capacidad habitual de sostenerla.', 'Estás bajo mucha presión. Buscá apoyo y evitá tomar decisiones drásticas en soledad; el equilibrio es clave.'],
        ['Lo Abismal (el Agua)', [0,1,0,0,1,0], 'El peligro repetido, que se atraviesa con constancia, no con miedo.', 'Estás en aguas profundas. Mantené la calma, avanzá con constancia y no pierdas de vista tu objetivo.'],
        ['Lo Adherente (el Fuego)', [1,0,1,1,0,1], 'La claridad y la luz que se sostienen al adherirse a algo.', 'Buscá claridad conectándote con lo que te da sentido: una causa, un vínculo o un propósito firme.'],
        ['El Influjo', [0,0,1,1,1,0], 'La atracción mutua espontánea, como el cortejo entre dos personas.', 'Dejate influir por lo que sentís genuinamente. La conexión sincera con otra persona trae algo bueno.'],
        ['La Duración', [0,1,1,1,0,0], 'Lo que se sostiene en el tiempo gracias a su constancia interior.', 'Buscá estabilidad en tus vínculos y proyectos: lo que perdura se construye con paciencia, no de golpe.'],
        ['La Retirada', [0,0,1,1,1,1], 'Saber replegarse a tiempo frente a una fuerza que avanza.', 'A veces retroceder con dignidad es la jugada más inteligente. No es rendirse, es elegir el momento.'],
        ['El Poder de lo Grande', [1,1,1,1,0,0], 'Una fuerza en pleno crecimiento, que necesita ser bien dirigida.', 'Tenés mucho impulso ahora: usalo con principios claros, no solo con fuerza bruta, para que no se vuelva en tu contra.'],
        ['El Progreso', [0,0,0,1,0,1], 'Un avance rápido y visible, como el sol que sale sobre la tierra.', 'Las cosas están avanzando a tu favor. Mostrate con confianza, es un buen momento para destacar.'],
        ['El Oscurecimiento de la Luz', [1,0,1,0,0,0], 'Un talento o una verdad que deben protegerse ocultándose por un tiempo.', 'No es momento de exponerte del todo. Guardá tu luz interior y esperá un contexto más seguro para brillar.'],
        ['La Familia', [1,0,1,0,1,1], 'El orden y el cariño que sostienen el núcleo cercano.', 'Poné atención en tu hogar y tus vínculos más cercanos; ahí está la base desde la que todo lo demás crece.'],
        ['El Antagonismo', [1,1,0,1,0,1], 'Una tensión entre posturas opuestas que todavía puede encontrarse.', 'Hay una diferencia difícil de resolver del todo; buscá pequeños puntos en común en vez de forzar un acuerdo total.'],
        ['La Adversidad', [0,1,0,1,0,0], 'Un obstáculo real que exige detenerse, pedir ayuda y replantear el camino.', 'No fuerces el paso hacia adelante; este es un buen momento para pedir consejo y rodear el obstáculo.'],
        ['La Liberación', [0,0,1,0,1,0], 'El alivio después de la tensión, cuando el nudo por fin se afloja.', 'Lo más difícil ya pasó. Soltá lo que te pesaba y avanzá con más ligereza hacia lo que sigue.'],
        ['La Disminución', [1,1,0,0,0,1], 'Restar de un lado para fortalecer otro más importante.', 'Simplificá: soltar algo ahora (tiempo, gasto, compromiso) va a fortalecer lo que de verdad importa.'],
        ['El Aumento', [1,0,0,0,1,1], 'Un período donde dar y compartir trae abundancia de vuelta.', 'Es buen momento para invertir en otros o en vos mismo: lo que das ahora vuelve multiplicado.'],
        ['El Quiebre', [1,1,1,1,1,0], 'El punto de resolución decisiva frente a algo que ya no se sostiene.', 'Es momento de tomar una decisión firme y clara, aunque incomode. Postergarla solo alarga el desgaste.'],
        ['Al Encuentro', [0,1,1,1,1,1], 'Un encuentro inesperado que puede ser oportunidad o distracción.', 'Algo o alguien se cruza en tu camino de repente: evaluá bien antes de comprometerte del todo.'],
        ['La Reunión', [0,0,0,1,1,0], 'Las personas y fuerzas que se congregan alrededor de un propósito común.', 'Es buen momento para reunir gente en torno a un objetivo compartido; la unión da fuerza a lo que viene.'],
        ['La Subida', [0,1,1,0,0,0], 'Un ascenso gradual, como un árbol que crece hacia la luz.', 'Tu esfuerzo constante está dando resultado. Seguí subiendo paso a paso, sin buscar atajos.'],
        ['La Opresión', [0,1,0,1,1,0], 'Un momento de agotamiento o falta de recursos que pone a prueba.', 'Estás pasando un momento difícil; no pierdas la confianza interior, aunque afuera las cosas estén ajustadas.'],
        ['El Pozo', [0,1,1,0,1,0], 'La fuente inagotable que sostiene a todos por igual, si se cuida bien.', 'Volvé a las fuentes que te nutren de verdad, y asegurate de mantenerlas limpias y disponibles para otros también.'],
        ['La Revolución', [1,0,1,1,1,0], 'Un cambio profundo y necesario que renueva lo que ya no funciona.', 'Un cambio grande se está gestando. Si llega en el momento justo y con buenas intenciones, va a ser para bien.'],
        ['El Caldero', [0,1,1,1,0,1], 'La transformación que nutre, como el alimento que se cocina para compartir.', 'Estás transformando algo crudo en algo valioso. Tomate el tiempo de cocción necesario, no te apures.'],
        ['Lo Suscitativo (el Trueno)', [1,0,0,1,0,0], 'La sacudida repentina que despierta y pone todo en movimiento.', 'Un shock o una sorpresa te sacude ahora; usalo para despertar y reaccionar, no para paralizarte.'],
        ['El Aquietamiento (la Montaña)', [0,0,1,0,0,1], 'La quietud consciente, que sabe cuándo detenerse.', 'Detenete un momento. La quietud bien elegida te da la claridad que la acción constante no puede darte.'],
        ['El Desarrollo Gradual', [0,0,1,0,1,1], 'Un avance lento y firme, como el ave que construye su nido paso a paso.', 'No busques resultados inmediatos. Lo que construís con paciencia ahora va a ser sólido y duradero.'],
        ['La Muchacha que se Casa', [1,1,0,1,0,0], 'Una situación que empieza en una posición secundaria o incómoda.', 'Aceptá el punto de partida real de la situación, sin idealizarlo, y andá construyendo tu lugar de a poco.'],
        ['La Abundancia', [1,0,1,1,0,0], 'Un momento de plenitud y luz máxima, que conviene disfrutar sin apego.', 'Estás en un pico de abundancia o reconocimiento. Disfrutalo con generosidad, sabiendo que todo ciclo cambia.'],
        ['El Andariego', [0,0,1,1,0,1], 'Estar de paso, sin raíces fijas, atento y adaptable.', 'No es momento de echar raíces todavía. Mantenete flexible, cordial y alerta mientras estás de paso.'],
        ['Lo Suave (el Viento)', [1,1,0,1,1,0], 'La influencia gentil y penetrante, que convence sin imponer.', 'Insistí con suavidad, no con fuerza. La influencia constante y amable logra más que la presión directa.'],
        ['Lo Sereno (el Lago)', [0,1,1,0,1,1], 'La alegría genuina y compartida, que nace de la calma interior.', 'Buscá momentos de disfrute real con otros; la alegría compartida con sinceridad fortalece todo a tu alrededor.'],
        ['La Disolución', [0,1,0,0,1,1], 'Deshacer lo rígido o separado, para que algo nuevo pueda fluir.', 'Hay una distancia o rigidez que conviene disolver, con un gesto de acercamiento o una conversación pendiente.'],
        ['La Limitación', [1,1,0,0,1,0], 'Los límites necesarios que dan forma y sentido a las cosas.', 'Poné límites claros (de tiempo, de gasto, de energía): la estructura bien pensada te va a dar libertad, no encierro.'],
        ['La Verdad Interior', [1,1,0,0,1,1], 'La sinceridad profunda que conecta genuinamente con los demás.', 'Actuá desde tu verdad más honesta. La sinceridad genuina, incluso vulnerable, es lo que más conecta ahora.'],
        ['La Preponderancia de lo Pequeño', [0,0,1,1,0,0], 'Los pequeños gestos y cuidados que pesan más que los grandes gestos.', 'No busques grandes hazañas ahora; los detalles pequeños y cuidados son los que van a marcar la diferencia.'],
        ['Después de la Consumación', [1,0,1,0,1,0], 'Un logro ya alcanzado, que pide cuidado para no deteriorarse.', 'Lograste algo importante: ahora el desafío es sostenerlo con atención, no descuidarte por la confianza.'],
        ['Antes de la Consumación', [0,1,0,1,0,1], 'El umbral final antes de completar algo, donde el cuidado es clave.', 'Estás cerca de terminar algo importante. No aflojes ahora: el último tramo pide la misma atención que el primero.']
    ];

    function coinToss() { return (Math.random() < 0.5 ? 2 : 3) + (Math.random() < 0.5 ? 2 : 3) + (Math.random() < 0.5 ? 2 : 3); }
    // 6 = yin vieja (cambia a yang), 7 = yang joven (estable), 8 = yin joven (estable), 9 = yang vieja (cambia a yin)
    function lineFromSum(sum) {
        if (sum === 6) return { value: 0, moving: true };
        if (sum === 7) return { value: 1, moving: false };
        if (sum === 8) return { value: 0, moving: false };
        return { value: 1, moving: true };
    }
    function findHexagram(lines) {
        for (var i = 0; i < H.length; i++) {
            var l = H[i][1], ok = true;
            for (var j = 0; j < 6; j++) if (l[j] !== lines[j]) { ok = false; break; }
            if (ok) return { num: i + 1, name: H[i][0], lines: l, meaning: H[i][2], advice: H[i][3] };
        }
        return null;
    }

    // Tira el oráculo completo: hexagrama primario, líneas en movimiento, y (si hay cambios) el hexagrama resultante.
    function cast() {
        var rawLines = [];
        for (var i = 0; i < 6; i++) rawLines.push(lineFromSum(coinToss()));
        var primaryLines = rawLines.map(function (l) { return l.value; });
        var primary = findHexagram(primaryLines);
        var movingIdx = [];
        rawLines.forEach(function (l, i) { if (l.moving) movingIdx.push(i); });
        var result = null;
        if (movingIdx.length) {
            var resultLines = primaryLines.map(function (v, i) { return rawLines[i].moving ? (v ? 0 : 1) : v; });
            result = findHexagram(resultLines);
        }
        return { primary: primary, moving: movingIdx, result: result, rawLines: rawLines };
    }

    root.IChing = { cast: cast, count: H.length };
})(typeof window !== 'undefined' ? window : globalThis);
