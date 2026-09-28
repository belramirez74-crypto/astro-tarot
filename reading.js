// Lectura personalizada por reglas: síntesis, planetas personales por casa,
// regente de la carta, fase lunar, stellium, retrógrados y aspectos clave.
(function (root) {
    var SIGNS = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
    var ELEMS = ['Fuego', 'Tierra', 'Aire', 'Agua'];
    var RULERS = { 'Aries': 'Marte', 'Tauro': 'Venus', 'Géminis': 'Mercurio', 'Cáncer': 'Luna', 'Leo': 'Sol', 'Virgo': 'Mercurio',
        'Libra': 'Venus', 'Escorpio': 'Plutón', 'Sagitario': 'Júpiter', 'Capricornio': 'Saturno', 'Acuario': 'Urano', 'Piscis': 'Neptuno' };
    var HOUSE_THEME = {
        1: 'tu identidad y tu forma de presentarte', 2: 'tus recursos, valores y seguridad material', 3: 'tu mente, tus estudios y tus vínculos cercanos',
        4: 'tu hogar, tus raíces y tu mundo íntimo', 5: 'tu creatividad, el romance y tu alegría', 6: 'tu trabajo diario, tu salud y tus rutinas',
        7: 'tus relaciones de pareja y tus sociedades', 8: 'tus transformaciones, la intimidad y lo compartido', 9: 'tus viajes, tus creencias y tu visión de mundo',
        10: 'tu vocación, tu carrera y tu reputación', 11: 'tus amistades, tus proyectos y tus aspiraciones', 12: 'tu mundo interior, la espiritualidad y el descanso'
    };

    var IN_HOUSE = {
        'Sol': {
            1: 'Tu identidad se muestra sin filtros: liderás con tu sola presencia y necesitás ser vos mismo/a para sentirte vivo/a.',
            2: 'Tu autoestima se apoya en lo que construís y ganás: encontrás seguridad al generar tus propios recursos.',
            3: 'Brillás al comunicar, aprender y enseñar; tu entorno cercano (hermanos, vecinos, compañeros) te ilumina.',
            4: 'Tu centro está en el hogar y la familia: necesitás raíces firmes para desplegar tu luz.',
            5: 'Sos creativo/a y expresivo/a; el juego, el romance y los proyectos personales te dan vitalidad.',
            6: 'Te realizás a través del trabajo bien hecho y el servicio; cuidar tu salud y tus rutinas te sostiene.',
            7: 'Te definís en relación con otros: las parejas y sociedades son el espejo donde te descubrís.',
            8: 'Vivís con intensidad: las crisis y la intimidad te transforman y te dan tu mayor fuerza.',
            9: 'Necesitás expandirte: los viajes, el estudio y una filosofía propia le dan sentido a tu vida.',
            10: 'Tu propósito pasa por la vocación y el reconocimiento público; naciste con ambición de logro.',
            11: 'Brillás en grupos y proyectos colectivos; tus amistades y tus ideales te impulsan.',
            12: 'Tu luz es discreta y profunda: necesitás soledad, introspección y un espacio espiritual para recargarte.'
        },
        'Luna': {
            1: 'Tus emociones se ven a simple vista: sos sensible, receptivo/a y cambiás de ánimo con el ambiente.',
            2: 'Te sentís seguro/a emocionalmente cuando tenés estabilidad material y cosas que te den confort.',
            3: 'Procesás lo que sentís hablando, escribiendo y conectando con tu entorno cercano; sos curioso/a y cambiante.',
            4: 'El hogar es tu refugio emocional: la familia y tus raíces pesan mucho en tu bienestar.',
            5: 'Sentís con dramatismo y ternura; necesitás jugar, crear y ser querido/a de forma visible.',
            6: 'Tus emociones se reflejan en el cuerpo y en la rutina: el orden y ayudar a otros te calman.',
            7: 'Necesitás vínculos cercanos para sentirte completo/a; tu ánimo depende de cómo estés en pareja.',
            8: 'Tus emociones son profundas e intensas, con fuerte intuición; los vínculos íntimos te transforman.',
            9: 'Te nutrís de la libertad, los viajes y las ideas grandes; te calma sentir que crecés.',
            10: 'Tu vida emocional se cruza con tu carrera; buscás reconocimiento y vivís tu profesión con mucho sentimiento.',
            11: 'Te sentís bien rodeado/a de amistades y grupos afines; tu ánimo mejora al compartir ideales.',
            12: 'Tu mundo emocional es muy interior y sensible; necesitás silencio y tiempo a solas para recuperarte.'
        },
        'Mercurio': {
            1: 'Pensás y hablás con rapidez; tu mente es tu carta de presentación.',
            2: 'Pensás en términos prácticos; tus ideas se vuelven ingresos y valorás lo tangible.',
            3: 'Tenés una mente curiosa e inquieta, con facilidad para aprender y comunicar.',
            4: 'Reflexionás mucho sobre tu historia y tu familia; pensás mejor en un entorno tranquilo.',
            5: 'Tu mente es creativa y juguetona; te expresás con humor y originalidad.',
            6: 'Sos analítico/a y detallista; tu mente se organiza en el trabajo y las rutinas.',
            7: 'Aprendés y decidís en diálogo con otros; sos buen/a negociador/a.',
            8: 'Tu mente investiga lo profundo y oculto; percibís motivos que otros no ven.',
            9: 'Pensás en grande: te atraen la filosofía, los estudios superiores y otras culturas.',
            10: 'Tu comunicación se orienta a tus metas profesionales; sos estratégico/a.',
            11: 'Compartís ideas en grupos; te estimulan las redes y los proyectos colectivos.',
            12: 'Tu pensamiento es intuitivo e imaginativo; procesás mejor en silencio.'
        },
        'Venus': {
            1: 'Tenés encanto natural; tu presencia atrae y valorás mostrarte con estilo.',
            2: 'Amás lo bello y lo estable; disfrutás de las comodidades y sabés valorar lo que tenés.',
            3: 'Expresás afecto con palabras; las conversaciones y los vínculos cercanos te dan placer.',
            4: 'Buscás armonía en el hogar; amás la vida familiar y crear un espacio cálido.',
            5: 'El romance, el arte y el juego son tu placer; amás con generosidad y entusiasmo.',
            6: 'Mostrás cariño con gestos de cuidado y servicio; te enamora la rutina compartida y la colaboración.',
            7: 'Las relaciones son el centro de tu vida; sos cooperativo/a y buscás una pareja estable y armoniosa.',
            8: 'Amás con intensidad y entrega total; la intimidad y la confianza profunda son clave.',
            9: 'Te atrae lo distinto: culturas, viajes o personas de otros mundos; amás con libertad.',
            10: 'Tu encanto se luce en lo profesional; podés hallar reconocimiento a través de la estética o el trato con la gente.',
            11: 'Valorás la amistad; tus vínculos nacen a menudo en círculos sociales y grupos.',
            12: 'Tu amor es discreto, romántico y a veces oculto o idealizado; te atrae la entrega espiritual.'
        },
        'Marte': {
            1: 'Actuás con impulso directo y mucha energía; iniciás sin esperar y sos competitivo/a.',
            2: 'Te movés con determinación para ganar y asegurar recursos; cuidado con gastar por impulso.',
            3: 'Tu mente es rápida y combativa; discutís con pasión y hablás sin filtros.',
            4: 'Tu energía se activa en el hogar; puede haber tensión familiar o un gran empuje para construir tu espacio.',
            5: 'Vivís el romance y la creatividad con pasión; competís en los juegos y proyectos que te apasionan.',
            6: 'Trabajás con energía y exigencia; cuidá no agotarte ni somatizar la tensión.',
            7: 'Atraés vínculos con carácter; en pareja necesitás aprender a canalizar los choques.',
            8: 'Deseo y fuerza intensos; enfrentás las crisis con coraje y una gran capacidad de regeneración.',
            9: 'Luchás por tus ideales y creencias; te motivan los viajes y los desafíos.',
            10: 'Tu ambición es fuerte; te empujás hacia el liderazgo y el logro profesional.',
            11: 'Te movilizás por causas y grupos; podés liderar proyectos colectivos.',
            12: 'Tu energía trabaja en silencio; podés reprimir la ira o canalizarla en tareas de fondo y en la espiritualidad.'
        }
    };

    var KEY = {
        'Aries': ['con coraje, iniciativa y ganas de liderar', 'de forma impulsiva, intensa y directa', 'enérgico/a y frontal'],
        'Tauro': ['con constancia, lealtad y amor por lo concreto', 'buscando calma, seguridad y placer sensorial', 'sereno/a y confiable'],
        'Géminis': ['con curiosidad, ingenio y necesidad de variedad', 'hablando, pensando y cambiando de ánimo con rapidez', 'ágil y conversador/a'],
        'Cáncer': ['con sensibilidad, cuidado y memoria afectiva', 'de manera profunda, protectora y muy receptiva', 'cálido/a y protector/a'],
        'Leo': ['con calidez, orgullo y deseo de brillar', 'con generosidad, drama y necesidad de reconocimiento', 'carismático/a y seguro/a'],
        'Virgo': ['con precisión, servicio y afán de mejorar', 'con análisis, practicidad y necesidad de orden', 'prolijo/a y observador/a'],
        'Libra': ['con diplomacia, sentido estético y amor por la armonía', 'buscando equilibrio, compañía y paz en los vínculos', 'encantador/a y equilibrado/a'],
        'Escorpio': ['con intensidad, profundidad y poder de transformación', 'de forma apasionada, reservada y muy intuitiva', 'magnético/a y enigmático/a'],
        'Sagitario': ['con optimismo, libertad y sed de horizontes', 'con entusiasmo, franqueza y necesidad de aire libre', 'optimista y aventurero/a'],
        'Capricornio': ['con ambición, disciplina y sentido del deber', 'con reserva, autocontrol y necesidad de seguridad', 'serio/a y responsable'],
        'Acuario': ['con originalidad, independencia y visión de futuro', 'con distancia, mente abierta y necesidad de libertad', 'original e independiente'],
        'Piscis': ['con empatía, imaginación y sensibilidad espiritual', 'con ternura, intuición y una gran permeabilidad', 'dulce y soñador/a']
    };

    var PHASES = [
        [0, 'Luna Nueva', 'Naciste en Luna Nueva: sos intuitivo/a, espontáneo/a y con ganas de empezar cosas; tu deseo y tu emoción van de la mano.'],
        [45, 'Luna Creciente', 'Naciste en Luna Creciente: tenés empuje para construir y superar obstáculos; te motiva crecer.'],
        [90, 'Cuarto Creciente', 'Naciste en Cuarto Creciente: vivís la acción y la tensión creativa; los desafíos te obligan a decidir y avanzar.'],
        [135, 'Gibosa Creciente', 'Naciste en Gibosa Creciente: perfeccionás y ajustás; sos analítico/a y buscás pulir lo que hacés.'],
        [180, 'Luna Llena', 'Naciste en Luna Llena: sos consciente de los contrastes entre lo interno y lo externo; buscás equilibrar vínculos y objetivos.'],
        [225, 'Gibosa Menguante', 'Naciste en Gibosa Menguante: te gusta compartir lo que aprendés; tenés vocación de transmitir.'],
        [270, 'Cuarto Menguante', 'Naciste en Cuarto Menguante: revisás y transformás creencias; tenés sentido crítico y ganas de renovar.'],
        [315, 'Luna Balsámica', 'Naciste en Luna Balsámica: sos visionario/a y sensible; mirás hacia el futuro y cerrás ciclos con facilidad.']
    ];

    var ELEM_REL = {
        same: 'Tu Sol y tu Luna comparten elemento: hay coherencia entre lo que querés y lo que necesitás, y te sentís entero/a.',
        friend: 'Tu Sol y tu Luna están en elementos afines: se apoyan entre sí y tu mundo interno y externo se entienden.',
        tense: 'Tu Sol y tu Luna están en elementos distintos: a veces lo que querés y lo que sentís se contradicen, y eso te da riqueza y complejidad.'
    };

    var PAIR = {
        'Sol|Luna': ['Tu voluntad y tus emociones van en la misma dirección: te sentís en paz con lo que querés y eso te da coherencia interna.',
            'Sentís un tironeo entre lo que querés y lo que necesitás emocionalmente; crecés al integrar razón y sentimiento.',
            'Voluntad y emociones actúan unidas: sos coherente y directo/a, aunque te cueste ver otros puntos de vista.'],
        'Venus|Marte': ['Deseo y afecto se complementan: sabés seducir y expresar lo que sentís con naturalidad, con una vida amorosa equilibrada.',
            'Tu deseo y tu necesidad de afecto no siempre coinciden; los vínculos pueden ser apasionados e intensos, con altibajos.',
            'Sensualidad y pasión van juntas; amás con intensidad y magnetismo, y te cuesta separar el deseo del cariño.'],
        'Sol|Saturno': ['Tenés disciplina y madurez naturales; los logros llegan con constancia y sentido de responsabilidad.',
            'Sentís exigencia o inseguridad ligada a la autoridad; con esfuerzo sostenido convertís los obstáculos en solidez.',
            'Sos serio/a y responsable desde joven; la vida te pide madurez temprana y te premia con perseverancia.'],
        'Luna|Saturno': ['Tenés control emocional y estabilidad; das seguridad a otros aunque te cueste pedirla.',
            'Podés sentir frialdad, miedo al rechazo o una crianza exigente; trabajar la autoaceptación te da paz.',
            'Tu mundo emocional es contenido y responsable; cuesta mostrar vulnerabilidad, pero sos muy leal.'],
        'Luna|Venus': ['Sos afectuoso/a, tierno/a y encantador/a; los vínculos te resultan fáciles y cálidos.',
            'Podés necesitar demasiada aprobación afectiva o dudar de tu merecimiento; aprender a valorarte equilibra tus vínculos.',
            'Tu ternura es tu don: sos cariñoso/a, sociable y buscás armonía emocional.'],
        'Sol|Júpiter': ['Tenés optimismo, suerte y generosidad; la confianza te abre puertas.',
            'Tendés a exagerar o prometer de más; con medida, tu entusiasmo se vuelve crecimiento real.',
            'Sos optimista, generoso/a y expansivo/a; la vida suele darte oportunidades si confiás.'],
        'Luna|Marte': ['Tenés energía emocional y coraje para defender lo que sentís, con buena capacidad de reacción.',
            'Tus emociones se disparan rápido: hay irritabilidad e impulsividad; aprender a pausar te da poder.',
            'Sentís con fuerza y reaccionás al instante; sos apasionado/a y protector/a.'],
        'Mercurio|Saturno': ['Pensás con orden y profundidad; tenés mente estratégica y habilidad para planificar.',
            'Podés ser muy crítico/a o dudar de tu propia inteligencia; la práctica constante afina tu mente.',
            'Tu pensamiento es serio, metódico y cauteloso; hablás lo justo y lo pensás bien.']
    };

    function norm(d) { d = d % 360; return d < 0 ? d + 360 : d; }
    function byName(planets, n) { for (var i = 0; i < planets.length; i++) if (planets[i].name === n) return planets[i]; return null; }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function relKind(e1, e2) {
        if (e1 === e2) return 'same';
        var f = { 0: 2, 2: 0, 1: 3, 3: 1 };
        return f[e1] === e2 ? 'friend' : 'tense';
    }
    function pairText(a, b, type) {
        var k = PAIR[a + '|' + b] ? a + '|' + b : (PAIR[b + '|' + a] ? b + '|' + a : null);
        if (!k) return null;
        var idx = type === 'conjunción' ? 2 : (type === 'trígono' || type === 'sextil') ? 0 : 1;
        return PAIR[k][idx];
    }

    // Devuelve { html, facts }
    function build(calc, aspects) {
        var P = calc.planets, html = '', facts = [];
        function card(title, paras) {
            html += '<div class="reading-card"><h4>' + esc(title) + '</h4>' + paras.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '</div>';
            paras.forEach(function (t) { facts.push(title + ': ' + t); });
        }
        var sol = byName(P, 'Sol'), luna = byName(P, 'Luna');
        var iSol = SIGNS.indexOf(sol.zodiac.name), iLuna = SIGNS.indexOf(luna.zodiac.name);

        // 1. Retrato central: Sol + Luna + Ascendente
        var ascSign = calc.asc.sign;
        card('Tu retrato central', [
            'Con el Sol en ' + sol.zodiac.name + ' brillás ' + KEY[sol.zodiac.name][0] + '. Con la Luna en ' + luna.zodiac.name +
            ' sentís ' + KEY[luna.zodiac.name][1] + '. Y con el Ascendente en ' + ascSign + ' los demás te ven ' + KEY[ascSign][2] + '.',
            ELEM_REL[relKind(iSol % 4, iLuna % 4)]
        ]);

        // 2. Fase lunar
        var ang = norm(luna.longitude - sol.longitude), ph = PHASES[Math.floor(((ang + 22.5) % 360) / 45)];
        card('Fase lunar de nacimiento: ' + ph[1], [ph[2]]);

        // 3. Planetas personales por casa
        ['Sol', 'Luna', 'Mercurio', 'Venus', 'Marte'].forEach(function (n) {
            var p = byName(P, n);
            if (p && IN_HOUSE[n][p.house_number]) card(n + ' en ' + p.zodiac.name + ', casa ' + p.house_number, [IN_HOUSE[n][p.house_number]]);
        });

        // 4. Regente de la carta
        var rn = RULERS[ascSign], rp = byName(P, rn);
        if (rp) {
            card('Regente de tu carta: ' + rn, [
                'Tu Ascendente está en ' + ascSign + ', regido por ' + rn + '. Ese planeta está en ' + rp.zodiac.name + ' en la casa ' + rp.house_number +
                ', por eso la vida te empuja a orientarte hacia ' + HOUSE_THEME[rp.house_number] + '.'
            ]);
        }

        // 5. Stellium (3 o más planetas juntos)
        var bySign = {}, byHouse = {};
        P.forEach(function (p) {
            if (p.name === 'Nodo Norte') return;
            (bySign[p.zodiac.name] = bySign[p.zodiac.name] || []).push(p.name);
            (byHouse[p.house_number] = byHouse[p.house_number] || []).push(p.name);
        });
        var st = [];
        Object.keys(bySign).forEach(function (s) { if (bySign[s].length >= 3) st.push('Tenés ' + bySign[s].length + ' planetas en ' + s + ' (' + bySign[s].join(', ') + '): el tema de ese signo pesa mucho en tu carta.'); });
        Object.keys(byHouse).forEach(function (h) { if (byHouse[h].length >= 3) st.push('Tenés ' + byHouse[h].length + ' planetas en la casa ' + h + ' (' + byHouse[h].join(', ') + '): la vida se concentra en ' + HOUSE_THEME[h] + '.'); });
        if (st.length) card('Concentraciones de energía', st);

        // 6. Retrógrados personales
        var retro = ['Mercurio', 'Venus', 'Marte'].filter(function (n) { var p = byName(P, n); return p && p.is_retrograde; });
        if (retro.length) card('Planetas personales retrógrados', ['Tenés ' + retro.join(', ') + ' retrógrado' + (retro.length > 1 ? 's' : '') +
            ': esa energía se procesa hacia adentro, con ritmo propio, y suele madurar con la reflexión.']);

        // 7. Aspectos clave entre planetas personales y sociales
        var keyTxt = [];
        aspects.forEach(function (a) {
            var t = pairText(a.a, a.b, a.type);
            if (t && a.orb <= 6) keyTxt.push(a.a + ' ' + a.type + ' ' + a.b + ' (orbe ' + a.orb.toFixed(1) + '°): ' + t);
        });
        if (keyTxt.length) card('Aspectos clave de tu personalidad', keyTxt);

        return { html: html, facts: facts };
    }

    root.Reading = { build: build };
})(typeof window !== 'undefined' ? window : globalThis);
