// Horóscopo diario, compatibilidad de signos y sinastría, todo calculado localmente por reglas.
(function (root) {
    var SIGNS = Natal.SIGNS;
    var ELEMS = ['Fuego', 'Tierra', 'Aire', 'Agua'];
    var MODES = ['Cardinal', 'Fijo', 'Mutable'];
    var HOUSE_THEME = {
        1: 'tu identidad y tu forma de presentarte', 2: 'tus recursos y tu seguridad material', 3: 'tu mente, tus estudios y tus vínculos cercanos',
        4: 'tu hogar y tu mundo íntimo', 5: 'tu creatividad, el romance y tu alegría', 6: 'tu trabajo diario, tu salud y tus rutinas',
        7: 'tus relaciones de pareja y tus sociedades', 8: 'tus transformaciones y lo compartido', 9: 'tus viajes, tus creencias y tu visión de mundo',
        10: 'tu vocación y tu reputación', 11: 'tus amistades y tus proyectos', 12: 'tu mundo interior y el descanso'
    };
    var MOON_HOUSE = {
        1: 'Estás más sensible y expresivo/a; escuchá tu cuerpo y mostrate tal cual sos.',
        2: 'El foco está en el dinero y la seguridad; evitá compras impulsivas y valorá lo que ya tenés.',
        3: 'Tu mente y tu comunicación están activas; buen día para conversar, hacer trámites y estudiar.',
        4: 'Buscás refugio: el hogar y la familia te piden atención y calma.',
        5: 'Se enciende tu lado creativo y romántico; date un gusto y disfrutá.',
        6: 'Buen día para ordenar rutinas, cuidar la salud y resolver tareas pendientes.',
        7: 'Las relaciones están en primer plano; escuchá a tu pareja o socios y buscá acuerdos.',
        8: 'Las emociones son intensas; es un buen momento para soltar lo que pesa y hablar con honestidad.',
        9: 'Tenés ganas de aprender, viajar o ampliar horizontes; salí de la rutina.',
        10: 'El foco está en tus metas y tu imagen; el trabajo puede darte reconocimiento.',
        11: 'Las amistades y los proyectos colectivos te dan impulso; compartí ideas.',
        12: 'Día de introspección: descansá, meditá y evitá exigirte de más.'
    };
    var MOON_SIGN = ['impulsivo/a y con ganas de actuar', 'tranquilo/a y buscando confort', 'curioso/a y conversador/a', 'sensible y hogareño/a',
        'expresivo/a y con ganas de brillar', 'práctico/a y detallista', 'sociable y en busca de armonía', 'intenso/a y reservado/a',
        'optimista y aventurero/a', 'serio/a y enfocado/a', 'independiente y original', 'soñador/a y receptivo/a'];

    function norm(d) { d = d % 360; return d < 0 ? d + 360 : d; }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function pl(p, n) { for (var i = 0; i < p.length; i++) if (p[i].name === n) return p[i]; return null; }
    function houseFrom(signIdx, lon) { return ((Math.floor(lon / 30) - signIdx + 12) % 12) + 1; }

    // ---------- Horóscopo diario ----------
    function daily(signIdx, date) {
        var sky = Natal.computeNatal(date || new Date(), 0, 0).planets;
        var sol = pl(sky, 'Sol'), luna = pl(sky, 'Luna'), merc = pl(sky, 'Mercurio'), ven = pl(sky, 'Venus'), mar = pl(sky, 'Marte');
        var mh = houseFrom(signIdx, luna.longitude);
        var out = [];
        out.push('La Luna está en ' + luna.zodiac.name + ' y el ánimo general es ' + MOON_SIGN[SIGNS.indexOf(luna.zodiac.name)] + '. Para vos transita tu casa ' + mh + '. ' + MOON_HOUSE[mh]);
        var sh = houseFrom(signIdx, sol.longitude);
        out.push(sh === 1 ? 'Estás en tu temporada solar: el Sol ilumina tu signo y tenés más energía y protagonismo.' :
            'El Sol ilumina ' + HOUSE_THEME[sh] + ': es el tema de fondo de estas semanas.');
        out.push('Venus está en ' + ven.zodiac.name + ' y suaviza ' + HOUSE_THEME[houseFrom(signIdx, ven.longitude)] + '; es un buen terreno para el afecto y los acuerdos.');
        out.push('Marte está en ' + mar.zodiac.name + ' y activa ' + HOUSE_THEME[houseFrom(signIdx, mar.longitude)] + '; canalizá esa energía sin impulsividad.');
        out.push(merc.is_retrograde ?
            'Mercurio está retrógrado: revisá mensajes y acuerdos antes de firmar o enviar, y dejá margen para imprevistos en tu comunicación.' :
            'Mercurio va directo: la comunicación fluye con normalidad, buen momento para decidir y hablar claro.');
        var ang = norm(luna.longitude - sol.longitude);
        var phase = ang < 22.5 || ang >= 337.5 ? 'Luna nueva: ideal para empezar algo.' : ang < 157.5 ? 'Luna creciente: energía de construir y avanzar.' :
            ang < 202.5 ? 'Luna llena: emociones a flor de piel y momentos de cierre.' : 'Luna menguante: buen momento para soltar y descansar.';
        out.push('Fase lunar: ' + phase);
        return { sign: SIGNS[signIdx], paragraphs: out };
    }

    // ---------- Compatibilidad de signos ----------
    var ELEM_PAIR = {
        '0-0': 'Fuego con Fuego: mucha chispa, pasión y energía compartida; el riesgo es competir o consumirse rápido.',
        '1-1': 'Tierra con Tierra: vínculo estable, práctico y leal; el riesgo es caer en la rutina.',
        '2-2': 'Aire con Aire: gran conexión mental y mucha conversación; el riesgo es quedarse en lo racional.',
        '3-3': 'Agua con Agua: comprensión emocional profunda e intuición; el riesgo es la dependencia o el dramatismo.',
        '0-2': 'Fuego y Aire: el aire aviva al fuego. Combinación estimulante, divertida y llena de ideas.',
        '1-3': 'Tierra y Agua: el agua nutre a la tierra. Combinación cálida, segura y constructiva.',
        '0-1': 'Fuego y Tierra: pasión con practicidad. Se complementan si respetan sus ritmos, porque uno acelera y el otro frena.',
        '0-3': 'Fuego y Agua: intensidad emocional con mucho vapor. Hay atracción, pero necesitan cuidar los choques.',
        '1-2': 'Tierra y Aire: lo concreto con lo mental. Aprenden mucho el uno del otro, aunque hablan en lenguajes distintos.',
        '2-3': 'Aire y Agua: la mente con el sentimiento. Se complementan cuando logran entender que sienten y piensan distinto.'
    };
    var MODE_TXT = {
        same: 'Comparten modalidad: se entienden en el ritmo y la forma de actuar, aunque pueden repetir los mismos puntos ciegos.',
        diff: 'Tienen modalidades distintas: uno inicia, otro sostiene o se adapta, y esa diferencia puede complementarlos.'
    };
    var ELEM_SCORE = { '0-0': 78, '1-1': 76, '2-2': 76, '3-3': 80, '0-2': 90, '1-3': 90, '0-1': 62, '0-3': 55, '1-2': 58, '2-3': 65 };

    function love(i, j, date) {
        var e1 = i % 4, e2 = j % 4, key = Math.min(e1, e2) + '-' + Math.max(e1, e2);
        var m1 = i % 3, m2 = j % 3;
        var score = ELEM_SCORE[key] + (m1 === m2 ? 2 : 3);
        var extra = [];
        if (i === j) { extra.push('Mismo signo: se ven reflejados; comprenden al otro casi sin palabras, pero también se multiplican los defectos.'); score += 2; }
        else if (Math.abs(i - j) === 6) { extra.push('Signos opuestos: hay una atracción magnética; cada uno tiene lo que al otro le falta.'); score += 5; }
        else if (Math.abs(i - j) === 3 || Math.abs(i - j) === 9) { extra.push('Signos en cuadratura: la relación exige trabajo y crecimiento, y trae mucha pasión.'); score -= 6; }
        var luna = pl(Natal.computeNatal(date || new Date(), 0, 0).planets, 'Luna');
        var le = SIGNS.indexOf(luna.zodiac.name) % 4;
        var hoy = (le === e1 || le === e2) ? 'Hoy la Luna está en ' + luna.zodiac.name + ' y favorece el clima de la pareja.' :
            'Hoy la Luna está en ' + luna.zodiac.name + ': un día neutro para el vínculo, mejor con paciencia y buena comunicación.';
        score = Math.max(30, Math.min(97, score));
        return { score: score, paragraphs: [ELEM_PAIR[key], MODE_TXT[m1 === m2 ? 'same' : 'diff']].concat(extra, [hoy]),
            elems: ELEMS[e1] + ' / ' + ELEMS[e2], modes: MODES[m1] + ' / ' + MODES[m2] };
    }

    // ---------- Sinastría ----------
    var ASP = [{ type: 'conjunción', angle: 0, orb: 8, tone: 2 }, { type: 'sextil', angle: 60, orb: 5, tone: 0 },
        { type: 'cuadratura', angle: 90, orb: 7, tone: 1 }, { type: 'trígono', angle: 120, orb: 7, tone: 0 }, { type: 'oposición', angle: 180, orb: 8, tone: 1 }];
    var PAIR2 = {
        'Sol|Luna': ['Su voluntad y sus emociones se acompañan: uno da luz y el otro contención; es una de las mejores señales de afinidad.',
            'Lo que uno quiere y lo que el otro necesita no siempre coincide; se piden cosas distintas, pero pueden aprender mucho.',
            'Fuerte conexión de fondo: uno ilumina lo que el otro siente; hay una sensación de conocerse desde siempre.'],
        'Venus|Marte': ['Atracción física y química natural; el deseo y el afecto se complementan con facilidad.',
            'Hay chispa y pasión, con algo de roce; la atracción es fuerte pero necesita comunicación.',
            'Magnetismo muy intenso: la atracción es inmediata y fuerte.'],
        'Sol|Venus': ['Se caen bien y se valoran; hay cariño, admiración y afecto sencillo.',
            'Se quieren, pero pueden querer cosas distintas del amor; conviene hablar de expectativas.',
            'Una unión afectuosa: uno se siente querido y valorado por el otro.'],
        'Luna|Venus': ['Ternura, comprensión emocional y comodidad; un vínculo cariñoso y natural.',
            'El afecto está, pero puede haber malos entendidos entre cómo se cuida y cómo se ama.',
            'Cariño profundo y sensibilidad compartida; se cuidan de forma natural.'],
        'Luna|Luna': ['Sienten de manera parecida y se dan seguridad emocional.',
            'Sus necesidades emocionales son distintas; requieren paciencia para comprenderse.',
            'Comprensión emocional casi instintiva: se leen sin hablar.'],
        'Sol|Sol': ['Sus objetivos y estilos se llevan bien; se respetan como personas.',
            'Sus voluntades pueden chocar; aprender a ceder fortalece la relación.',
            'Se parecen en lo esencial; se reconocen y se apoyan, aunque compiten por el protagonismo.'],
        'Venus|Venus': ['Comparten valores, gustos y estilo de querer; el afecto fluye.',
            'Sus maneras de amar no coinciden del todo; pueden aprender a valorar la diferencia.',
            'Comparten una forma de amar muy parecida; hay armonía y buen gusto en común.'],
        'Marte|Marte': ['Se entienden a la hora de actuar y avanzar juntos; buen equipo.',
            'Pueden discutir o competir; el reto es no convertir la energía en pelea.',
            'Mucha energía compartida; pueden sumar fuerzas o chocar según cómo la usen.'],
        'Mercurio|Mercurio': ['Conversan con facilidad y se entienden; excelente comunicación.',
            'Piensan distinto y pueden malinterpretarse; conviene explicar más de lo que se cree necesario.',
            'Sus mentes conectan rápido; comparten el mismo ritmo de ideas.'],
        'Sol|Marte': ['Se estimulan e impulsan; hay energía y motivación mutua.',
            'Chispa con algo de tensión: se retan y pueden discutir, pero también se movilizan.',
            'Energía combinada muy fuerte; se dan empuje pero pueden competir.'],
        'Luna|Marte': ['Se activan y protegen mutuamente; hay pasión con contención.',
            'Uno puede irritar la sensibilidad del otro; hay que cuidar el tono.',
            'Emoción y deseo se mezclan de forma intensa; hay pasión y reactividad.'],
        'Sol|Saturno': ['Uno aporta estabilidad y compromiso al otro; una base sólida a largo plazo.',
            'Uno puede sentir al otro como exigente o limitante; requiere madurez para no crear distancia.',
            'Relación seria y con compromiso, aunque puede sentirse pesada si falta ligereza.'],
        'Luna|Saturno': ['Seguridad y constancia emocional: uno da estructura al otro.',
            'Uno puede sentir frialdad o exigencia del otro; hace falta expresar más cariño.',
            'Un vínculo de compromiso emocional profundo; puede ser protector o algo contenido.']
    };

    function pairKey(a, b) { return PAIR2[a + '|' + b] ? a + '|' + b : (PAIR2[b + '|' + a] ? b + '|' + a : null); }

    function synastry(A, B) {
        var pa = A.planets.filter(function (p) { return p.name !== 'Nodo Norte'; });
        var pb = B.planets.filter(function (p) { return p.name !== 'Nodo Norte'; });
        var found = [];
        pa.forEach(function (x) {
            pb.forEach(function (y) {
                var d = Math.abs(x.longitude - y.longitude) % 360; if (d > 180) d = 360 - d;
                for (var k = 0; k < ASP.length; k++) {
                    var diff = Math.abs(d - ASP[k].angle);
                    if (diff <= ASP[k].orb) { found.push({ a: x.name, b: y.name, asp: ASP[k], orb: diff }); break; }
                }
            });
        });
        found.sort(function (u, v) { return u.orb - v.orb; });
        var score = 50, cards = [];
        found.forEach(function (f) {
            var k = pairKey(f.a, f.b);
            if (!k) return;
            var w = (f.orb < 2 ? 1 : f.orb < 5 ? 0.7 : 0.4);
            score += (f.asp.tone === 1 ? -3 : 3) * w * (k === 'Sol|Luna' || k === 'Venus|Marte' ? 2 : 1);
            cards.push({ title: 'Persona 1: ' + f.a + ' ' + f.asp.type + ' ' + f.b + ' de Persona 2 (orbe ' + f.orb.toFixed(1) + '°)',
                text: PAIR2[k][f.asp.tone] });
        });
        // Sol y Luna de cada persona por elementos
        var sA = pl(A.planets, 'Sol'), sB = pl(B.planets, 'Sol'), lA = pl(A.planets, 'Luna'), lB = pl(B.planets, 'Luna');
        var signs = love(SIGNS.indexOf(sA.zodiac.name), SIGNS.indexOf(sB.zodiac.name));
        var moons = love(SIGNS.indexOf(lA.zodiac.name), SIGNS.indexOf(lB.zodiac.name));
        score += (signs.score - 70) / 6 + (moons.score - 70) / 6;
        score = Math.max(20, Math.min(97, Math.round(score)));
        return { score: score, cards: cards.slice(0, 12),
            sunText: 'Sol en ' + sA.zodiac.name + ' con Sol en ' + sB.zodiac.name + ': ' + signs.paragraphs[0],
            moonText: 'Luna en ' + lA.zodiac.name + ' con Luna en ' + lB.zodiac.name + ': ' + moons.paragraphs[0] };
    }

    root.Horo = { daily: daily, love: love, synastry: synastry, esc: esc };
})(typeof window !== 'undefined' ? window : globalThis);
