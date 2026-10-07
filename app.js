        // Si el usuario vuelve de pagar (Mercado Pago o la vuelta manual desde su app), no tapar
        // la pantalla con el cartel de bienvenida: ya sabemos que quiere ver su lectura.
        var __mpPagoReturn = /[?&]pago=exito(&|$)/.test(location.search) && /[?&]payment_id=/.test(location.search);

        const canvas = document.getElementById('stars-canvas');
        const ctx = canvas.getContext('2d');
        let stars = [], W, H;
        function resizeCanvas() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        function createStars(c) {
            stars = [];
            for (let i = 0; i < c; i++) stars.push({
                x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.8+0.3,
                dx: (Math.random()-0.5)*0.15, dy: (Math.random()-0.5)*0.15,
                alpha: Math.random()*0.8+0.2, pulseSpeed: Math.random()*0.02+0.005,
                pulsePhase: Math.random()*Math.PI*2
            });
        }
        createStars(500);
        function drawStars(t) {
            ctx.clearRect(0,0,W,H);
            for (const s of stars) {
                s.x+=s.dx; s.y+=s.dy;
                if(s.x<0)s.x=W;if(s.x>W)s.x=0;if(s.y<0)s.y=H;if(s.y>H)s.y=0;
                const p=0.5+0.5*Math.sin(t*s.pulseSpeed+s.pulsePhase);
                const a=s.alpha*p;
                ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
                const purple = 200 + Math.floor(55 * (0.5 + 0.5 * Math.sin(t*0.003 + s.x*0.01)));
                ctx.fillStyle='rgba('+purple+','+Math.floor(purple*0.85)+',255,'+a*0.7+')'; ctx.fill();
                if (s.r > 1.2) {
                    ctx.beginPath(); ctx.arc(s.x,s.y,s.r*2.5,0,Math.PI*2);
                    ctx.fillStyle='rgba(100,50,180,'+a*0.04+')'; ctx.fill();
                }
            }
            requestAnimationFrame(drawStars);
        }
        requestAnimationFrame(drawStars);

        // === DATOS DE TODAS LAS 78 CARTAS ===
        var _cardSeq = 0;
        function imgPath(ri, ci) {
            var idx = _cardSeq;
            _cardSeq++;
            return 'images/cards/card_' + (idx < 10 ? '00' : idx < 100 ? '0' : '') + idx + '.webp';
        }

        var cardSymbols = {
  major: {
    "El Loco": {sym:"☄", descG:"Cometa errante, potencial infinito"},
    "El Mago": {sym:"⚡", descG:"Poder divino, manifestacion, canal"},
    "La Sacerdotisa": {sym:"☽", descG:"Luna creciente, misterio, intuicion"},
    "La Emperatriz": {sym:"✿", descG:"Flor de vida, fertilidad, naturaleza"},
    "El Emperador": {sym:"♔", descG:"Corona, autoridad, poder terrenal"},
    "El Sumo Sacerdote": {sym:"✝", descG:"Cruz espiritual, ensenanza divina"},
    "Los Enamorados": {sym:"⚤", descG:"Union de opuestos, eleccion del alma"},
    "El Carro": {sym:"⚙", descG:"Voluntad, determinacion, victoria"},
    "La Fuerza": {sym:"∞", descG:"Fortaleza interior, dominio, coraje"},
    "El Ermitaño": {sym:"✦", descG:"Luz interior, sabiduria, introspeccion"},
    "Rueda de la Fortuna": {sym:"☸", descG:"Rueda del destino, ciclos, cambio"},
    "La Justicia": {sym:"⚖", descG:"Balanza, equilibrio, verdad, karma"},
    "El Colgado": {sym:"⊜", descG:"Sacrificio, nueva perspectiva, entrega"},
    "La Muerte": {sym:"☠", descG:"Transformacion, renacimiento, final"},
    "La Templanza": {sym:"⏗", descG:"Alquimia, equilibrio de fuerzas, armonia"},
    "El Diablo": {sym:"⛧", descG:"Sombra, atadura, deseo material"},
    "La Torre": {sym:"⛏", descG:"Colapso, revelacion, derrumbe"},
    "La Estrella": {sym:"✧", descG:"Esperanza, guia espiritual, inspiracion"},
    "La Luna": {sym:"☾", descG:"Ilusion, subconsciente, miedo"},
    "El Sol": {sym:"☀", descG:"Alegria, vitalidad, exito, verdad"},
    "El Juicio": {sym:"⁜", descG:"Despertar espiritual, llamado superior"},
    "El Mundo": {sym:"◉", descG:"Totalidad, culminacion, cosmos"},
  },
  wands: {
    "As de Bastos": {sym:"♣", descG:"Chispa divina, fuego creador, inicio"},
    "2 de Bastos": {sym:"⚶", descG:"Vision, planificacion, horizontes"},
    "3 de Bastos": {sym:"⟐", descG:"Exploracion, expansion, crecimiento"},
    "4 de Bastos": {sym:"⌂", descG:"Hogar, celebracion, harmonia"},
    "5 de Bastos": {sym:"⚔", descG:"Conflicto, competencia, desafio"},
    "6 de Bastos": {sym:"♛", descG:"Victoria, reconocimiento, triunfo"},
    "7 de Bastos": {sym:"⛊", descG:"Defensa, perseverancia, posicion"},
    "8 de Bastos": {sym:"➤", descG:"Velocidad, movimiento, accion"},
    "9 de Bastos": {sym:"⊛", descG:"Resiliencia, fortaleza, defensa"},
    "10 de Bastos": {sym:"⌺", descG:"Presion, carga, responsabilidad"},
    "Paje de Bastos": {sym:"☄", descG:"Entusiasmo, explorador, mensajero"},
    "Caballero de Bastos": {sym:"♞", descG:"Accion, aventura, pasion"},
    "Reina de Bastos": {sym:"✦", descG:"Calidez, carisma, determinacion"},
    "Rey de Bastos": {sym:"♔", descG:"Liderazgo, vision, autoridad"},
  },
  cups: {
    "As de Copas": {sym:"♡", descG:"Amor, apertura del corazon, conexion"},
    "2 de Copas": {sym:"⚤", descG:"Union de almas, amor reciproco"},
    "3 de Copas": {sym:"✿", descG:"Celebracion, amistad, alegria"},
    "4 de Copas": {sym:"⊟", descG:"Meditacion, apatia, oportunidad oculta"},
    "5 de Copas": {sym:"⌓", descG:"Perdida, duelo, arrepentimiento"},
    "6 de Copas": {sym:"✽", descG:"Nostalgia, recuerdos, ninez"},
    "7 de Copas": {sym:"⟟", descG:"Ilusiones, fantasia, elecciones"},
    "8 de Copas": {sym:"⤴", descG:"Abandono, busqueda, renuncia"},
    "9 de Copas": {sym:"☀", descG:"Satisfaccion, abundancia emocional"},
    "10 de Copas": {sym:"♥", descG:"Amor pleno, familia, felicidad"},
    "Paje de Copas": {sym:"☿", descG:"Intuicion, mensajero, sueno"},
    "Caballero de Copas": {sym:"♞", descG:"Romance, imaginacion, propuesta"},
    "Reina de Copas": {sym:"☾", descG:"Empatia, curacion, oceano emocional"},
    "Rey de Copas": {sym:"♔", descG:"Madurez emocional, compasion"},
  },
  swords: {
    "As de Espadas": {sym:"✦", descG:"Claridad mental, verdad, justicia"},
    "2 de Espadas": {sym:"⚖", descG:"Decision bloqueada, punto muerto"},
    "3 de Espadas": {sym:"⌓", descG:"Dolor,traicion, corazon herido"},
    "4 de Espadas": {sym:"⊟", descG:"Descanso, meditacion, recuperacion"},
    "5 de Espadas": {sym:"⚔", descG:"Conflicto, derrota, tension"},
    "6 de Espadas": {sym:"➤", descG:"Transicion, viaje, dejar atras"},
    "7 de Espadas": {sym:"⟟", descG:"Estrategia, astucia, engano"},
    "8 de Espadas": {sym:"⊛", descG:"Restriccion, confusion, paralisis"},
    "9 de Espadas": {sym:"⌓", descG:"Ansiedad, pesadillas, miedo"},
    "10 de Espadas": {sym:"✝", descG:"Final doloroso, renacimiento"},
    "Paje de Espadas": {sym:"☿", descG:"Vigilancia, ideas, curiosidad"},
    "Caballero de Espadas": {sym:"♞", descG:"Determinacion, mental, guerrero"},
    "Reina de Espadas": {sym:"✦", descG:"Claridad, independencia, verdad"},
    "Rey de Espadas": {sym:"♔", descG:"Autoridad mental, etica, justicia"},
  },
  pentacles: {
    "As de Oros": {sym:"♦", descG:"Semilla de abundancia, creacion"},
    "2 de Oros": {sym:"⚶", descG:"Equilibrio, cambio, adaptacion"},
    "3 de Oros": {sym:"⟐", descG:"Trabajo en equipo, maestria"},
    "4 de Oros": {sym:"⊟", descG:"Control, estabilidad, ahorro"},
    "5 de Oros": {sym:"⌓", descG:"Dificultad, perdida, escasez"},
    "6 de Oros": {sym:"⚖", descG:"Caridad, generosidad, equilibrio"},
    "7 de Oros": {sym:"⊛", descG:"Evaluacion, paciencia, crecimiento"},
    "8 de Oros": {sym:"✦", descG:"Dedicacion, aprendizaje, artesania"},
    "9 de Oros": {sym:"☀", descG:"Abundancia, lujo, exito"},
    "10 de Oros": {sym:"♛", descG:"Legado, herencia, tradicion"},
    "Paje de Oros": {sym:"☄", descG:"Aprendiz, estudio, proyecto"},
    "Caballero de Oros": {sym:"♞", descG:"Perseverancia, responsabilidad"},
    "Reina de Oros": {sym:"✿", descG:"Abundancia, nutricion, tierra"},
    "Rey de Oros": {sym:"♔", descG:"Prosperidad, estabilidad, exito"},
  },
};

        function getCardSymbol(name, suit) {
            return cardSymbols[suit] && cardSymbols[suit][name] ? cardSymbols[suit][name].sym : '';
        }

        var cardData = {
            major: [
                {num:'0',name:'El Loco',img:imgPath(0,0),sig:'Urano',casa:'1ª',sigL:'Urano/Acuario',desc:'Inicio, inocencia, libertad. El alma que se lanza al vacío sin mirar atrás. Representa el espíritu libre que emprende un viaje sin mapa, confiando en el universo. Nos recuerda que cada gran aventura comienza con un salto de fe y que la verdadera sabiduría está en atreverse a ser vulnerable ante lo desconocido.',feat:true},
                {num:'I',name:'El Mago',img:imgPath(0,1),sig:'Mercurio',casa:'1ª',sigL:'Mercurio',desc:'Poder, habilidad, manifestación. Canaliza la energía divina hacia lo terrenal. El Mago domina los cuatro elementos y los dirige con voluntad consciente. Representa el momento en que reconoces tus talentos únicos y los pones al servicio de tu propósito, recordándote que tienes todas las herramientas necesarias para crear tu realidad.',feat:true},
                {num:'II',name:'La Sacerdotisa',img:imgPath(0,2),sig:'Luna',casa:'8ª',sigL:'Luna/Cáncer',desc:'Intuición, misterio, sabiduría interior. Guarda los secretos del inconsciente. Ella se sienta entre los pilares del conocimiento consciente y oculto, invitándote a mirar más allá de lo evidente. Representa la conexión con tu voz interna, esa sabiduría silenciosa que emerge cuando aquietas la mente y escuchas los susurros del alma.',feat:true},
                {num:'III',name:'La Emperatriz',img:imgPath(0,3),sig:'Venus',casa:'3ª',sigL:'Venus/Tauro',desc:'Fertilidad, abundancia, naturaleza. La madre universal que nutre todo lo que crece. Ella encarna el poder creador de la naturaleza en su máxima expresión. Te invita a conectarte con los ciclos de la vida, a florecer en tu propio tiempo y a recibir la abundancia que el universo tiene para ofrecerte cuando estás en armonía con tu esencia.',feat:false},
                {num:'IV',name:'El Emperador',img:imgPath(0,4),sig:'Aries',casa:'10ª',sigL:'Aries',desc:'Autoridad, estructura, poder. El liderazgo y la solidez de las instituciones. Representa la fuerza yang, el padre protector que establece leyes y fronteras. Te llama a tomar el control de tu vida con disciplina y responsabilidad, construyendo cimientos sólidos sobre los cuales puedas edificar tus sueños más ambiciosos.',feat:false},
                {num:'V',name:'El Sumo Sacerdote',img:imgPath(0,5),sig:'Tauro',casa:'9ª',sigL:'Tauro',desc:'Tradición, enseñanza, espiritualidad. El puente entre lo divino y lo humano. Es el guardián del conocimiento sagrado y las enseñanzas ancestrales. Te invita a buscar mentores, estudiar las tradiciones espirituales y encontrar la sabiduría en los rituales que conectan a la humanidad con lo trascendente a lo largo del tiempo.',feat:false},
                {num:'VI',name:'Los Enamorados',img:imgPath(0,6),sig:'Géminis',casa:'5ª',sigL:'Géminis',desc:'Amor, unión, elección. La encrucijada del alma entre el deseo y el deber. No solo habla del amor romántico sino de las decisiones cruciales que definen tu camino. Representa el momento de alinear tu corazón con tu propósito, eligiendo desde la autenticidad y sabiendo que cada decisión amorosa es un acto de valentía.',feat:true},
                {num:'VII',name:'El Carro',img:imgPath(0,7),sig:'Cáncer',casa:'7ª',sigL:'Cáncer',desc:'Victoria, voluntad, determinación. El triunfo sobre los opuestos internos. Guiado por la fuerza de voluntad, el auriga domina dos caballos que tiran en direcciones opuestas. Representa tu capacidad para superar obstáculos mediante la concentración y la disciplina, avanzando hacia tus metas con la certeza de quien ha domado sus propias contradicciones.',feat:false},
                {num:'VIII',name:'La Fuerza',img:imgPath(0,8),sig:'Leo',casa:'11ª',sigL:'Leo',desc:'Fortaleza, coraje, compasión. El poder sereno de domar la bestia interior. No es la fuerza bruta sino el dominio tranquilo de los instintos primarios. Te recuerda que la verdadera fortaleza reside en la paciencia, la dulzura y la capacidad de enfrentar tus miedos con amor en lugar de agresión.',feat:true},
                {num:'IX',name:'El Ermitaño',img:imgPath(0,9),sig:'Virgo',casa:'9ª',sigL:'Virgo',desc:'Soledad, introspección. La lámpara que ilumina el camino interior. Lleva su luz en lo alto, buscando respuestas en el silencio de la montaña. Te invita a retirarte del ruido exterior para encontrar la verdad dentro de ti, recordándote que la sabiduría nace en la soledad elegida y se comparte desde la autenticidad.',feat:false},
                {num:'X',name:'Rueda de la Fortuna',img:imgPath(0,10),sig:'Júpiter',casa:'5ª',sigL:'Júpiter/Sagitario',desc:'Destino, cambio, ciclos. La rueda cósmica que gira sin cesar. Nos recuerda que la vida es un ciclo constante de altibajos, éxitos y desafíos. Cuando aparece, señala que el cambio es inevitable y necesario, invitándote a fluir con las circunstancias porque lo que baja volverá a subir y viceversa.',feat:true},
                {num:'XI',name:'La Justicia',img:imgPath(0,11),sig:'Libra',casa:'7ª',sigL:'Libra',desc:'Equilibrio, verdad, consecuencias. La balanza de la causa y el efecto. Ella no juzga desde el castigo sino desde la ecuanimidad más pura. Te llama a asumir la responsabilidad de tus actos, a buscar la verdad con honestidad y a restaurar el equilibrio en áreas de tu vida donde la balanza se ha inclinado.',feat:false},
                {num:'XII',name:'El Colgado',img:imgPath(0,12),sig:'Neptuno',casa:'12ª',sigL:'Neptuno/Piscis',desc:'Sacrificio, rendición, nueva perspectiva. Ver el mundo desde otro ángulo. Suspendido boca abajo, encuentra la paz en la entrega total. Representa el momento en que debes soltar el control, detener la resistencia y mirar la situación desde una perspectiva radicalmente diferente para encontrar la solución.',feat:false},
                {num:'XIII',name:'La Muerte',img:imgPath(1,0),sig:'Escorpio',casa:'8ª',sigL:'Escorpio',desc:'Transformación, renacimiento. El final de un ciclo y el nacimiento de lo nuevo. No es la muerte física sino la muerte de lo que ya no te sirve. Te invita a dejar ir relaciones, patrones o creencias que han caducado, confiando en que el vacío que dejan será llenado por algo más auténtico y vivo.',feat:true},
                {num:'XIV',name:'La Templanza',img:imgPath(1,1),sig:'Sagitario',casa:'6ª',sigL:'Sagitario',desc:'Equilibrio, moderación, armonía. La fusión de los opuestos. El ángel mezcla agua y fuego sin que ninguno extinga al otro. Representa la virtud de encontrar el punto medio, la paciencia para dejar que las cosas maduren y la maestría de integrar las polaridades de tu ser en una danza armónica.',feat:false},
                {num:'XV',name:'El Diablo',img:imgPath(1,2),sig:'Capricornio',casa:'6ª',sigL:'Capricornio',desc:'Sombra, adicción. Enfrentar las cadenas que nos atamos a nosotros mismos. Representa las ataduras del mundo material, los vicios y las creencias limitantes que nos mantienen prisioneros. Te confronta con tu propia sombra para que reconozcas aquello que te esclaviza y encuentres la fuerza para liberarte.',feat:false},
                {num:'XVI',name:'La Torre',img:imgPath(1,3),sig:'Marte',casa:'8ª',sigL:'Marte/Aries',desc:'Caos, revelación. El colapso que destruye ilusiones y abre paso a la verdad. Un rayo derriba la estructura más sólida, revelando lo que estaba oculto. Aunque violenta, esta carta trae la liberación que sigue a una crisis necesaria, derrumbando las falsas creencias para que puedas reconstruir desde cimientos más auténticos.',feat:true},
                {num:'XVII',name:'La Estrella',img:imgPath(1,4),sig:'Acuario',casa:'11ª',sigL:'Acuario',desc:'Esperanza, inspiración. La estrella que guía hacia la sanación y la paz. Después de la tormenta de la Torre, llega la calma serena de la Estrella. Representa la renovación de la fe, la conexión con tu propósito superior y la confianza en que el universo te sostiene en su manto de luz.',feat:true},
                {num:'XVIII',name:'La Luna',img:imgPath(1,5),sig:'Piscis',casa:'12ª',sigL:'Piscis',desc:'Ilusión, miedo, subconsciente. Navegar las aguas profundas del inconsciente. Iluminada por una luz incierta, revela sombras y criaturas ocultas. Te advierte que no todo es lo que parece y te invita a explorar tus miedos más profundos, recordando que la oscuridad también contiene mensajes valiosos para tu evolución.',feat:false},
                {num:'XIX',name:'El Sol',img:imgPath(1,6),sig:'Sol',casa:'5ª',sigL:'Sol/Leo',desc:'Alegría, éxito, vitalidad. La carta más positiva: luz y plenitud. Disipa todas las sombras y revela la verdad en su máxima expresión. Representa la alegría sin condiciones, la confianza radiante y la celebración de la vida. Te recuerda que mereces ser feliz y brillar con luz propia.',feat:true},
                {num:'XX',name:'El Juicio',img:imgPath(1,7),sig:'Plutón',casa:'4ª',sigL:'Plutón/Escorpio',desc:'Renacimiento, llamado superior. El despertar espiritual y la absolución. Las trompetas anuncian un despertar, una llamada a elevarte hacia tu versión más elevada. Representa el momento de la rendición de cuentas contigo mismo, donde dejas atrás el pasado y respondes al llamado de tu propósito más auténtico.',feat:false},
                {num:'XXI',name:'El Mundo',img:imgPath(1,8),sig:'Saturno',casa:'10ª',sigL:'Saturno/Capricornio',desc:'Completitud, totalidad. La culminación del viaje del alma. La última carta del viaje simboliza la integración de todas las lecciones aprendidas. Has completado un ciclo importante y te encuentras en un estado de plenitud y realización, listo para celebrar tus logros y prepararte para el próximo gran ciclo.',feat:true}
            ],
            wands: [
                {num:'1',name:'As de Bastos',img:imgPath(1,9),sig:'Marte',casa:'1ª',sigL:'Aries',desc:'Chispa divina, inspiración, nuevo comienzo. El fuego creador que impulsa la acción. Representa el momento de la concepción de una idea, ese instante de claridad donde sientes el llamado a crear algo nuevo. Esta carta te anima a confiar en esa chispa interior y a dar el primer paso hacia lo que tu corazón anhela, porque el universo sostiene tu impulso inicial.'},
                {num:'2',name:'2 de Bastos',img:imgPath(1,10),sig:'Marte',casa:'1ª',sigL:'Aries',desc:'Planificación, visión, futuro. Mirar hacia adelante con poder y posesión. Sostienes el mundo en tus manos y contemplas horizontes lejanos. Representa el momento en que ya tienes una visión clara de lo que quieres y comienzas a planificar cómo alcanzarlo. Te invita a salir de tu zona de confort y expandir tus límites.'},
                {num:'3',name:'3 de Bastos',img:imgPath(1,11),sig:'Sol',casa:'1ª',sigL:'Aries',desc:'Expansión, exploración. El éxito que llega después de la planificación. Tus barcos han zarpado y observas el horizonte con confianza. Esta carta confirma que tus planes están dando frutos y que la expansión que buscabas está en marcha. Es el momento de mantener la fe y permitir que tus proyectos crezcan orgánicamente.'},
                {num:'4',name:'4 de Bastos',img:imgPath(1,12),sig:'Venus',casa:'1ª',sigL:'Aries',desc:'Celebración, armonía, hogar. La alegría de los logros compartidos. Los pilares están firmes y bajo el arco de flores celebras tus éxitos. Representa la estabilidad alcanzada, el merecido descanso después del esfuerzo y la alegría de compartir tus triunfos con quienes amas. Es un recordatorio de celebrar cada paso del camino.'},
                {num:'5',name:'5 de Bastos',img:imgPath(2,0),sig:'Saturno',casa:'1ª',sigL:'Leo',desc:'Conflicto, competencia, desafío. La lucha que forja el carácter. Bastos entrecruzados en el aire, energías que chocan en busca de dirección. Representa los conflictos inevitables del crecimiento, las diferencias de opinión que ponen a prueba tu determinación. Te invita a ver estos desafíos como oportunidades para fortalecer tu carácter.'},
                {num:'6',name:'6 de Bastos',img:imgPath(2,1),sig:'Júpiter',casa:'1ª',sigL:'Leo',desc:'Victoria, reconocimiento, confianza. El triunfo público y la admiración. Regresas victorioso montado a caballo mientras las multitudes te aclaman. Esta carta trae el reconocimiento que has merecido por tu esfuerzo y dedicación. Disfruta del éxito pero mantente humilde, recordando que el verdadero líder sirve a quienes lo siguen.'},
                {num:'7',name:'7 de Bastos',img:imgPath(2,2),sig:'Marte',casa:'1ª',sigL:'Leo',desc:'Desafío, defensa, perseverancia. Mantener la posición ante la adversidad. Desde lo alto defiendes tu terreno contra las críticas y opositores. Representa la necesidad de mantener firmes tus convicciones cuando otros cuestionan tu camino. No se trata de atacar sino de proteger lo que has construido con integridad y valentía.'},
                {num:'8',name:'8 de Bastos',img:imgPath(2,3),sig:'Mercurio',casa:'1ª',sigL:'Sagitario',desc:'Velocidad, movimiento, flechas del amor. La acción rápida y el cambio. Bastos surcando el cielo en perfecta sincronía, imparable. Anuncia un período de avances rápidos, comunicaciones repentinas y cambios que ocurren a gran velocidad. Prepárate para recibir noticias y para actuar con rapidez aprovechando el impulso del momento.'},
                {num:'9',name:'9 de Bastos',img:imgPath(2,4),sig:'Luna',casa:'1ª',sigL:'Sagitario',desc:'Resiliencia, última defensa. La fuerza para seguir adelante a pesar del cansancio. Vendado y agotado, aún sostienes tu bastón en posición de defensa. Representa la etapa final de una batalla larga, donde la perseverancia es tu única arma. Te recuerda que la última milla es la más dura pero también la que más te fortalece.'},
                {num:'10',name:'10 de Bastos',img:imgPath(2,5),sig:'Saturno',casa:'1ª',sigL:'Sagitario',desc:'Carga, responsabilidad, presión. El peso de las obligaciones. Agobiado por el peso de diez bastos, apenas puedes ver el camino. Representa las responsabilidades que has acumulado y que ahora te agotan. Te invita a evaluar qué cargas son realmente tuyas y cuáles puedes delegar o soltar antes de que el peso te derrumbe.'},
                {num:'P',name:'Paje de Bastos',img:imgPath(2,6),sig:'Marte',casa:'1ª',sigL:'Aries',desc:'Entusiasmo, exploración, noticias. El mensajero del fuego creador. Joven y vibrante, contempla su bastón con la mirada llena de posibilidades. Trae noticias emocionantes y el impulso de comenzar algo nuevo. Representa la energía fresca del principiante que se lanza con pasión a explorar territorios desconocidos.'},
                {num:'C',name:'Caballero de Bastos',img:imgPath(2,7),sig:'Marte',casa:'1ª',sigL:'Aries',desc:'Acción, aventura, pasión. El guerrero del fuego que cabalga hacia su destino. Montado a caballo con su bastón en alto, avanza con determinación ardiente. Representa la acción impulsiva y apasionada, la necesidad de moverse sin dudar. Te llama a perseguir tus metas con energía imparable, pero cuidando no quemarte en el proceso.'},
                {num:'Q',name:'Reina de Bastos',img:imgPath(2,8),sig:'Venus',casa:'1ª',sigL:'Leo',desc:'Calidez, determinación, carisma. La madurez del fuego en su expresión más radiante. Ella irradia confianza y creatividad, su mirada segura inspira a quienes la rodean. Representa el dominio del fuego interior: pasión temperada por sabiduría, acción guiada por visión. Te invita a liderar con el ejemplo y a encender la chispa en otros.'},
                {num:'K',name:'Rey de Bastos',img:imgPath(2,9),sig:'Marte',casa:'1ª',sigL:'Leo',desc:'Liderazgo, visión, poder. El dominio del fuego y la autoridad natural. Sentado en su trono rodeado de llamas, el Rey de Bastos ha dominado el elemento del fuego. Representa al líder nato que inspira con su visión y valentía. Te llama a asumir tu poder con responsabilidad, a actuar con integridad y a encender el camino para quienes te siguen.'}
            ],
            cups: [
                {num:'1',name:'As de Copas',img:imgPath(2,10),sig:'Venus',casa:'1ª',sigL:'Cáncer',desc:'Amor, apertura emocional, nueva conexión. El manantial del corazón. Una copa dorada de la que fluye agua cristalina, ofreciendo amor incondicional. Representa el comienzo de una nueva etapa emocional, la apertura del corazón al amor y la conexión profunda. Te invita a recibir y dar afecto con la pureza del alma abierta.'},
                {num:'2',name:'2 de Copas',img:imgPath(2,11),sig:'Venus',casa:'1ª',sigL:'Cáncer',desc:'Unión, amor recíproco, conexión. El encuentro de dos almas. Dos copas elevadas en señal de celebración y reconocimiento mutuo. Representa las relaciones armoniosas, el amor que fluye en ambas direcciones y la asociación basada en el respeto y la igualdad. Es la carta del amor correspondido y las alianzas sinceras.'},
                {num:'3',name:'3 de Copas',img:imgPath(2,12),sig:'Mercurio',casa:'1ª',sigL:'Cáncer',desc:'Celebración, amistad, alegría. La abundancia del corazón compartido. Tres mujeres elevan sus copas en una danza de gratitud y hermandad. Representa la alegría de compartir con amigos, las celebraciones comunitarias y los momentos de felicidad colectiva. Te recuerda que la abundancia se multiplica cuando se comparte.'},
                {num:'4',name:'4 de Copas',img:imgPath(3,0),sig:'Luna',casa:'1ª',sigL:'Escorpio',desc:'Apatía, meditación, oportunidades no vistas. La insatisfacción interior. Sentado bajo un árbol, mira fijamente tres copas mientras una cuarta le es ofrecida desde el cielo. Representa el momento de estancamiento emocional donde no ves las oportunidades que se te presentan. Te invita a salir de la apatía y abrir los ojos a lo nuevo.'},
                {num:'5',name:'5 de Copas',img:imgPath(3,1),sig:'Marte',casa:'1ª',sigL:'Escorpio',desc:'Pérdida, duelo, arrepentimiento. Mirar atrás con tristeza. Una figura con manto negro llora sobre tres copas derramadas mientras dos permanecen en pie detrás. Representa el dolor de la pérdida y la tendencia a enfocarse en lo que falta en lugar de lo que aún queda. Te recuerda que detrás de toda pérdida hay una oportunidad de renovación.'},
                {num:'6',name:'6 de Copas',img:imgPath(3,2),sig:'Sol',casa:'1ª',sigL:'Escorpio',desc:'Nostalgia, recuerdos, inocencia. La pureza del pasado que reconforta. Dos niños en un jardín compartiendo flores, evocando la inocencia perdida. Representa los recuerdos felices, la nostalgia por tiempos pasados y las conexiones que te formaron. Te invita a honrar tu pasado sin quedarte atrapado en él, extrayendo la dulzura sin el apego.'},
                {num:'7',name:'7 de Copas',img:imgPath(3,3),sig:'Venus',casa:'1ª',sigL:'Piscis',desc:'Ilusiones, fantasía, elecciones. Las múltiples posibilidades del deseo. Siete copas flotando en el aire, cada una con una visión tentadora. Representa la confusión ante demasiadas opciones y el peligro de perderse en fantasías. Te advierte sobre las ilusiones que te distraen de tu camino verdadero y te pide claridad mental.'},
                {num:'8',name:'8 de Copas',img:imgPath(3,4),sig:'Saturno',casa:'1ª',sigL:'Piscis',desc:'Abandono, búsqueda, renuncia. Dejar atrás lo conocido por lo desconocido. Una figura camina hacia la montaña dejando atrás ocho copas apiladas. Representa la valentía de abandonar lo seguro en busca de un propósito más elevado. Te llama a dejar atrás lo que ya no te nutre espiritualmente, aunque duela.'},
                {num:'9',name:'9 de Copas',img:imgPath(3,5),sig:'Júpiter',casa:'1ª',sigL:'Piscis',desc:'Satisfacción, abundancia emocional. El deseo cumplido y la felicidad plena. Sentado con los brazos cruzados y las nueve copas dispuestas en arco, sonríe satisfecho. Representa la realización de los deseos, la abundancia emocional y la satisfacción profunda. Es la carta de los sueños cumplidos y la autoestima plena.'},
                {num:'10',name:'10 de Copas',img:imgPath(3,6),sig:'Marte',casa:'1ª',sigL:'Piscis',desc:'Felicidad total, armonía familiar. La realización del amor incondicional. Una familia con los brazos alzados bajo un arco iris de diez copas celestiales. Representa la felicidad completa, la armonía en el hogar y el amor incondicional que trasciende generaciones. Es la promesa de un corazón pleno y un legado de amor.'},
                {num:'P',name:'Paje de Copas',img:imgPath(3,7),sig:'Marte',casa:'1ª',sigL:'Cáncer',desc:'Intuición, sensibilidad, mensaje del corazón. El soñador emocional. Joven con una copa de la que emerge un pez, símbolo del mensaje del inconsciente. Trae noticias del corazón, inspiración creativa y una invitación a explorar tu mundo emocional. Representa la disposición a recibir la sabiduría de tus sueños.'},
                {num:'C',name:'Caballero de Copas',img:imgPath(3,8),sig:'Marte',casa:'1ª',sigL:'Cáncer',desc:'Romance, imaginación, propuesta. El caballero que sigue su corazón. Avanza lentamente con su copa en alto, ofreciendo amor y devoción. Representa la llegada de una propuesta romántica, la búsqueda del ideal y la entrega sincera. Te invita a seguir tus sueños con la misma pasión con la que este caballero persigue su visión.'},
                {num:'Q',name:'Reina de Copas',img:imgPath(3,9),sig:'Venus',casa:'1ª',sigL:'Piscis',desc:'Empatía, curación, amor incondicional. La madre del océano emocional. Sentada en su trono junto al mar, contempla su copa decorada con ángeles. Representa la sabiduría emocional madura, la capacidad de sanar a través del amor y la comprensión profunda de los sentimientos ajenos. Te invita a liderar con el corazón.'},
                {num:'K',name:'Rey de Copas',img:imgPath(3,10),sig:'Marte',casa:'1ª',sigL:'Escorpio',desc:'Madurez emocional, compasión. El dominio del mundo emocional. Flotando sobre el mar turbulento, sostiene firmemente su copa y su cetro. Representa el control sobre las emociones sin reprimirlas, la compasión equilibrada con sabiduría. Te llama a ser dueño de tu mundo interior, navegando las aguas emocionales con serenidad y madurez.'}
            ],
            swords: [
                {num:'1',name:'As de Espadas',img:imgPath(3,11),sig:'Marte',casa:'1ª',sigL:'Libra',desc:'Claridad, verdad, ruptura. La espada de la mente que corta la ilusión. Una mano emerge de las nubes sosteniendo una espada vertical coronada por una corona. Representa el momento de la verdad absoluta, la claridad mental que disipa la confusión. Te llama a ver la realidad con honestidad, aunque duela, porque la verdad es la única base sólida para decidir.'},
                {num:'2',name:'2 de Espadas',img:imgPath(3,12),sig:'Luna',casa:'1ª',sigL:'Libra',desc:'Decisión, punto muerto, bloqueo. La mente que no puede ver con claridad. Una figura vendada sostiene dos espadas cruzadas frente a su pecho. Representa la parálisis por análisis y la dificultad para tomar una decisión. Te invita a quitarte la venda, a confiar en tu intuición y a enfrentar la elección que has estado evadiendo.'},
                {num:'3',name:'3 de Espadas',img:imgPath(4,0),sig:'Saturno',casa:'1ª',sigL:'Libra',desc:'Dolor, traición, corazón herido. El sufrimiento que abre paso a la verdad. Tres espadas atraviesan un corazón en un cielo tormentoso. Representa el dolor emocional profundo, la traición o el desamor que parte el alma. Pero esta carta también trae el mensaje de que el dolor es temporal y que de toda herida nace una sabiduría más honda.'},
                {num:'4',name:'4 de Espadas',img:imgPath(4,1),sig:'Júpiter',casa:'1ª',sigL:'Libra',desc:'Descanso, meditación, recuperación. La pausa necesaria para sanar. Una figura yacente con las manos en posición de oración, tres espadas en la pared y una a su lado. Representa la necesidad de retirarte para recuperarte. Te invita a tomarte un descanso mental y emocional, confiando en que la pausa no es debilidad sino preparación para renacer.'},
                {num:'5',name:'5 de Espadas',img:imgPath(4,2),sig:'Venus',casa:'1ª',sigL:'Acuario',desc:'Conflicto, derrota, tensión. La victoria vacía que deja heridas. Una figura sonríe mientras recoge tres espadas, dos más yacen en el suelo. Representa los conflictos donde nadie gana realmente, las peleas que dejan cicatrices. Te advierte sobre el costo de tener la razón a toda costa y te invita a elegir sabiamente tus batallas.'},
                {num:'6',name:'6 de Espadas',img:imgPath(4,3),sig:'Mercurio',casa:'1ª',sigL:'Acuario',desc:'Transición, viaje, dejar atrás. Navegar hacia aguas más tranquilas. Una barca transporta seis espadas verticales mientras una figura empuja la embarcación. Representa el viaje hacia un lugar mejor, dejando atrás las turbulencias. Te asegura que después de la tormenta llegará la calma, solo debes confiar en el movimiento hacia adelante.'},
                {num:'7',name:'7 de Espadas',img:imgPath(4,4),sig:'Luna',casa:'1ª',sigL:'Acuario',desc:'Engaño, estrategia, sigilo. La mente astuta que busca su camino. Una figura hurta cinco espadas mientras dos quedan atrás. Representa la necesidad de actuar con astucia, de pensar estratégicamente ante una situación adversa. Te advierte sobre el engaño externo pero también sobre tu propia capacidad de autoengaño y te pide honestidad.'},
                {num:'8',name:'8 de Espadas',img:imgPath(4,5),sig:'Júpiter',casa:'1ª',sigL:'Géminis',desc:'Restricción, confusión, parálisis. Las ataduras de la mente. Una figura vendada y atada rodeada de ocho espadas clavadas en la tierra. Representa la sensación de estar atrapado sin salida. Pero las ataduras son sueltas y no hay paredes alrededor, solo tu mente te limita. Te invita a ver que las únicas cadenas son las que tú mismo te impones.'},
                {num:'9',name:'9 de Espadas',img:imgPath(4,6),sig:'Marte',casa:'1ª',sigL:'Géminis',desc:'Ansiedad, pesadillas, preocupación. El peso de los miedos nocturnos. Una figura sentada en la cama con el rostro entre las manos, nueve espadas colgando sobre ella. Representa la angustia mental, las noches de insomnio y la tendencia a magnificar los problemas. Te recuerda que la oscuridad siempre antecede al amanecer y que tus miedos son menos poderosos de lo que parecen.'},
                {num:'10',name:'10 de Espadas',img:imgPath(4,7),sig:'Sol',casa:'1ª',sigL:'Géminis',desc:'Final, derrota, renacimiento. El fin doloroso que antecede al amanecer. Una figura yace atravesada por diez espadas mientras el horizonte se ilumina. Representa el final inevitable, la situación que ha llegado a su término. Pero en la distancia, el sol comienza a salir. La derrota aparente es el preludio necesario para un nuevo comienzo.'},
                {num:'P',name:'Paje de Espadas',img:imgPath(4,8),sig:'Marte',casa:'1ª',sigL:'Géminis',desc:'Vigilancia, ideas nuevas, curiosidad. El mensajero del viento mental. Joven alerta con la espada en alto, observando el horizonte en busca de conocimiento. Representa la mente despierta, la curiosidad intelectual y la disposición para aprender. Trae nuevas ideas, descubrimientos y la necesidad de comunicar lo que has comprendido.'},
                {num:'C',name:'Caballero de Espadas',img:imgPath(4,9),sig:'Marte',casa:'1ª',sigL:'Géminis',desc:'Determinación, acción mental. El guerrero que corta con la espada de la verdad. Cabalga a toda velocidad con la espada en alto, listo para enfrentar cualquier desafío. Representa la acción decidida basada en la verdad, la comunicación directa y la defensa de tus principios. Te llama a actuar con valentía intelectual y a no retroceder ante la verdad.'},
                {num:'Q',name:'Reina de Espadas',img:imgPath(4,10),sig:'Venus',casa:'1ª',sigL:'Libra',desc:'Claridad, independencia, sabiduría. La señora del aire que ve la verdad. Sentada en su trono adornado con ángeles, sostiene su espada con firmeza. Representa la sabiduría ganada a través de la experiencia y el dolor. Su mirada penetrante no tolera mentiras. Te invita a cortar lo que ya no sirve con la espada de la verdad y la compasión.'},
                {num:'K',name:'Rey de Espadas',img:imgPath(4,11),sig:'Marte',casa:'1ª',sigL:'Acuario',desc:'Autoridad intelectual, ética. El poder de la mente y la justicia. En su trono elevado entre las nubes, sostiene su espada firmemente. Representa la autoridad basada en la sabiduría, la justicia impartida con ecuanimidad y el poder de la mente clara. Te llama a tomar decisiones con lógica y ética, poniendo la verdad por encima de los intereses personales.'}
            ],
            pentacles: [
                {num:'1',name:'As de Oros',img:imgPath(4,12),sig:'Venus',casa:'1ª',sigL:'Tauro',desc:'Creación, prosperidad, nuevo ciclo. La semilla de la abundancia material. Una mano del cielo sostiene un gran oro del que brota un jardín. Representa el comienzo de una empresa material, una oportunidad financiera o el inicio de un proyecto concreto. Te invita a plantar las semillas de tu abundancia con confianza y dedicación.'},
                {num:'2',name:'2 de Oros',img:imgPath(5,0),sig:'Júpiter',casa:'1ª',sigL:'Tauro',desc:'Equilibrio, adaptación, cambio. El malabarista que danza con la vida. Un hombre hace malabares con dos oros mientras el mar ondula a sus espaldas. Representa la necesidad de equilibrar múltiples responsabilidades y recursos. Te recuerda que la vida es un flujo constante y que tu habilidad para adaptarte determina tu éxito. Mantén el equilibrio entre dar y recibir.'},
                {num:'3',name:'3 de Oros',img:imgPath(5,1),sig:'Marte',casa:'1ª',sigL:'Capricornio',desc:'Trabajo en equipo, maestría, creación. La colaboración que construye. Tres personas trabajando juntas en la construcción de una catedral. Representa el poder de la colaboración, la maestría técnica y el fruto del trabajo en equipo. Te recuerda que las grandes obras no se logran en soledad y que cada uno aporta un don único al proyecto común.'},
                {num:'4',name:'4 de Oros',img:imgPath(5,2),sig:'Sol',casa:'1ª',sigL:'Capricornio',desc:'Estabilidad, control, ahorro. La seguridad de poseer y retener. Un hombre aferra cuatro oros protegiéndolos celosamente. Representa la necesidad de seguridad material, el ahorro prudente y el control sobre los recursos. Pero también advierte sobre el apego excesivo al dinero y la tendencia a cerrarse por miedo a perder lo que tienes.'},
                {num:'5',name:'5 de Oros',img:imgPath(5,3),sig:'Mercurio',casa:'1ª',sigL:'Tauro',desc:'Dificultad, pérdida material. La prueba de la fe en tiempos de escasez. Dos figuras harapientas pasan frente a una iglesia iluminada sin entrar. Representa la pérdida material, la exclusión y los momentos de escasez. Pero te recuerda que la ayuda está disponible si abres los ojos y pides apoyo, y que la verdadera riqueza reside en el espíritu.'},
                {num:'6',name:'6 de Oros',img:imgPath(5,4),sig:'Luna',casa:'1ª',sigL:'Tauro',desc:'Generosidad, caridad, equilibrio. La justa distribución de los recursos. Un hombre con balanza reparte monedas a dos mendigos. Representa la generosidad equilibrada, la caridad consciente y la justa distribución de la riqueza. Te invita a dar y recibir con equidad, reconociendo que todos somos tanto maestros como aprendices en la danza de la abundancia.'},
                {num:'7',name:'7 de Oros',img:imgPath(5,5),sig:'Saturno',casa:'1ª',sigL:'Tauro',desc:'Evaluación, paciencia, crecimiento. La cosecha que tarda en llegar. Un hombre observa su cosecha de oros colgados en un arbusto. Representa la evaluación de tus inversiones y el fruto de tu trabajo paciente. Te invita a reflexionar sobre lo que has sembrado, a tener paciencia con los resultados y a decidir si continuar invirtiendo o cambiar de dirección.'},
                {num:'8',name:'8 de Oros',img:imgPath(5,6),sig:'Sol',casa:'1ª',sigL:'Virgo',desc:'Dedicación, aprendizaje, artesanía. La maestría que nace del trabajo constante. Un artesano concentrado talla cada oro con esmero y dedicación. Representa el aprendizaje meticuloso, la práctica constante y el orgullo del trabajo bien hecho. Te recuerda que la maestría no llega por inspiración sino por la repetición consciente y el amor al oficio.'},
                {num:'9',name:'9 de Oros',img:imgPath(5,7),sig:'Venus',casa:'1ª',sigL:'Virgo',desc:'Lujo, abundancia, autosuficiencia. La cosecha de los esfuerzos pasados. Una mujer rodeada de lujo en su jardín privado, con nueve oros dispuestos en arco. Representa la abundancia material alcanzada, la autosuficiencia y el disfrute de los frutos de tu trabajo. Te invita a celebrar tu éxito sin culpa y a compartir tu abundancia desde la plenitud.'},
                {num:'10',name:'10 de Oros',img:imgPath(5,8),sig:'Mercurio',casa:'1ª',sigL:'Virgo',desc:'Legado, herencia, tradición. La riqueza que trasciende generaciones. Una familia reunida bajo un arco de diez oros que representa la prosperidad familiar. Habla de herencia, tradiciones familiares y el legado que construyes para las generaciones futuras. Te invita a honrar tus raíces mientras construyes un futuro sólido para quienes vendrán.'},
                {num:'P',name:'Paje de Oros',img:imgPath(5,9),sig:'Marte',casa:'1ª',sigL:'Tauro',desc:'Estudio, aplicación, nuevo proyecto. El aprendiz del mundo material. Joven observa con atención el oro que flota frente a él, dispuesto a aprender. Representa el inicio de un proyecto práctico, el estudio dedicado y la aplicación paciente. Te anima a poner manos a la obra, a aprender haciendo y a valorar cada pequeño paso en tu formación.'},
                {num:'C',name:'Caballero de Oros',img:imgPath(5,10),sig:'Marte',casa:'1ª',sigL:'Tauro',desc:'Perseverancia, responsabilidad. El guardián paciente de la tierra. Montado en un caballo lento y pesado, sostiene su oro con firmeza. Representa la perseverancia, la responsabilidad y el trabajo constante. No es rápido ni espectacular pero siempre llega a su destino. Te invita a avanzar paso a paso, confiando en que la constancia vence la resistencia.'},
                {num:'Q',name:'Reina de Oros',img:imgPath(5,11),sig:'Venus',casa:'1ª',sigL:'Capricornio',desc:'Abundancia, practicidad, nutrición. La madre tierra que provee y protege. En su trono rodeado de naturaleza, sostiene su oro con seguridad. Representa la abundancia práctica, la capacidad de administrar los recursos con sabiduría y de nutrir tanto el cuerpo como el espíritu. Te invita a crear seguridad material sin perder la conexión con la tierra.'},
                {num:'K',name:'Rey de Oros',img:imgPath(5,12),sig:'Marte',casa:'1ª',sigL:'Capricornio',desc:'Prosperidad, éxito, estabilidad. El señor del mundo material realizado. Rodeado de todos los símbolos de su éxito, el Rey de Oros ha alcanzado la cima del mundo material. Representa la prosperidad estable, la sabiduría financiera y el liderazgo empresarial. Te recuerda que el verdadero éxito incluye generosidad, responsabilidad y visión a largo plazo.'}
            ]
        };

        // === RENDER ===
        function renderCard(c, isMajor, suit) {
            function romanToNum(r) {
                var map = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
                var n = 0, i = 0;
                while (i < r.length) {
                    var cur = map[r[i]], nxt = map[r[i+1]] || 0;
                    if (cur < nxt) { n += nxt - cur; i += 2; }
                    else { n += cur; i++; }
                }
                return n;
            }
            var displayNum = isMajor
                ? (c.num === '0' ? '0' : romanToNum(c.num) + '')
                : (c.num === 'P' ? 'Paje' : c.num === 'C' ? 'Caballero' : c.num === 'Q' ? 'Reina' : c.num === 'K' ? 'Rey' : 'Número ' + c.num);
            var numHtml = '<div class="card-number">' + displayNum + '</div>';
            return '<div class="card-tarot' + (c.feat ? ' featured' : '') + '">' +
                (c.img ? '<div class="card-img-wrapper"><img src="' + c.img + '" alt="' + c.name + '" loading="lazy"></div>' : '') +
                '<div class="card-name">' + c.name + '</div>' +
                numHtml +
                '<div class="card-divider"></div>' +
                '<div class="card-desc">' + c.desc + '</div>' +
                '<div class="card-details">' +
                    '<div class="card-detail-item"><span class="label">Signo</span><span class="value">' + c.sigL + '</span></div>' +
                    '<div class="card-detail-item"><span class="label">Casa</span><span class="value">' + c.casa + '</span></div>' +
                    '<div class="card-detail-item"><span class="label">Número</span><span class="value">' + c.num + '</span></div>' +
                    '<div class="card-detail-item"><span class="label">Planeta</span><span class="value">' + c.sig + '</span></div>' +
                '</div></div>';
        }

        function renderSection(id, data, isMajor, suit) {
            var html = '';
            data.forEach(function(c) { html += renderCard(c, isMajor, suit); });
            document.getElementById(id).innerHTML = html;
        }

        renderSection('grid-major', cardData.major, true, 'major');
        renderSection('grid-wands', cardData.wands, false, 'wands');
        renderSection('grid-cups', cardData.cups, false, 'cups');
        renderSection('grid-swords', cardData.swords, false, 'swords');
        renderSection('grid-pentacles', cardData.pentacles, false, 'pentacles');

        // === HOUSES DATA ===
        var housesData = [
            {num:'1',name:'La Casa del Ser',signo:'Aries',planeta:'Marte',desc:'Representa la personalidad, la apariencia física, el inicio de la vida y cómo te presentas al mundo. Es la casa del yo, la identidad primordial, la máscara que mostramos y la manera en que los demás nos perciben. Aquí se refleja tu impulso vital, tu espontaneidad y la chispa única que te distingue como individuo.'},
            {num:'2',name:'La Casa de los Valores',signo:'Tauro',planeta:'Venus',desc:'Gobierna los recursos materiales, el dinero, los talentos innatos y la autoestima. Revela tu relación con la abundancia, lo que valoras y cómo generas seguridad. Esta casa habla de tus posesiones, no solo materiales sino también emocionales, y de la capacidad de disfrutar los placeres de la vida.'},
            {num:'3',name:'La Casa de la Comunicación',signo:'Géminis',planeta:'Mercurio',desc:'Rige la mente, la comunicación, los hermanos, los viajes cortos y el aprendizaje temprano. Representa cómo procesas la información, tu curiosidad intelectual y tu manera de expresarte. Es la casa de las conexiones cotidianas, los vecinos, y todo aquello que estimula tu mente inquieta.'},
            {num:'4',name:'La Casa del Hogar',signo:'Cáncer',planeta:'Luna',desc:'Representa el hogar, la familia, las raíces y la base emocional. Habla de tu infancia, tus ancestros y el refugio seguro que buscas. Es la casa más íntima, donde guardas tus memorias más profundas y desde donde te relacionas con el mundo en términos de seguridad y pertenencia.'},
            {num:'5',name:'La Casa de la Creatividad',signo:'Leo',planeta:'Sol',desc:'Gobierna la creatividad, el romance, los hijos, el juego y la expresión personal. Es la casa del corazón, de aquello que haces por puro placer. Representa tu capacidad de brillar, de amar apasionadamente y de crear vida en todas sus formas, ya sea a través del arte, los hijos o tus proyectos más entrañables.'},
            {num:'6',name:'La Casa del Servicio',signo:'Virgo',planeta:'Mercurio',desc:'Rige la salud, el trabajo diario, el servicio a los demás y las rutinas. Representa tu dedicación al bienestar físico y mental, cómo organizas tu día a día y la manera en que sirves al prójimo. Es la casa de la mejora continua, del análisis meticuloso y de encontrar propósito en las pequeñas cosas.'},
            {num:'7',name:'La Casa de las Asociaciones',signo:'Libra',planeta:'Venus',desc:'Gobierna el matrimonio, las sociedades, las alianzas y las relaciones significativas. Representa el espejo del otro, lo que buscamos en una pareja y cómo nos relacionamos en igualdad. Es la casa del equilibrio, la diplomacia y la capacidad de crear vínculos profundos basados en el respeto mutuo y la armonía.'},
            {num:'8',name:'La Casa de la Transformación',signo:'Escorpio',planeta:'Plutón',desc:'Rige la muerte y el renacimiento, la sexualidad, las herencias y los recursos compartidos. Es la casa más intensa del zodíaco, donde enfrentas tus miedos y te transformas. Representa las crisis que te obligan a evolucionar, la capacidad de regenerarte y los lazos que trascienden lo material, como el sexo y la muerte.'},
            {num:'9',name:'La Casa de la Expansión',signo:'Sagitario',planeta:'Júpiter',desc:'Gobierna los viajes largos, la filosofía, la educación superior y la búsqueda de significado. Representa tu visión del mundo, tus creencias y tu deseo de expandir horizontes. Es la casa del explorador, del estudiante eterno que busca la verdad más allá de las fronteras físicas y mentales.'},
            {num:'10',name:'La Casa de la Carrera',signo:'Capricornio',planeta:'Saturno',desc:'Rige la profesión, el estatus social, la reputación y el legado. Representa tu ambición, tu lugar en el mundo y la huella que deseas dejar. Es la casa del éxito público, de la autoridad conquistada con esfuerzo y de la responsabilidad que asumes ante la sociedad.'},
            {num:'11',name:'La Casa de las Amistades',signo:'Acuario',planeta:'Urano',desc:'Gobierna las amistades, los grupos sociales, los proyectos colectivos y los ideales. Representa tu tribu, tus conexiones con comunidades afines y tu visión del futuro. Es la casa de la colaboración, la innovación social y los sueños compartidos que trascienden el individuo.'},
            {num:'12',name:'La Casa del Inconsciente',signo:'Piscis',planeta:'Neptuno',desc:'Rige el subconsciente, los sueños, la espiritualidad, el karma y el retiro. Es la casa del alma, donde guardas los patrones invisibles que te condicionan. Representa la conexión con lo divino, la compasión universal y el viaje hacia el interior donde encuentras la unidad con todo lo que existe.'},
        ];

        function renderHouses() {
            var html = '';
            housesData.forEach(function(h) {
                html += '<div class="house-card">' +
                    '<div class="house-header">' +
                        '<div class="house-num">' + h.num + '</div>' +
                        '<div class="house-name">' + h.name + '</div>' +
                        '<div class="house-sign">' + h.signo + ' · ' + h.planeta + '</div>' +
                    '</div>' +
                    '<div class="house-desc">' + h.desc + '</div>' +
                '</div>';
            });
            document.getElementById('grid-houses').innerHTML = html;
        }
        renderHouses();

        // === PLANETS DATA ===
        var planetsData = [
            {num:1,name:'Sol',sym:'☉',signos:'Leo',desc:'Representa la conciencia, la vitalidad, el ego y la identidad central. El Sol es la fuente de toda vida y en la carta astral revela tu propósito fundamental, la esencia de quién eres. Gobierna la autoexpresión, la creatividad y la capacidad de brillar con luz propia. Tu signo solar es lo que la mayoría conoce como tu «signo zodiacal» y refleja tu personalidad nuclear.'},
            {num:2,name:'Luna',sym:'☽',signos:'Cáncer',desc:'Gobierna las emociones, la intuición, el subconsciente y los hábitos. La Luna representa tu mundo interior, tus reacciones instintivas y tu necesidad de seguridad emocional. Revela cómo nutres y cómo necesitas ser nutrido. En la carta astral, tu signo lunar muestra tu lado más vulnerable y auténtico, la forma en que procesas los sentimientos y tu conexión con el pasado.'},
            {num:3,name:'Mercurio',sym:'☿',signos:'Géminis, Virgo',desc:'Rige la comunicación, la mente, el intelecto y el intercambio de ideas. Mercurio determina cómo piensas, hablas, escribes y procesas la información. Gobierna los viajes cortos, el comercio y la tecnología. En la carta astral, revela tu estilo de aprendizaje, tu curiosidad mental y cómo te expresas verbalmente, así como tu habilidad para analizar y sintetizar conceptos.'},
            {num:4,name:'Venus',sym:'♀',signos:'Tauro, Libra',desc:'Gobierna el amor, la belleza, los valores y las relaciones. Venus representa lo que valoras, tu sentido estético y cómo amas y te relacionas con los demás. Rige la armonía, el placer, el romance y los recursos materiales. En la carta astral, muestra tu forma de dar y recibir afecto, tus talentos artísticos y lo que encuentras bello y placentero en la vida.'},
            {num:5,name:'Marte',sym:'♂',signos:'Aries',desc:'Representa la acción, la pasión, la energía y el impulso. Marte es el planeta del deseo, la agresividad constructiva y la fuerza de voluntad. Gobierna la iniciativa, la competencia y la manera en que persigues lo que quieres. En la carta astral, revela tu impulso sexual, tu temperamento, tu coraje y la forma en que afirmas tu individualidad frente a los desafíos.'},
            {num:6,name:'Júpiter',sym:'♃',signos:'Sagitario',desc:'Rige la expansión, la abundancia, la sabiduría y la buena fortuna. Júpiter es el planeta de la suerte, el optimismo y el crecimiento en todas sus formas. Gobierna los viajes largos, la educación superior, la filosofía y la búsqueda de significado. En la carta astral, señala áreas de bendición y expansión natural, así como tu capacidad para ver el panorama general.'},
            {num:7,name:'Saturno',sym:'♄',signos:'Capricornio',desc:'Gobierna la disciplina, la responsabilidad, la estructura y el karma. Saturno es el planeta de las lecciones de vida, la madurez y la autoridad. Representa los límites, las restricciones y el trabajo duro que conduce al éxito duradero. En la carta astral, revela tus mayores desafíos y las áreas donde debes desarrollar paciencia, perseverancia y autocontrol para cosechar frutos a largo plazo.'},
            {num:8,name:'Urano',sym:'♅',signos:'Acuario',desc:'Representa la innovación, la rebelión, la originalidad y el cambio repentino. Urano es el planeta del despertar, la libertad y la ruptura con lo establecido. Gobierna la tecnología, la ciencia, los movimientos sociales y todo aquello que rompe con la tradición. En la carta astral, indica dónde buscas libertad e individualidad, y cómo expresas tu singularidad de manera auténtica.'},
            {num:9,name:'Neptuno',sym:'♆',signos:'Piscis',desc:'Rige la espiritualidad, los sueños, la imaginación y la trascendencia. Neptuno es el planeta de la inspiración divina, la compasión universal y la disolución de los límites. Gobierna el arte, la música, la poesía y la conexión con lo sagrado. En la carta astral, revela tu sensibilidad espiritual, tu capacidad de empatía y las áreas donde puedes experimentar ilusión o confusión.'},
            {num:10,name:'Plutón',sym:'♇',signos:'Escorpio',desc:'Gobierna la transformación, el poder, la muerte y el renacimiento. Plutón es el planeta de la regeneración profunda, la sombra y la evolución del alma. Representa los procesos de destrucción creativa que te obligan a transformarte radicalmente. En la carta astral, indica las áreas de tu vida donde experimentarás crisis transformadoras y donde posees un poder oculto para sanar y renacer.'},
        ];

        function renderPlanets() {
            var html = '';
            planetsData.forEach(function(p) {
                html += '<div class="planet-card">' +
                    '<div class="planet-sym">' + p.sym + '</div>' +
                    '<div class="planet-body">' +
                        '<div class="planet-header">' +
                            '<div class="planet-name">' + p.name + ' <span class="planet-sign">— ' + p.signos + '</span></div>' +
                        '</div>' +
                        '<div class="planet-desc">' + p.desc + '</div>' +
                    '</div>' +
                '</div>';
            });
            document.getElementById('grid-planets').innerHTML = html;
        }
        renderPlanets();

        // === ELEMENTS DATA ===
        var elementsData = [
            {id:'fire',name:'Fuego',sym:'△',signos:['Aries','Leo','Sagitario'],desc:'El Fuego es la energía de la vida, la chispa divina que impulsa la acción y la creación. Los signos de fuego son apasionados, valientes, entusiastas y dotados de un espíritu pionero. Viven con intensidad, inspiran a quienes los rodean y poseen una fe inquebrantable en sí mismos. Su lección kármica es canalizar su poder sin consumirse ni quemar a los demás.'},
            {id:'earth',name:'Tierra',sym:'▽',signos:['Tauro','Virgo','Capricornio'],desc:'La Tierra es la base sólida de la existencia, la materia que da forma a nuestros sueños. Los signos de tierra son prácticos, leales, perseverantes y dotados de un sentido innato para construir seguridad material. Valoran lo concreto, el trabajo constante y los resultados tangibles. Su lección kármica es equilibrar la ambición material con la evolución espiritual.'},
            {id:'air',name:'Aire',sym:'○',signos:['Géminis','Libra','Acuario'],desc:'El Aire es el reino de la mente, las ideas y la comunicación. Los signos de aire son intelectuales, sociales, curiosos y dotados de una capacidad única para ver múltiples perspectivas. Viven en el mundo de las ideas, buscan el conocimiento y prosperan en la conexión con los demás. Su lección kármica es conectar la mente con el corazón sin perderse en la teoría.'},
            {id:'water',name:'Agua',sym:'○',signos:['Cáncer','Escorpio','Piscis'],desc:'El Agua es el océano de las emociones, la intuición y el mundo interior. Los signos de agua son sensibles, empáticos, profundos y dotados de una conexión extraordinaria con el reino emocional. Sienten todo con intensidad, poseen una sabiduría intuitiva y una capacidad natural para sanar. Su lección kármica es proteger su sensibilidad sin cerrar su corazón al mundo.'},
        ];

        function renderElements() {
            var html = '';
            elementsData.forEach(function(e) {
                var signsHtml = '';
                e.signos.forEach(function(s) {
                    signsHtml += '<span>' + s + '</span>';
                });
                html += '<div class="element-card ' + e.id + '">' +
                    '<div class="element-header">' +
                        '<div class="element-sym">' + e.sym + '</div>' +
                        '<div class="element-name">' + e.name + '</div>' +
                    '</div>' +
                    '<div class="element-signs">' + signsHtml + '</div>' +
                    '<div class="element-desc">' + e.desc + '</div>' +
                '</div>';
            });
            document.getElementById('grid-elements').innerHTML = html;
        }
        renderElements();

        // === ZODIAC DATA ===
        var zodiacData = [
{num:1,name:'Aries',sym:'♈\uFE0E',dates:'21 Mar – 19 Abr',elem:'Fuego',planeta:'Marte',casa:'1ª',colores:['#dc2626','#ff6b35'],piedras:'Rubí, Diamante',piedrasDesc:'Rubí, Diamante',img:'images/signos-0/aries-0.jpg',cards:['El Emperador','As de Bastos','2 de Bastos','3 de Bastos','4 de Bastos','Paje de Bastos','Caballero de Bastos'],rasgos:['Audaz y decidido', 'Energía inagotable', 'Impulsivo y directo', 'Líder nato', 'Competitivo', 'Aventurero', 'Pasional', 'Franco y sincero']},
{num:2,name:'Tauro',sym:'♉\uFE0E',dates:'20 Abr – 20 May',elem:'Tierra',planeta:'Venus',casa:'2ª',colores:['#22c55e','#f9a8d4'],piedras:'Esmeralda, Cuarzo Rosa',piedrasDesc:'Esmeralda, Cuarzo Rosa',img:'images/signos-0/tauro-0.jpg',cards:['El Sumo Sacerdote','La Emperatriz','As de Oros','2 de Oros','5 de Oros','6 de Oros','7 de Oros','Paje de Oros','Caballero de Oros'],rasgos:['Leal y constante', 'Paciente y perseverante', 'Amante del placer', 'Práctico y sensato', 'Terco y obstinado', 'Protector', 'Sensual', 'Confiabilidad absoluta']},
{num:3,name:'Géminis',sym:'♊\uFE0E',dates:'21 May – 20 Jun',elem:'Aire',planeta:'Mercurio',casa:'3ª',colores:['#eab308','#9ca3af'],piedras:'Ágata, Piedra Luna',piedrasDesc:'Ágata, Piedra Luna',img:'images/signos-0/geminis-0.jpg',cards:['Los Enamorados','8 de Espadas','9 de Espadas','10 de Espadas','Paje de Espadas','Caballero de Espadas'],rasgos:['Versátil y curioso', 'Comunicador brillante', 'Adaptable a todo', 'Dual e inquieto', 'Inteligente y ágil', 'Sociable y carismático', 'Cambiante de humor', 'Amante del conocimiento']},
{num:4,name:'Cáncer',sym:'♋\uFE0E',dates:'21 Jun – 22 Jul',elem:'Agua',planeta:'Luna',casa:'4ª',colores:['#e2e8f0','#94a3b8'],piedras:'Perla, Selenita',piedrasDesc:'Perla, Selenita',img:'images/signos-0/cancer-0.jpg',cards:['El Carro','La Sacerdotisa','As de Copas','2 de Copas','3 de Copas','Paje de Copas','Caballero de Copas'],rasgos:['Empático y sensible', 'Intuitivo y protector', 'Apegado al hogar', 'Leal hasta el fin', 'Memoria emocional profunda', 'Cuidadoso y maternal', 'Imaginativo', 'Reservado al principio']},
{num:5,name:'Leo',sym:'♌\uFE0E',dates:'23 Jul – 22 Ago',elem:'Fuego',planeta:'Sol',casa:'5ª',colores:['#fbbf24','#f97316'],piedras:'Topacio, Ojo de Tigre',piedrasDesc:'Topacio, Ojo de Tigre',img:'images/signos-0/leo-0.jpg',cards:['La Fuerza','5 de Bastos','6 de Bastos','7 de Bastos','Reina de Bastos','Rey de Bastos'],rasgos:['Carismático y magnético', 'Orgulloso y digno', 'Generoso y leal', 'Creativo y apasionado', 'Líder por naturaleza', 'Dramático y teatral', 'Valiente y decidido', 'Corazón gigante']},
{num:6,name:'Virgo',sym:'♍\uFE0E',dates:'23 Ago – 22 Sep',elem:'Tierra',planeta:'Mercurio',casa:'6ª',colores:['#a0522d','#eab308'],piedras:'Jaspe, Aguamarina',piedrasDesc:'Jaspe, Aguamarina',img:'images/signos-0/virgo-0.jpg',cards:['El Ermitaño','8 de Oros','9 de Oros','10 de Oros'],rasgos:['Analítico y meticuloso', 'Perfeccionista exigente', 'Servicial y dedicado', 'Práctico y ordenado', 'Inteligente y crítico', 'Modesto y reservado', 'Saludable y disciplinado', 'Detallista obsesivo']},
{num:7,name:'Libra',sym:'♎\uFE0E',dates:'23 Sep – 22 Oct',elem:'Aire',planeta:'Venus',casa:'7ª',colores:['#f472b6','#60a5fa'],piedras:'Ópalo, Lapislázuli',piedrasDesc:'Ópalo, Lapislázuli',img:'images/signos-0/libra-0.jpg',cards:['La Justicia','As de Espadas','2 de Espadas','3 de Espadas','4 de Espadas','Reina de Espadas'],rasgos:['Diplomático y equilibrado', 'Encantador y sociable', 'Justo e imparcial', 'Indeciso por naturaleza', 'Esteta y amante del arte', 'Armonioso y pacífico', 'Romántico idealista', 'Cortés y elegante']},
{num:8,name:'Escorpio',sym:'♏\uFE0E',dates:'23 Oct – 21 Nov',elem:'Agua',planeta:'Plutón',casa:'8ª',colores:['#4a0e0e','#0a0a0a'],piedras:'Ónice, Granate',piedrasDesc:'Ónice, Granate',img:'images/signos-0/escorpio-0.jpg',cards:['La Muerte','4 de Copas','5 de Copas','6 de Copas','Rey de Copas'],rasgos:['Intenso y magnético', 'Apasionado y profundo', 'Leal inquebrantable', 'Misterioso y reservado', 'Determinado y poderoso', 'Celoso y posesivo', 'Transformador nato', 'Intuitivo y perceptivo']},
{num:9,name:'Sagitario',sym:'♐\uFE0E',dates:'22 Nov – 21 Dic',elem:'Fuego',planeta:'Júpiter',casa:'9ª',colores:['#7b2dbf','#3b82f6'],piedras:'Turquesa, Amatista',piedrasDesc:'Turquesa, Amatista',img:'images/signos-0/sagitario-0.jpg',cards:['La Templanza','Rueda de la Fortuna','8 de Bastos','9 de Bastos','10 de Bastos'],rasgos:['Optimista y aventurero', 'Amante de la libertad', 'Filósofo nato', 'Directo y sincero', 'Entusiasta incontenible', 'Viajero incansable', 'Independiente y salvaje', 'Buscador de verdad']},
{num:10,name:'Capricornio',sym:'♑\uFE0E',dates:'22 Dic – 19 Ene',elem:'Tierra',planeta:'Saturno',casa:'10ª',colores:['#4a0e0e','#1a1a2e'],piedras:'Granate, Turmalina Negra',piedrasDesc:'Granate, Turmalina Negra',img:'images/signos-0/capricornio-0.jpg',cards:['El Diablo','3 de Oros','4 de Oros','Reina de Oros','Rey de Oros'],rasgos:['Ambicioso y disciplinado', 'Responsable y maduro', 'Práctico y realista', 'Perseverante incansable', 'Reservado y serio', 'Estratégico nato', 'Leal y tradicional', 'Paciencia de acero']},
{num:11,name:'Acuario',sym:'♒\uFE0E',dates:'20 Ene – 18 Feb',elem:'Aire',planeta:'Urano',casa:'11ª',colores:['#3b82f6','#60a5fa'],piedras:'Zafiro, Azurita',piedrasDesc:'Zafiro, Azurita',img:'images/signos-0/acuario-0.jpg',cards:['La Estrella','El Loco','5 de Espadas','6 de Espadas','7 de Espadas','Rey de Espadas'],rasgos:['Original e innovador', 'Independiente y libre', 'Humanitario y solidario', 'Excéntrico y único', 'Intelectual rebelde', 'Impredecible y genial', 'Visionario adelantado', 'Amigo leal y fraterno']},
{num:12,name:'Piscis',sym:'♓\uFE0E',dates:'19 Feb – 20 Mar',elem:'Agua',planeta:'Neptuno',casa:'12ª',colores:['#22d3ee','#c084fc'],piedras:'Amatista, Aguamarina',piedrasDesc:'Amatista, Aguamarina',img:'images/signos-0/piscis-0.jpg',cards:['El Colgado','La Luna','7 de Copas','8 de Copas','9 de Copas','10 de Copas'],rasgos:['Soñador y espiritual', 'Empático y compasivo', 'Artista e imaginativo', 'Intuitivo y místico', 'Sensible y vulnerable', 'Evasivo y escapista', 'Conexión divina', 'Amor incondicional']},
        ];

        function renderZodiac() {
            var html = '';
            var cardsMap = {};
            // build lookup from cardData
            cardData.major.forEach(function(c){cardsMap[c.name]=c.name;});
            cardData.wands.forEach(function(c){cardsMap[c.name]=c.name;});
            cardData.cups.forEach(function(c){cardsMap[c.name]=c.name;});
            cardData.swords.forEach(function(c){cardsMap[c.name]=c.name;});
            cardData.pentacles.forEach(function(c){cardsMap[c.name]=c.name;});

            zodiacData.forEach(function(z) {
                var colorsHtml = '';
                z.colores.forEach(function(c) {
                    colorsHtml += '<span class="color-dot" style="background:' + c + '"></span>';
                });
                var cardsHtml = '';
                z.cards.forEach(function(cn) {
                    cardsHtml += '<a href="#cards">' + cn + '</a>';
                });
                var rasgosHtml = '';
                z.rasgos.forEach(function(r) {
                    rasgosHtml += '<li>' + r + '</li>';
                });
                html += '<div class="zodiac-card" data-sign="' + z.name + '">' +
                    '<div class="zodiac-inner">' +
                    '<div class="zodiac-front">' +
                        '<div class="zodiac-header">' +
                            '<div class="zodiac-symbol">' + z.sym + '</div>' +
                            '<div class="zodiac-name">' + z.name + '<small>' + z.dates + '</small></div>' +
                        '</div>' +
                        '<div class="zodiac-img-label">Constelación</div>' +
                        '<div class="zodiac-img-wrapper"><img src="' + z.img + '" alt="' + z.name + '" loading="lazy"></div>' +
                        '<div class="zodiac-details">' +
                            '<div class="zodiac-detail elem-' + z.elem.toLowerCase() + '"><span class="label">Elemento</span><span class="value">' + z.elem + '</span></div>' +
                            '<div class="zodiac-detail"><span class="label">Planeta</span><span class="value">' + z.planeta + '</span></div>' +
                            '<div class="zodiac-detail"><span class="label">Casa</span><span class="value">' + z.casa + '</span></div>' +
                            '<div class="zodiac-detail"><span class="label">Colores</span><span class="value">' + colorsHtml + '</span></div>' +
                            '<div class="zodiac-detail" style="grid-column: 1 / -1"><span class="label">Piedras</span><span class="value">' + z.piedras + '</span></div>' +
                        '</div>' +
                        '<div class="zodiac-cards">' +
                            '<div class="label">Cartas asociadas</div>' +
                            '<div class="zodiac-cards-list">' + cardsHtml + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="zodiac-back">' +
                        '<div class="zodiac-back-header">' +
                            '<div class="zodiac-symbol">' + z.sym + '</div>' +
                            '<div class="zodiac-name">' + z.name + '<small>Rasgos de personalidad</small></div>' +
                        '</div>' +
                        '<ul class="zodiac-rasgos">' + rasgosHtml + '</ul>' +
                    '</div>' +
                    '</div>' +
                '</div>';
            });
            document.getElementById('grid-zodiac').innerHTML = html;
        }
        renderZodiac();

        // === NAVBAR TOGGLE ===
        document.getElementById('navToggle').addEventListener('click', function() {
            document.getElementById('navLinks').classList.toggle('open');
        });
        // Show nav on hover over hamburger area, hide on leave
        var navToggle = document.getElementById('navToggle');
        var navLinks = document.getElementById('navLinks');
        navToggle.addEventListener('mouseenter', function() {
            navLinks.classList.add('open');
        });
        navLinks.addEventListener('mouseleave', function() {
            navLinks.classList.remove('open');
        });
        document.querySelector('.navbar .brand').addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('[data-view="all"]').click();
        });
        // === BOTONES CTA DEL HOME (van directo a Tirada / Carta Natal) ===
        document.querySelectorAll('[data-goto]').forEach(function(b) {
            b.addEventListener('click', function(e) {
                e.preventDefault();
                var link = document.querySelector('.nav-links [data-view="' + b.getAttribute('data-goto') + '"]');
                if (link) link.click();
            });
        });
        // === EXPLORAR BUTTON ===
        document.getElementById('btnExplorar').addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('intro-astrologia').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });


            // ===== TIRADA DE TAROT (gratis: Pasado/Presente/Futuro; pagas: completa y por categoría) =====
            function tShowEl(el) { el.style.display = ''; }
            function tHideEl(el) { el.style.display = 'none'; }
            function tShowError(el, msg) { el.textContent = msg; tShowEl(el); }
            function tRenderReport(el, text) {
                el.innerHTML = '';
                text.split(/\n+/).forEach(function(line) {
                    line = line.trim();
                    if (!line) return;
                    var isH = /^#{1,3}\s/.test(line);
                    var node = document.createElement(isH ? 'h2' : 'p');
                    node.textContent = line.replace(/^#{1,3}\s*/, '').replace(/\*\*/g, '');
                    el.appendChild(node);
                });
            }
            function shuffledDeck() {
                var deck = allCards().slice();
                for (var i = deck.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var t = deck[i]; deck[i] = deck[j]; deck[j] = t;
                }
                return deck;
            }
            function drawSpread(n) {
                return shuffledDeck().slice(0, n).map(function(c) { return { card: c, reversed: Math.random() < 0.5 }; });
            }
            function renderSpread(el, picks, labels) {
                el.innerHTML = picks.map(function(p, i) {
                    return '<div class="tirada-slot' + (p.reversed ? ' reversed' : '') + '" style="animation-delay:' + (i * 0.15) + 's">' +
                        '<div class="tirada-num">' + (i + 1) + '</div>' +
                        '<div class="tirada-label">' + labels[i] + '</div>' +
                        '<div class="tirada-img-wrap"><img src="' + p.card.img + '" alt="' + p.card.name + '"></div>' +
                        '<div class="tirada-name">' + p.card.name + '</div>' +
                        (p.reversed ? '<div class="tirada-rev">Invertida</div>' : '') +
                        '</div>';
                }).join('');
            }
            function firstSentence(t) { var m = /^[^.]+\./.exec(t); return m ? m[0] : t; }

            var FREE_LABELS = ['Pasado', 'Presente', 'Futuro'];
            var FULL_LABELS = ['Situación actual', 'Desafío', 'Pasado reciente', 'Futuro cercano', 'Vos', 'Influencias externas', 'Resultado probable'];
            var CAT_LABELS = ['Situación actual', 'Obstáculo', 'Consejo', 'Influencia externa', 'Resultado probable'];
            var CAT_NAMES = { amor: 'Amor y relaciones', finanzas: 'Finanzas y dinero', profesion: 'Profesión y trabajo', familia: 'Familia y hogar' };

            var tiradaBtn = document.getElementById('tiradaBtn');
            if (tiradaBtn) {
                tiradaBtn.addEventListener('click', function() {
                    var picks = drawSpread(3);
                    var spread = document.getElementById('tiradaSpread');
                    renderSpread(spread, picks, FREE_LABELS);
                    var reading = document.getElementById('tiradaReading');
                    reading.innerHTML = '<h3>&#x2726; Mini Lectura (gratis) &#x2726;</h3>' + picks.map(function(p, i) {
                        var txt = (p.reversed ? 'Invertida: ' : '') + firstSentence(p.card.desc);
                        return '<div class="reading-card"><h4>' + FREE_LABELS[i] + ': ' + p.card.name + (p.reversed ? ' (invertida)' : '') + '</h4><p>' + txt + '</p></div>';
                    }).join('');
                    document.getElementById('tiradaPaywall').style.display = '';
                    spread.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    if (window.Account) Account.logReading('tirada_gratis', picks.map(function(p) { return p.card.name; }).join(', '));
                });
            }

            // ---- Precios y Public Key de Mercado Pago ----
            var mpPublicKey = null;
            var mpInstance = null;
            fetch('/api/prices').then(function(r) { return r.json(); }).then(function(p) {
                document.getElementById('priceFull').textContent = '$' + p.full + ' ' + p.currency;
                Object.keys(CAT_NAMES).forEach(function(k) {
                    var el = document.getElementById('priceCat_' + k);
                    if (el) el.textContent = '$' + p.category + ' ' + p.currency;
                });
                mpPublicKey = p.mpPublicKey;
                window.__planPrice = p.plan;
                window.__oraculoPrice = p.oraculo;
                setupPromoModals(p);
            }).catch(function() {});

            // ---- Cartel de sugerencia (precios reales, sin descuentos falsos) y, si lo rechaza,
            // una segunda oferta despues con un descuento real en la lectura por categoría. ----
            function setupPromoModals(p) {
                var promoModal = document.getElementById('promoModal');
                var discModal = document.getElementById('promoDiscountModal');
                if (!promoModal || !discModal) return;
                var shownFlag = 'tarot_promo_shown';
                document.getElementById('promoPlanPrice').textContent = '$' + p.plan + ' ' + p.currency;
                document.getElementById('promoCatPrice').textContent = '$' + p.category + ' ' + p.currency;
                document.getElementById('promoDiscountOld').textContent = '$' + p.category + ' ' + p.currency;
                document.getElementById('promoDiscountNew').textContent = '$' + p.categoryDiscount + ' ' + p.currency;

                var alreadyShown = false;
                try { alreadyShown = sessionStorage.getItem(shownFlag) === '1'; } catch (e) {}
                if (alreadyShown || __mpPagoReturn) return;

                setTimeout(function() {
                    if (getComputedStyle(document.getElementById('birthdayModal')).display !== 'none') return; // no pisar el de bienvenida
                    promoModal.style.display = 'flex';
                    try { sessionStorage.setItem(shownFlag, '1'); } catch (e) {}
                }, 12000);

                function closePromo() { promoModal.style.display = 'none'; }
                document.getElementById('promoModalClose').addEventListener('click', closePromo);
                document.getElementById('promoSkipBtn').addEventListener('click', function() {
                    closePromo();
                    setTimeout(function() { discModal.style.display = 'flex'; }, 25000);
                });
                document.getElementById('promoPlanBtn').addEventListener('click', function() {
                    closePromo();
                    document.querySelector('[data-view="tirada"]').click();
                    if (window.Account) Account.openSubscribeModal();
                    else document.getElementById('authModal').style.display = 'flex';
                });
                document.getElementById('promoTiradaBtn').addEventListener('click', function() {
                    closePromo();
                    var link = document.querySelector('[data-view="tirada"]');
                    if (link) link.click();
                    var target = document.getElementById('categoriaGrid');
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });

                document.getElementById('promoDiscountClose').addEventListener('click', function() { discModal.style.display = 'none'; });
                document.getElementById('promoDiscountSkipBtn').addEventListener('click', function() { discModal.style.display = 'none'; });
                document.querySelectorAll('#promoDiscountModal [data-discount-item]').forEach(function(btn) {
                    btn.addEventListener('click', function() {
                        var item = btn.getAttribute('data-discount-item');
                        discModal.style.display = 'none';
                        var link = document.querySelector('[data-view="tirada"]');
                        if (link) link.click();
                        startCheckout(item, btn, document.getElementById('promoDiscountError'), true);
                    });
                });
            }

            // ---- Tokens de desbloqueo (persisten en este navegador) ----
            function getToken(item) {
                try {
                    var raw = localStorage.getItem('tarot_unlock_' + item);
                    if (!raw) return null;
                    var d = JSON.parse(raw);
                    if (!d.token || Date.now() > d.exp) return null;
                    return d.token;
                } catch (e) { return null; }
            }
            function saveToken(item, token, exp) {
                try { localStorage.setItem('tarot_unlock_' + item, JSON.stringify({ token: token, exp: exp })); } catch (e) {}
            }

            // Abre el pago con el botón oficial de Mercado Pago (Wallet), que prioriza
            // abrir la app instalada del usuario; si no la tiene, usa el checkout del navegador.
            function openMpModal(url) {
                var overlay = document.getElementById('mpModalOverlay');
                var container = document.getElementById('mpWalletContainer');
                var loading = document.getElementById('mpWalletLoading');
                container.innerHTML = '';
                overlay.style.display = 'flex';

                if (!mpPublicKey || typeof MercadoPago === 'undefined') {
                    location.href = url; // sin SDK/Public Key: va directo al checkout
                    return;
                }
                loading.style.display = '';
                try {
                    if (!mpInstance) mpInstance = new MercadoPago(mpPublicKey, { locale: 'es-AR' });
                    var prefId = new URL(url).searchParams.get('pref_id');
                    var bricks = mpInstance.bricks();
                    bricks.create('wallet', 'mpWalletContainer', {
                        initialization: { preferenceId: prefId, redirectMode: 'self' },
                        customization: { texts: { valueProp: 'smart_option' } }
                    }).then(function() { loading.style.display = 'none'; })
                      .catch(function() { loading.style.display = 'none'; location.href = url; });
                } catch (e) {
                    loading.style.display = 'none';
                    location.href = url;
                }
            }
            var mpModalCloseBtn = document.getElementById('mpModalClose');
            if (mpModalCloseBtn) {
                mpModalCloseBtn.addEventListener('click', function() {
                    document.getElementById('mpModalOverlay').style.display = 'none';
                    document.getElementById('mpWalletContainer').innerHTML = '';
                });
            }

            var pendingPayment = null; // { item, ref, errEl } — pago abierto, esperando confirmación

            async function startCheckout(item, btn, errEl, discount) {
                if (btn) btn.disabled = true;
                if (errEl) tHideEl(errEl);
                try {
                    var res = await fetch('/api/payment', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item: item, discount: !!discount })
                    });
                    var data = await res.json();
                    if (!res.ok || !data.url) throw new Error(data.error || 'No se pudo iniciar el pago');
                    try {
                        sessionStorage.setItem('tarot_pending_item', item);
                        if (data.ref) sessionStorage.setItem('tarot_pending_ref', data.ref);
                    } catch (e) {}
                    pendingPayment = { item: item, ref: data.ref, errEl: errEl };
                    openMpModal(data.url);
                } catch (err) {
                    if (errEl) tShowError(errEl, err.message);
                } finally {
                    if (btn) btn.disabled = false;
                }
            }

            // Cuando el pago se completa DENTRO de la app de Mercado Pago (el botón Wallet la abre
            // si está instalada), el usuario vuelve a esta pestaña a mano y no hay redirección de
            // Mercado Pago. Al recuperar el foco, se pregunta "¿ya se aprobó?" por la referencia del pago.
            var pollTimer = null;
            async function pollPendingPayment() {
                var pending = pendingPayment;
                if (!pending && sessionStorage) {
                    try {
                        var it = sessionStorage.getItem('tarot_pending_item'), rf = sessionStorage.getItem('tarot_pending_ref');
                        if (it && rf) pending = { item: it, ref: rf, errEl: document.getElementById(it === 'full' ? 'tiradaPayError' : 'categoriaPayError') };
                    } catch (e) {}
                }
                if (!pending || !pending.ref || getToken(pending.item)) return;
                clearTimeout(pollTimer);
                var attempts = 0;
                (function tick() {
                    attempts++;
                    fetch('/api/verify-payment?ref=' + encodeURIComponent(pending.ref))
                        .then(function(r) { return r.json(); })
                        .then(function(data) {
                            if (data && data.approved) {
                                pendingPayment = null;
                                try { sessionStorage.removeItem('tarot_pending_item'); sessionStorage.removeItem('tarot_pending_ref'); } catch (e) {}
                                document.getElementById('mpModalOverlay').style.display = 'none';
                                saveToken(data.item, data.token, Date.now() + 1000 * 60 * 60 * 24 * 30);
                                if (data.item === 'oraculo') doOracleConsult();
                                else runPremiumReading(data.item, data.token);
                            } else if (attempts < 20) {
                                pollTimer = setTimeout(tick, 3000);
                            }
                        }).catch(function() {
                            if (attempts < 20) pollTimer = setTimeout(tick, 3000);
                        });
                })();
            }
            document.addEventListener('visibilitychange', function() { if (!document.hidden) pollPendingPayment(); });
            window.addEventListener('focus', pollPendingPayment);

            // ---- Lecturas pagas guardadas: una tirada, una vez. No se vuelve a sortear al volver a entrar. ----
            function savedKey(item) {
                var uid = (window.Account && Account.getUserId && Account.getUserId()) || 'guest';
                return 'tarot_saved_' + uid + '_' + item;
            }
            function storeSaved(item, saved) {
                try { sessionStorage.setItem(savedKey(item), JSON.stringify(saved)); } catch (e) {}
            }
            async function loadSaved(item) {
                try {
                    var raw = sessionStorage.getItem(savedKey(item));
                    if (raw) { var d = JSON.parse(raw); if (d && d.report) return d; }
                } catch (e) {}
                if (window.Account && Account.isLoggedIn && Account.isLoggedIn() && Account.getLatestReading) {
                    var db = await Account.getLatestReading(item);
                    if (db) { storeSaved(item, db); return db; }
                }
                return null;
            }
            function showSaved(item, saved, btn, errEl) {
                var isFull = item === 'full';
                var labels = isFull ? FULL_LABELS : CAT_LABELS;
                var deck = allCards();
                var picks = (saved.picks || []).map(function(p) {
                    var card = deck.filter(function(c) { return c.name === p.name; })[0];
                    return card ? { card: card, reversed: !!p.reversed } : null;
                }).filter(Boolean);
                renderSpread(document.getElementById(isFull ? 'fullSpread' : 'categoriaSpread'), picks, labels);
                if (!isFull) document.getElementById('categoriaTitle').textContent = '✦ Tu Lectura: ' + CAT_NAMES[item] + ' ✦';
                var outEl = document.getElementById(isFull ? 'fullAiOut' : 'categoriaAiOut');
                tRenderReport(outEl, saved.report);
                var note = document.createElement('p');
                note.className = 'ai-status';
                note.textContent = isFull
                    ? 'Esta es tu tirada general. Queda guardada y no cambia hasta que pidas otra.'
                    : 'Esta es tu lectura de esta categoría. Queda guardada y no cambia; para una nueva tirada hay que pagarla de nuevo.';
                outEl.appendChild(note);
                var again = document.createElement('button');
                again.className = 'astro-btn'; again.type = 'button'; again.textContent = 'Pedir otra tirada';
                again.addEventListener('click', function() { requestNew(item, btn, errEl); });
                outEl.appendChild(again);
                var resultEl = document.getElementById(isFull ? 'tiradaFullResult' : 'categoriaResult');
                resultEl.style.display = '';
                resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            // Pide una tirada NUEVA: con pago ya hecho (token), con cupo del plan (solo tirada general) o cobrando.
            async function requestNew(item, btn, errEl) {
                var token = getToken(item);
                if (token) { runPremiumReading(item, token, null, btn, errEl); return; }
                if (item === 'full' && window.Account && Account.isLoggedIn() && Account.hasActivePlan()) {
                    var left = Account.tiradasLeft();
                    if (left <= 0) {
                        tShowError(errEl, 'Ya usaste tus 4 tiradas generales de este mes. Se renuevan el mes próximo. Mientras tanto podés pagar una lectura por categoría, que es independiente.');
                        return;
                    }
                    if (!confirm('Tu plan incluye 4 tiradas generales por mes y te quedan ' + left + '. Esta va a usar 1, y no se renuevan hasta el mes próximo. ¿Continuar?')) return;
                    var jwt = await Account.getAccessToken();
                    if (jwt) { runPremiumReading(item, null, jwt, btn, errEl); return; }
                }
                startCheckout(item, btn, errEl);
            }
            async function openOrRequest(item, btn, errEl) {
                var saved = await loadSaved(item);
                if (saved) { showSaved(item, saved, btn, errEl); return; }
                requestNew(item, btn, errEl);
            }

            var unlockFullBtn = document.getElementById('unlockFullBtn');
            if (unlockFullBtn) {
                unlockFullBtn.addEventListener('click', function() {
                    openOrRequest('full', unlockFullBtn, document.getElementById('tiradaPayError'));
                });
            }
            document.querySelectorAll('.categoria-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    openOrRequest(btn.getAttribute('data-item'), btn, document.getElementById('categoriaPayError'));
                });
            });

            async function runPremiumReading(item, token, jwt, btn, errEl) {
                var isFull = item === 'full';
                var spreadEl = document.getElementById(isFull ? 'fullSpread' : 'categoriaSpread');
                var outEl = document.getElementById(isFull ? 'fullAiOut' : 'categoriaAiOut');
                var resultEl = document.getElementById(isFull ? 'tiradaFullResult' : 'categoriaResult');
                var labels = isFull ? FULL_LABELS : CAT_LABELS;
                var picks = drawSpread(labels.length);
                renderSpread(spreadEl, picks, labels);
                if (!isFull) document.getElementById('categoriaTitle').textContent = '✦ Tu Lectura: ' + CAT_NAMES[item] + ' ✦';
                resultEl.style.display = '';
                outEl.innerHTML = '<p class="ai-status">Interpretando tu tirada…</p>';
                resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                try {
                    var headers = { 'Content-Type': 'application/json' };
                    if (jwt) headers['Authorization'] = 'Bearer ' + jwt;
                    var res = await fetch('/api/tarot-report', {
                        method: 'POST', headers: headers,
                        body: JSON.stringify({
                            item: item, token: token,
                            cards: picks.map(function(p, i) { return { position: labels[i], name: p.card.name, reversed: p.reversed, meaning: p.card.desc }; })
                        })
                    });
                    var data = await res.json();
                    if (!res.ok) {
                        if (res.status === 402 && token) { try { localStorage.removeItem('tarot_unlock_' + item); } catch (e) {} }
                        throw new Error(data.error || 'No se pudo generar la lectura');
                    }
                    var saved = { item: item, report: data.report, picks: picks.map(function(p) { return { name: p.card.name, reversed: p.reversed }; }) };
                    storeSaved(item, saved);
                    // El pago se usó: ese token ya no habilita otra tirada.
                    if (token) { try { localStorage.removeItem('tarot_unlock_' + item); } catch (e) {} }
                    showSaved(item, saved, btn, errEl);
                    if (window.Account && jwt && Account.refreshProfile) Account.refreshProfile();
                    if (window.Account) {
                        Account.logReading(isFull ? 'tirada_full' : 'tirada_categoria',
                            (isFull ? 'Lectura completa' : CAT_NAMES[item]) + ': ' + picks.map(function(p) { return p.card.name; }).join(', '), saved);
                    }
                } catch (err) {
                    outEl.innerHTML = '<p class="ai-status">' + err.message + '</p>';
                }
            }

            // ---- Vuelta desde Mercado Pago ----
            (function checkPaymentReturn() {
                var qs = new URLSearchParams(location.search);
                var paymentId = qs.get('payment_id') || qs.get('collection_id');
                var pago = qs.get('pago');
                if (!paymentId && !pago) return;
                var item = qs.get('item') || (function() { try { return sessionStorage.getItem('tarot_pending_item'); } catch (e) { return null; } })();
                history.replaceState({}, '', location.pathname);
                if (pago !== 'exito' || !paymentId || !item) return;
                (async function() {
                    var isOraculo = item === 'oraculo';
                    var errEl = document.getElementById(isOraculo ? 'signalLimitMsg' : (item === 'full' ? 'tiradaPayError' : 'categoriaPayError'));
                    // Se espera al siguiente tick: recién ahí ya está armado el resto de la página
                    // (el link de menú todavía no tiene su listener en este punto del script).
                    await new Promise(function(r) { setTimeout(r, 0); });
                    var destLink = document.querySelector('[data-view="' + (isOraculo ? 'signal' : 'tirada') + '"]');
                    if (destLink) destLink.click();
                    try {
                        var res = await fetch('/api/verify-payment?payment_id=' + encodeURIComponent(paymentId));
                        var data = await res.json();
                        if (!res.ok || !data.approved) throw new Error((data && data.error) || 'El pago no se pudo confirmar todavía. Si ya pagaste, esperá un minuto y volvé a intentar.');
                        saveToken(data.item, data.token, Date.now() + 1000 * 60 * 60 * 24 * 30);
                        if (data.item === 'oraculo') doOracleConsult();
                        else runPremiumReading(data.item, data.token);
                    } catch (err) {
                        if (errEl) tShowError(errEl, err.message);
                    }
                })();
            })();

        // === VIEW SWITCHING ===
        var cardsSection = document.querySelector('.cards-section');
        var zodiacSection = document.querySelector('.zodiac-section');
        var housesSection = document.querySelector('.houses-section');
        var planetsSection = document.querySelector('.planets-section');
        var elementsSection = document.querySelector('.elements-section');
        var modalidadesSection = document.querySelector('.modalidades-section');
        var natalSection = document.querySelector('.natal-section');
        var horoscopeSection = document.querySelector('.horoscope-section');
        var compatibilitySection = document.querySelector('.compatibility-section');
        var tiradaSection = document.querySelector('.tirada-section');
        var transitsSection = document.querySelector('.transits-section');
        var recsSection = document.querySelector('.recommendations-section');
        var intro = document.getElementById('intro');

        // Initial state: hide cards, zodiac, houses, planets, elements
        cardsSection.classList.add('view-hidden');
        zodiacSection.classList.add('view-hidden');
        housesSection.classList.add('view-hidden');
        planetsSection.classList.add('view-hidden');
        elementsSection.classList.add('view-hidden');
        modalidadesSection.classList.add('view-hidden');
        natalSection.classList.add('view-hidden');
        horoscopeSection.classList.add('view-hidden');
        compatibilitySection.classList.add('view-hidden');
        tiradaSection.classList.add('view-hidden');

        var viewLinks = document.querySelectorAll('.nav-links a[data-view]');
        viewLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var view = this.getAttribute('data-view');
                viewLinks.forEach(function(l) { l.classList.remove('active'); });
                this.classList.add('active');
                cardsSection.classList.add('view-hidden');
                zodiacSection.classList.add('view-hidden');
                housesSection.classList.add('view-hidden');
                planetsSection.classList.add('view-hidden');
elementsSection.classList.add('view-hidden');
                modalidadesSection.classList.add('view-hidden');
                natalSection.classList.add('view-hidden');
                horoscopeSection.classList.add('view-hidden');
                compatibilitySection.classList.add('view-hidden');
                tiradaSection.classList.add('view-hidden');
                transitsSection.classList.add('view-hidden');
                recsSection.classList.add('view-hidden');
                if (view === 'cards') {
                    cardsSection.classList.remove('view-hidden');
                    document.getElementById('navLinks').classList.remove('open');
                    cardsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (view === 'zodiac') {
                    zodiacSection.classList.remove('view-hidden');
                    document.getElementById('navLinks').classList.remove('open');
                    zodiacSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (view === 'houses') {
                    housesSection.classList.remove('view-hidden');
                    document.getElementById('navLinks').classList.remove('open');
                    housesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (view === 'planets') {
                    planetsSection.classList.remove('view-hidden');
                    document.getElementById('navLinks').classList.remove('open');
                    planetsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (view === 'elements') {
                    elementsSection.classList.remove('view-hidden');
                    document.getElementById('navLinks').classList.remove('open');
                    elementsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (view === 'modalidades') {
                    modalidadesSection.classList.remove('view-hidden');
                    document.getElementById('navLinks').classList.remove('open');
                    modalidadesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (view === 'natal') {
                    natalSection.classList.remove('view-hidden');
                    document.getElementById('navLinks').classList.remove('open');
                    natalSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (view === 'horoscope') {
                    horoscopeSection.classList.remove('view-hidden');
                    document.getElementById('navLinks').classList.remove('open');
                    horoscopeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (view === 'compatibility') {
                    compatibilitySection.classList.remove('view-hidden');
                    document.getElementById('navLinks').classList.remove('open');
                    compatibilitySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (view === 'tirada') {
                    tiradaSection.classList.remove('view-hidden');
                    document.getElementById('navLinks').classList.remove('open');
                    tiradaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (view === 'signal') {
                    transitsSection.classList.remove('view-hidden');
                    recsSection.classList.remove('view-hidden');
                    document.getElementById('navLinks').classList.remove('open');
                    document.getElementById('signal').scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    transitsSection.classList.remove('view-hidden');
                    recsSection.classList.remove('view-hidden');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });

        // === CARTAS SUB-NAV ===
        var subNav = document.createElement('div');
        subNav.className = 'nav-sections';
        subNav.innerHTML =
            '<a href="#major" class="nav-section">Arcanos Mayores</a>' +
            '<a href="#wands" class="nav-section">Bastos</a>' +
            '<a href="#cups" class="nav-section">Copas</a>' +
            '<a href="#swords" class="nav-section">Espadas</a>' +
            '<a href="#pentacles" class="nav-section">Oros</a>';
        cardsSection.querySelector('.subtitle').after(subNav);

        // === SUB-NAV ACTIVE ON SCROLL ===
        var sections = document.querySelectorAll('.fade-section[id]');
        var subLinks = document.querySelectorAll('.cards-section .nav-section');
        window.addEventListener('scroll', function() {
            var current = '';
            sections.forEach(function(s) {
                var top = s.getBoundingClientRect().top;
                if (top < 120) { current = s.id; }
            });
            subLinks.forEach(function(a) {
                a.classList.toggle('active', a.getAttribute('href') === '#' + current);
            });
        });

        // === INTERSECTION OBSERVER ===
        document.querySelectorAll('.fade-section').forEach(function(el) { el.classList.add('visible'); });
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) {
                if (e.isIntersecting) { e.target.classList.add('visible'); }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.fade-section').forEach(function(el) { observer.observe(el); });

        // === TRACKING: user affinity ===
        var affinity = { major:0, wands:0, cups:0, swords:0, pentacles:0, signs:{} };
        // Track sub-nav clicks
        document.querySelectorAll('.nav-section').forEach(function(a) {
            a.addEventListener('click', function() {
                var key = this.getAttribute('href').replace('#','');
                if (affinity[key] !== undefined) affinity[key]++;
            });
        });
        // Map sign to its elemental suit
        var signSuitMap = {
            'Aries':'wands','Leo':'wands','Sagitario':'wands',
            'Tauro':'pentacles','Virgo':'pentacles','Capricornio':'pentacles',
            'Géminis':'swords','Libra':'swords','Acuario':'swords',
            'Cáncer':'cups','Escorpio':'cups','Piscis':'cups'
        };
        // Track sign card clicks
        var zodiacObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) {
                if (e.isIntersecting) {
                    var name = e.target.getAttribute('data-sign');
                    if (name) {
                        affinity.signs[name] = (affinity.signs[name] || 0) + 1;
                        var suit = signSuitMap[name];
                        if (suit) affinity[suit] = (affinity[suit] || 0) + 0.5;
                    }
                }
            });
        }, { threshold: 0.3 });
        document.querySelectorAll('.zodiac-card').forEach(function(card) {
            zodiacObserver.observe(card);
            card.addEventListener('click', function(e) {
                var name = this.getAttribute('data-sign') || 'unknown';
                affinity.signs[name] = (affinity.signs[name] || 0) + 2;
                var suit = signSuitMap[name];
                if (suit) affinity[suit] = (affinity[suit] || 0) + 1;
                this.classList.toggle('flipped');
            });
        });

        // === FLAT CARD LIST ===
        function allCards() {
            var out = [];
            ['major','wands','cups','swords','pentacles'].forEach(function(suit) {
                cardData[suit].forEach(function(c) { out.push(c); });
            });
            return out;
        }

        // === ORÁCULO (I Ching) ===
        var oraculoFrases = [
            'Confía en el ritmo del universo.',
            'Tu intuición es tu brújula más fiel.',
            'Lo que buscas también te está buscando.',
            'El silencio guarda las respuestas que tu alma necesita.',
            'No fuerces lo que debe llegar en su tiempo.',
            'Mira hacia adentro, ahí está tu verdad.',
            'Cada final es una puerta que no habías visto.',
            'La paciencia es la llave que abre los sellos del destino.',
            'Tu luz es más poderosa de lo que crees.',
            'Escuchá el susurro de las estrellas.',
            'Soltar no es perder, es hacer espacio.',
            'El cosmos te sostiene aunque no lo sientas.',
            'Todo lo que llega a tu vida viene para enseñarte.',
            'Tu corazón ya sabe el camino, solo debés seguirle.',
            'Las coincidencias no existen, son señales.',
            'La tormenta también trae semillas de renovación.',
            'Honrá tu propio proceso, no hay prisas.',
            'Lo inesperado trae el regalo que más necesitás.',
            'Tu alma eligió esta experiencia para crecer.',
            'El cambio no es tu enemigo, es tu guía.',
            'Respirá profundo: el universo está de tu lado.',
            'No hay errores, solo lecciones disfrazadas.',
            'La respuesta está más cerca de lo que imaginás.',
            'Permitite recibir lo que el universo tiene para darte.',
            'Tu poder nace de tu autenticidad.',
        ];
        var signalBtn = document.getElementById('signalBtn');
        var signalPlaceholder = document.getElementById('signalPlaceholder');
        var signalResult = document.getElementById('signalResult');

        function renderHexLines(container, lines, moving) {
            container.innerHTML = '';
            for (var i = 5; i >= 0; i--) {
                var row = document.createElement('div');
                row.className = 'hex-line' + (lines[i] ? ' yang' : ' yin') + (moving && moving.indexOf(i) !== -1 ? ' moving' : '');
                if (lines[i]) {
                    row.innerHTML = '<span class="hex-bar"></span>';
                } else {
                    row.innerHTML = '<span class="hex-bar hex-bar-l"></span><span class="hex-bar hex-bar-r"></span>';
                }
                container.appendChild(row);
            }
        }

        function doOracleConsult() {
            if (!window.IChing) return;
            var r = IChing.cast();
            renderHexLines(document.getElementById('hexLines'), r.primary.lines, r.moving);
            document.getElementById('hexNumber').textContent = 'Hexagrama ' + r.primary.num;
            document.getElementById('hexName').textContent = r.primary.name;
            document.getElementById('hexMeaning').textContent = r.primary.meaning;
            document.getElementById('hexAdvice').textContent = r.primary.advice;
            var resultBlock = document.getElementById('hexResultBlock');
            if (r.result) {
                document.getElementById('hexResultName').textContent = r.result.num + '. ' + r.result.name;
                document.getElementById('hexResultText').textContent = r.result.meaning;
                renderHexLines(document.getElementById('hexResultLines'), r.result.lines, null);
                resultBlock.style.display = '';
            } else {
                resultBlock.style.display = 'none';
            }
            document.getElementById('hexPhrase').textContent = oraculoFrases[Math.floor(Math.random() * oraculoFrases.length)];
            signalPlaceholder.style.display = 'none';
            signalResult.classList.add('show');
            if (window.Account) Account.logReading('oraculo', r.primary.num + '. ' + r.primary.name);
            signalResult.style.opacity = '0';
            signalResult.style.transform = 'scale(0.8)';
            setTimeout(function() {
                signalResult.style.transition = 'all 0.5s ease';
                signalResult.style.opacity = '1';
                signalResult.style.transform = 'scale(1)';
            }, 50);
        }

        // El I Ching da 1 consulta gratis; de ahí en más hace falta pagar (o tener el plan).
        var ORACULO_PRICE_ID = 'oraculo';
        signalBtn.addEventListener('click', async function() {
            var limitMsg = document.getElementById('signalLimitMsg');
            var unlocked = (window.Account && Account.hasActivePlan()) || !!getToken(ORACULO_PRICE_ID);
            if (!unlocked && window.Account) {
                var quota = await Account.checkAndCountSenal();
                unlocked = quota.allowed;
            }
            if (!unlocked) {
                var priceTxt = window.__oraculoPrice ? (' ($' + window.__oraculoPrice + ')') : '';
                limitMsg.innerHTML = 'Ya usaste tu consulta gratis al or&aacute;culo. ' +
                    '<a href="#" id="signalPayLink">Pag&aacute; una consulta' + priceTxt + '</a> o conseguí el <a href="#" id="signalPlanLink">plan mensual</a> para consultas ilimitadas.';
                limitMsg.style.display = '';
                var payLink = document.getElementById('signalPayLink');
                if (payLink) payLink.addEventListener('click', function(e) { e.preventDefault(); startCheckout(ORACULO_PRICE_ID, signalBtn, limitMsg); });
                var planLink = document.getElementById('signalPlanLink');
                if (planLink) planLink.addEventListener('click', function(e) { e.preventDefault(); Account.openSubscribeModal(); });
                return;
            }
            limitMsg.style.display = 'none';
            doOracleConsult();
        });

        // === Modal de bienvenida: iniciar sesión (opcional) u omitir ===
        // El "alma"/insignia de signo en el menú solo aparece para quien se registra; entrar sin
        // cuenta sigue dejando usar el sitio entero (carta natal incluida) con normalidad.
        (function() {
            var modal = document.getElementById('birthdayModal');
            if (!localStorage.getItem('astroWelcomeSeen') && !__mpPagoReturn) {
                modal.style.display = 'flex';
            }
            document.getElementById('welcomeSkipBtn').addEventListener('click', function() {
                localStorage.setItem('astroWelcomeSeen', '1');
                modal.style.display = 'none';
            });
            document.getElementById('welcomeLoginBtn').addEventListener('click', function() {
                localStorage.setItem('astroWelcomeSeen', '1');
                modal.style.display = 'none';
                if (window.Account) Account.openAuthModal(false);
                else document.getElementById('authModal').style.display = 'flex';
            });
            document.getElementById('welcomeSignupBtn').addEventListener('click', function() {
                localStorage.setItem('astroWelcomeSeen', '1');
                modal.style.display = 'none';
                if (window.Account) Account.openAuthModal(true);
                else document.getElementById('authModal').style.display = 'flex';
            });
            document.getElementById('navProfileBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                if (window.Account && Account.isLoggedIn()) {
                    document.getElementById('accountModal').style.display = 'flex';
                } else {
                    document.getElementById('authModal').style.display = 'flex';
                }
            });
        })();

        function showUserProfile(dateStr) {
            var parts = dateStr.split('-');
            var sign = getZodiacSign(parseInt(parts[2]), parseInt(parts[1]));
            window.lastProfileSign = sign;
            window.lastProfileDate = dateStr;
            var userNames = {
                'Aries':'Alma de Aries','Tauro':'Corazón de Tauro','Géminis':'Mente de Géminis',
                'Cáncer':'Espíritu de Cáncer','Leo':'Fuego de Leo','Virgo':'Sabiduría de Virgo',
                'Libra':'Armonía de Libra','Escorpio':'Misterio de Escorpio','Sagitario':'Flecha de Sagitario',
                'Capricornio':'Monte de Capricornio','Acuario':'Estrella de Acuario','Piscis':'Océano de Piscis'
            };
            var userName = userNames[sign.name] || 'Alma de ' + sign.name;
            var detail = sign.sym + ' ' + sign.name + ' · ' + sign.element;
            document.getElementById('navProfileName').textContent = userName;
            document.getElementById('navProfileDetail').textContent = detail;
            // Avatar: element-based colors
            var avatar = document.getElementById('navProfileAvatar');
            var avatarColors = {
                'Fuego': 'rgba(220,38,38,0.15)',
                'Tierra': 'rgba(34,197,94,0.15)',
                'Aire': 'rgba(96,165,250,0.15)',
                'Agua': 'rgba(34,211,238,0.15)'
            };
            var avatarBorders = {
                'Fuego': 'rgba(220,38,38,0.3)',
                'Tierra': 'rgba(34,197,94,0.3)',
                'Aire': 'rgba(96,165,250,0.3)',
                'Agua': 'rgba(34,211,238,0.3)'
            };
            avatar.style.background = avatarColors[sign.element] || '';
            avatar.style.borderColor = avatarBorders[sign.element] || '';
            document.getElementById('navProfile').classList.add('show');
            // Restore uploaded photo if exists
            var savedPhoto = localStorage.getItem('astroAvatar');
            if (savedPhoto) {
                var img = document.getElementById('navAvatarImg');
                img.src = savedPhoto;
                img.classList.add('uploaded');
            }
        }

        // === Avatar Upload ===
        (function() {
            var avatar = document.getElementById('navProfileAvatar');
            var upload = document.getElementById('avatarUpload');
            avatar.addEventListener('click', function(e) {
                if (e.target === document.getElementById('navProfileBtn') || e.target.closest('.nav-profile-btn')) return;
                if (!document.getElementById('navProfile').classList.contains('show')) return;
                upload.click();
            });
            upload.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(ev) {
                    var dataUrl = ev.target.result;
                    var img = document.getElementById('navAvatarImg');
                    img.src = dataUrl;
                    img.classList.add('uploaded');
                    localStorage.setItem('astroAvatar', dataUrl);
                };
                reader.readAsDataURL(file);
                upload.value = '';
            });
        })();

        // === Profile Modal ===
        var signTraits = {
            'Aries':'Valiente, en&eacute;rgico, impulsivo y l&iacute;der natural. Los arianos son pioneros que siempre est&aacute;n listos para iniciar nuevos proyectos con entusiasmo y determinaci&oacute;n.',
            'Tauro':'Paciente, leal, sensual y persistente. Los taurinos valoran la estabilidad, el confort y los placeres de la vida, construyendo su seguridad con paso firme.',
            'G&eacute;minis':'Vers&aacute;til, curioso, comunicativo e ingenioso. Los geminianos tienen mentes inquietas que buscan constantemente nuevo conocimiento y est&iacute;mulo intelectual.',
            'C&aacute;ncer':'Emocional, intuitivo, protector y hogare&ntilde;o. Los cancerianos son profundamente sensibles y leales a sus seres queridos, guiados por su coraz&oacute;n.',
            'Leo':'Creativo, generoso, dram&aacute;tico y apasionado. Los leoninos irradian confianza y carisma natural, brillando en todo lo que hacen.',
            'Virgo':'Anal&iacute;tico, meticuloso, pr&aacute;ctico y servicial. Los virginianos poseen una atenci&oacute;n al detalle excepcional y un deseo innato de ser &uacute;tiles.',
            'Libra':'Diplom&aacute;tico, encantador, justo y sociable. Los librianos buscan el equilibrio y la armon&iacute;a en todo, con un refinado sentido est&eacute;tico.',
            'Escorpio':'Intenso, misterioso, apasionado y transformador. Los escorpianos poseen una profundidad emocional incomparable y una fuerza de voluntad inquebrantable.',
            'Sagitario':'Aventurero, optimista, fil&oacute;sofo y expansivo. Los sagitarianos son buscadores de la verdad y el significado, siempre mirando hacia nuevos horizontes.',
            'Capricornio':'Ambicioso, disciplinado, responsable y perseverante. Los capricornianos construyen su &eacute;xito con paciencia y una &eacute;tica de trabajo inquebrantable.',
            'Acuario':'Innovador, humanitario, independiente y visionario. Los acuarianos piensan en el futuro y en el bien colectivo, con ideas originales y progresistas.',
            'Piscis':'So&ntilde;ador, compasivo, art&iacute;stico y espiritual. Los piscianos tienen una conexi&oacute;n profunda con el mundo intangible y una sensibilidad extraordinaria.'
        };
        var signCompat = {
            'Aries':'&bull; Leo &bull; Sagitario &bull; G&eacute;minis &bull; Acuario',
            'Tauro':'&bull; Virgo &bull; Capricornio &bull; C&aacute;ncer &bull; Piscis',
            'G&eacute;minis':'&bull; Libra &bull; Acuario &bull; Aries &bull; Leo',
            'C&aacute;ncer':'&bull; Escorpio &bull; Piscis &bull; Tauro &bull; Virgo',
            'Leo':'&bull; Aries &bull; Sagitario &bull; G&eacute;minis &bull; Libra',
            'Virgo':'&bull; Tauro &bull; Capricornio &bull; C&aacute;ncer &bull; Escorpio',
            'Libra':'&bull; G&eacute;minis &bull; Acuario &bull; Leo &bull; Sagitario',
            'Escorpio':'&bull; C&aacute;ncer &bull; Piscis &bull; Virgo &bull; Capricornio',
            'Sagitario':'&bull; Aries &bull; Leo &bull; Libra &bull; Acuario',
            'Capricornio':'&bull; Tauro &bull; Virgo &bull; Escorpio &bull; Piscis',
            'Acuario':'&bull; G&eacute;minis &bull; Libra &bull; Aries &bull; Sagitario',
            'Piscis':'&bull; C&aacute;ncer &bull; Escorpio &bull; Tauro &bull; Capricornio'
        };
        var modoDesc = {
            'Cardinal':'Tu signo es de modalidad Cardinal. Los signos cardinales (Aries, C&aacute;ncer, Libra, Capricornio) son pioneros naturales: inician ciclos, lideran con energ&iacute;a y tienen un esp&iacute;ritu emprendedor. Tu fortaleza es la capacidad de tomar la iniciativa y moverte con determinaci&oacute;n.',
            'Fijo':'Tu signo es de modalidad Fija. Los signos fijos (Tauro, Leo, Escorpio, Acuario) son la roca del zod&iacute;aco: perseverantes, leales y estables. Tu fortaleza es la resistencia, la constancia y la capacidad de mantener el rumbo frente a cualquier obst&aacute;culo.',
            'Mutable':'Tu signo es de modalidad Mutable. Los signos mutables (G&eacute;minis, Virgo, Sagitario, Piscis) son flexibles y adaptables: fluyen con el cambio, comunican y transforman. Tu fortaleza es la versatilidad, la curiosidad y la capacidad de encontrar soluciones creativas.'
        };
        var solDesc = 'Tu Retorno Solar ocurre cada a&ntilde;o cerca de tu cumplea&ntilde;os, cuando el Sol regresa a la posici&oacute;n exacta que ocupaba en el momento de tu nacimiento. Este ciclo marca un a&ntilde;o astrol&oacute;gico personal: los temas que se activan en tu carta durante ese per&iacute;odo revelan las &aacute;reas de enfoque, crecimiento y desaf&iacute;o para el a&ntilde;o entrante. Es un momento ideal para reflexionar, establecer intenciones y alinearte con tu prop&oacute;sito.';
        function openProfileModal() {
            var sign = window.lastProfileSign;
            if (!sign) return;
            document.getElementById('profileModalName').textContent = document.getElementById('navProfileName').textContent;
            document.getElementById('profileModalSign').textContent = sign.sym + ' ' + sign.name + ' · ' + sign.element + ' · ' + sign.modo;
            document.getElementById('profileModalModo').innerHTML = modoDesc[sign.modo] || '';
            document.getElementById('profileModalRasgos').innerHTML = signTraits[sign.name] || '';
            document.getElementById('profileModalCompat').innerHTML = signCompat[sign.name] || '';
            document.getElementById('profileModalCiclo').innerHTML = solDesc;
            var savedPhoto = localStorage.getItem('astroAvatar');
            var modalImg = document.getElementById('profileModalAvatarImg');
            if (savedPhoto) {
                modalImg.src = savedPhoto;
                modalImg.classList.add('uploaded');
            } else {
                modalImg.src = 'images/bola-de-cristal.png';
                modalImg.classList.remove('uploaded');
            }
            var avatar = document.getElementById('profileModalAvatar');
            var ec = {
                'Fuego':'rgba(220,38,38,0.15)','Tierra':'rgba(34,197,94,0.15)',
                'Aire':'rgba(96,165,250,0.15)','Agua':'rgba(34,211,238,0.15)'
            };
            var eb = {
                'Fuego':'rgba(220,38,38,0.3)','Tierra':'rgba(34,197,94,0.3)',
                'Aire':'rgba(96,165,250,0.3)','Agua':'rgba(34,211,238,0.3)'
            };
            avatar.style.background = ec[sign.element] || '';
            avatar.style.borderColor = eb[sign.element] || '';
            document.getElementById('profileModal').classList.add('open');
        }
        document.getElementById('navProfile').addEventListener('click', function(e) {
            if (e.target.closest('.nav-profile-btn')) return;
            if (e.target.closest('.nav-profile-avatar')) return;
            if (!document.getElementById('navProfile').classList.contains('show')) return;
            openProfileModal();
        });
        document.getElementById('profileModalClose').addEventListener('click', function() {
            document.getElementById('profileModal').classList.remove('open');
        });
        document.getElementById('profileModal').addEventListener('click', function(e) {
            if (e.target === this) document.getElementById('profileModal').classList.remove('open');
        });

        function getZodiacSign(day, month) {
            var signs = [
                { name: 'Capricornio', sym: '♑', element: 'Tierra', modo: 'Cardinal', planeta: 'Saturno', casa: '10ª', startM: 12, startD: 22, endM: 1, endD: 19 },
                { name: 'Acuario', sym: '♒', element: 'Aire', modo: 'Fijo', planeta: 'Urano', casa: '11ª', startM: 1, startD: 20, endM: 2, endD: 18 },
                { name: 'Piscis', sym: '♓', element: 'Agua', modo: 'Mutable', planeta: 'Neptuno', casa: '12ª', startM: 2, startD: 19, endM: 3, endD: 20 },
                { name: 'Aries', sym: '♈', element: 'Fuego', modo: 'Cardinal', planeta: 'Marte', casa: '1ª', startM: 3, startD: 21, endM: 4, endD: 19 },
                { name: 'Tauro', sym: '♉', element: 'Tierra', modo: 'Fijo', planeta: 'Venus', casa: '2ª', startM: 4, startD: 20, endM: 5, endD: 20 },
                { name: 'Géminis', sym: '♊', element: 'Aire', modo: 'Mutable', planeta: 'Mercurio', casa: '3ª', startM: 5, startD: 21, endM: 6, endD: 20 },
                { name: 'Cáncer', sym: '♋', element: 'Agua', modo: 'Cardinal', planeta: 'Luna', casa: '4ª', startM: 6, startD: 21, endM: 7, endD: 22 },
                { name: 'Leo', sym: '♌', element: 'Fuego', modo: 'Fijo', planeta: 'Sol', casa: '5ª', startM: 7, startD: 23, endM: 8, endD: 22 },
                { name: 'Virgo', sym: '♍', element: 'Tierra', modo: 'Mutable', planeta: 'Mercurio', casa: '6ª', startM: 8, startD: 23, endM: 9, endD: 22 },
                { name: 'Libra', sym: '♎', element: 'Aire', modo: 'Cardinal', planeta: 'Venus', casa: '7ª', startM: 9, startD: 23, endM: 10, endD: 22 },
                { name: 'Escorpio', sym: '♏', element: 'Agua', modo: 'Fijo', planeta: 'Plutón', casa: '8ª', startM: 10, startD: 23, endM: 11, endD: 21 },
                { name: 'Sagitario', sym: '♐', element: 'Fuego', modo: 'Mutable', planeta: 'Júpiter', casa: '9ª', startM: 11, startD: 22, endM: 12, endD: 21 }
            ];
            var d = day, m = month;
            var dateNum = m * 100 + d;
            for (var i = 0; i < signs.length; i++) {
                var s = signs[i];
                var sNum = s.startM * 100 + s.startD;
                var eNum = s.endM * 100 + s.endD;
                if (sNum <= eNum) {
                    if (dateNum >= sNum && dateNum <= eNum) return s;
                } else {
                    if (dateNum >= sNum || dateNum <= eNum) return s;
                }
            }
            return signs[0];
        }

        // === Transit Positions ===
        (function() {
            var grid = document.getElementById('transitsGrid');
            if (!grid) return;
            var now = new Date();
            var start = new Date(2026, 0, 1);
            var days = (now - start) / 86400000;
            var signs = ['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];
            var signSym = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
            var planets = [
                { name: 'Sol', sym: '☉', lon: 280, rate: 0.9856 },
                { name: 'Luna', sym: '☽', lon: 120, rate: 13.176 },
                { name: 'Mercurio', sym: '☿', lon: 255, rate: 1.2 },
                { name: 'Venus', sym: '♀', lon: 310, rate: 0.95 },
                { name: 'Marte', sym: '♂', lon: 235, rate: 0.524 },
                { name: 'Júpiter', sym: '♃', lon: 60, rate: 0.083 },
                { name: 'Saturno', sym: '♄', lon: 340, rate: 0.033 },
                { name: 'Urano', sym: '♅', lon: 55, rate: 0.012 },
                { name: 'Neptuno', sym: '♆', lon: 342, rate: 0.006 },
                { name: 'Plutón', sym: '♇', lon: 300, rate: 0.004 }
            ];
            for (var i = 0; i < planets.length; i++) {
                var p = planets[i];
                var lon = (p.lon + days * p.rate + 36000) % 360;
                var signIdx = Math.floor(lon / 30);
                var deg = Math.floor(lon % 30);
                var min = Math.floor((lon % 1) * 60);
                var card = document.createElement('div');
                card.className = 'transit-card';
                card.innerHTML = '<span class="planet-symbol">' + p.sym + '</span>' +
                    '<span class="planet-name">' + p.name + '</span>' +
                    '<span class="planet-sign">' + signSym[signIdx] + ' ' + signs[signIdx] + '</span>' +
                    '<span class="planet-degree">' + deg + '° ' + min + "'</span>";
                grid.appendChild(card);
            }
        })();

        // === PROKERALA API INTEGRATION ===
        (function() {
            var SIGNS = [
                { slug: 'aries', label: 'Aries' },
                { slug: 'taurus', label: 'Tauro' },
                { slug: 'gemini', label: 'Géminis' },
                { slug: 'cancer', label: 'Cáncer' },
                { slug: 'leo', label: 'Leo' },
                { slug: 'virgo', label: 'Virgo' },
                { slug: 'libra', label: 'Libra' },
                { slug: 'scorpio', label: 'Escorpio' },
                { slug: 'sagittarius', label: 'Sagitario' },
                { slug: 'capricorn', label: 'Capricornio' },
                { slug: 'aquarius', label: 'Acuario' },
                { slug: 'pisces', label: 'Piscis' }
            ];
            var SIGN_SLUGS = {
                'Aries':'aries','Tauro':'taurus','Géminis':'gemini','Cáncer':'cancer',
                'Leo':'leo','Virgo':'virgo','Libra':'libra','Escorpio':'scorpio',
                'Sagitario':'sagittarius','Capricornio':'capricorn','Acuario':'aquarius','Piscis':'pisces'
            };

            function fillSignSelect(sel) {
                sel.innerHTML = SIGNS.map(function(s) {
                    return '<option value="' + s.slug + '">' + s.label + '</option>';
                }).join('');
            }
            function prefillFromProfile(sel) {
                var sign = window.lastProfileSign;
                if (sign && SIGN_SLUGS[sign.name]) sel.value = SIGN_SLUGS[sign.name];
            }

            function showEl(el) { el.style.display = ''; }
            function hideEl(el) { el.style.display = 'none'; }
            function showError(el, msg) {
                el.textContent = msg;
                showEl(el);
            }

            async function geocodePlace(q) {
                if (!q) throw new Error('Ingresá la ciudad de nacimiento');
                var url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q);
                var res = await fetch(url, { headers: { 'Accept': 'application/json' } });
                if (!res.ok) throw new Error('No se pudo geolocalizar la ciudad');
                var data = await res.json();
                if (!data || !data.length) throw new Error('No se encontró la ciudad, probá con otro formato');
                return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            }

            async function getTzName(lat, lon) {
                try {
                    var om = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&timezone=auto&forecast_days=1&daily=temperature_2m_max';
                    var r0 = await fetch(om);
                    if (r0.ok) {
                        var d0 = await r0.json();
                        if (d0 && d0.timezone) return d0.timezone;
                    }
                } catch (e) {}
                try {
                    var url = 'https://api.bigdatacloud.net/data/timezone-by-location?latitude=' + lat + '&longitude=' + lon + '&json=true';
                    var res = await fetch(url);
                    if (res.ok) {
                        var data = await res.json();
                        if (data && data.ianaTimezone) return data.ianaTimezone;
                    }
                } catch (e) {}
                return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            }

            function tzOffsetMinutes(tz, date) {
                try {
                    var dtf = new Intl.DateTimeFormat('en-US', {
                        timeZone: tz, timeZoneName: 'shortOffset',
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
                    });
                    var parts = dtf.formatToParts(date);
                    var opt = null;
                    for (var i = 0; i < parts.length; i++) {
                        if (parts[i].type === 'timeZoneName') opt = parts[i].value;
                    }
                    if (opt === 'GMT' || opt === 'UTC') return 0;
                    var m = /GMT([+\-−])(\d{1,2})(?::(\d{2}))?/.exec(opt || '');
                    if (!m) return 0;
                    var sign = m[1] === '+' ? 1 : -1;
                    return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3] || '0', 10));
                } catch (e) { return 0; }
            }

            function naiveToIso(dtValue, tz) {
                var parts = dtValue.split('T');
                var d = parts[0].split('-');
                var t = parts[1].split(':');
                var date = new Date(Date.UTC(+d[0], +d[1] - 1, +d[2], +t[0], +t[1]));
                var off = tzOffsetMinutes(tz, date);
                var sign = off < 0 ? '-' : '+';
                var abs = Math.abs(off);
                var hh = String(Math.floor(abs / 60)).padStart(2, '0');
                var mm = String(abs % 60).padStart(2, '0');
                return dtValue + ':00' + sign + hh + ':' + mm;
            }

            function todayNoon() {
                var n = new Date();
                return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' +
                    String(n.getDate()).padStart(2, '0') + 'T12:00';
            }

            async function resolveProfile(dtEl, placeEl, unknownEl, label) {
                var dt = dtEl.value;
                var place = placeEl.value.trim();
                var unknown = unknownEl.checked;
                var geo = await geocodePlace(place);
                var tz = await getTzName(geo.lat, geo.lon);
                var iso;
                if (unknown) {
                    iso = naiveToIso(dt || todayNoon(), tz);
                } else {
                    if (!dt) throw new Error('Ingresá fecha y hora de ' + label);
                    iso = naiveToIso(dt, tz);
                }
                return {
                    datetime: iso,
                    coordinates: geo.lat + ',' + geo.lon,
                    unknown: unknown
                };
            }

            // ===== LECTURA POR REGLAS (sin IA) =====
            var READING = {
                base: {
                    'Sol': 'El Sol muestra tu núcleo esencial, tu vitalidad y el propósito que te hace brillar.',
                    'Luna': 'La Luna revela tu mundo emocional, tu memoria afectiva y cómo te cuidás.',
                    'Mercurio': 'Mercurio indica cómo pensás, hablás y aprendés: tu forma de conectar ideas.',
                    'Venus': 'Venus describe cómo amás, qué te atrae y de qué manera disfrutás la vida.',
                    'Marte': 'Marte marca tu impulso, tu coraje y la forma en que iniciás tus metas.',
                    'Júpiter': 'Júpiter señala tu sentido de expansión, tu suerte y aquello que te hace crecer.',
                    'Saturno': 'Saturno habla de tu disciplina, tus límites y la madurez que construís con los años.',
                    'Urano': 'Urano representa tu originalidad, tu necesidad de libertad y tu lado revolucionario.',
                    'Neptuno': 'Neptuno reúe tu intuición, tus sueños y tu conexión con lo invisible.',
                    'Plutón': 'Plutón muestra tus procesos de transformación profunda y tu poder interior.'
                },
                sign: {
                    'Sol': {
                        'Aries': 'Renovás tu fuego interior y avanzás con coraje cuando algo te apasiona.',
                        'Tauro': 'Tu luz brilla en la constancia, la lealtad y el disfrute de lo concreto.',
                        'Géminis': 'Brillás al comunicar, con curiosidad constante y la mente siempre en movimiento.',
                        'Cáncer': 'Tu luz se enciende cuidando a los tuyos y creando seguridad emocional.',
                        'Leo': 'Brillás con calidez creativa y un deseo genuino de inspirar a otros.',
                        'Virgo': 'Tu sol se expresa en el servicio, el orden y la búsqueda de la mejora.',
                        'Libra': 'Tu luz armoniza, une y busca belleza y equilibrio en cada vínculo.',
                        'Escorpio': 'Brillás en la intensidad, la profundidad y la transformación silenciosa.',
                        'Sagitario': 'Tu luz se expande en la aventura, la fe y el deseo de nuevos horizontes.',
                        'Capricornio': 'Tu sol madura con metas claras, responsabilidad y perseverancia.',
                        'Acuario': 'Brillás en la originalidad, la libertad y el compromiso con el grupo.',
                        'Piscis': 'Tu luz fluye en la empatía, la imaginación y la compasión.'
                    },
                    'Luna': {
                        'Aries': 'Reaccionás con impulso y entusiasmo; tu sensibilidad se mueve rápido.',
                        'Tauro': 'Tus emociones buscan calma, seguridad y vínculos estables.',
                        'Géminis': 'Sentís y pensás a la vez; necesitás poner en palabras lo que te pasa.',
                        'Cáncer': 'Tu mundo emocional es profundo, hogareño y de memoria fina.',
                        'Leo': 'Tu corazón necesita reconocimiento, calidez y expresión creativa.',
                        'Virgo': 'Cuidás a otros con atención al detalle; tu sensibilidad es práctica.',
                        'Libra': 'Buscás armonía; tu ánimo depende del equilibrio del vínculo.',
                        'Escorpio': 'Tus emociones son intensas y guardadas; amás en profundidad.',
                        'Sagitario': 'Tu ánimo se renueva con libertad, viajes y optimismo.',
                        'Capricornio': 'Tus sentimientos son serios y leales; mostrás poco pero sentís mucho.',
                        'Acuario': 'Necesitás distancia emocional y amistad para sentirte seguro.',
                        'Piscis': 'Tus emociones son esponja del entorno; muy empático y soñador.'
                    },
                    'Mercurio': {
                        'Aries': 'Pensás rápido, directo y decisivo; las vueltas te aburren.',
                        'Tauro': 'Pensás con sensatez, lentitud y firmeza; no cambiás de opinión fácil.',
                        'Géminis': 'Tu mente es versátil, curiosa y siempre conectando ideas.',
                        'Cáncer': 'Tu memoria afectiva ordena el pensamiento; recordás con el corazón.',
                        'Leo': 'Comunicás con calidez y algo de teatro; aprendés con la confianza encendida.',
                        'Virgo': 'Tu mente analiza, clasifica y busca la palabra exacta.',
                        'Libra': 'Pensás en términos de equilibrio; decidís mejor sopesando opciones.',
                        'Escorpio': 'Tu mente investiga en profundidad; no te gustan las medias palabras.',
                        'Sagitario': 'Tu mente vuela hacia ideas grandes; hablás con franqueza.',
                        'Capricornio': 'Pensás en estructuras y consecuencias; tu palabra es medida.',
                        'Acuario': 'Pensás distinto al resto; innovás con la lógica del futuro.',
                        'Piscis': 'Tu mente es intuitiva y poética; captás más de lo que se dice.'
                    },
                    'Venus': {
                        'Aries': 'Amás con fuego y conquista; te lanzás sin miedo al vínculo.',
                        'Tauro': 'Amás con los sentidos, la lealtad y el disfrute de lo estable.',
                        'Géminis': 'Coqueteás con la palabra; buscás variedad y conversación.',
                        'Cáncer': 'Amás con entrega y cuidado; el hogar es tu lenguaje del amor.',
                        'Leo': 'Amás con generosidad y brillo; necesitás ser admirado.',
                        'Virgo': 'Demostrás amor con actos de servicio y detalles prácticos.',
                        'Libra': 'Amás con elegancia y deseo de armonía; te enamora la belleza.',
                        'Escorpio': 'Amás con pasión profunda e intensidad que todo lo transforma.',
                        'Sagitario': 'Amás con libertad y aventura; huís de las cadenas.',
                        'Capricornio': 'Amás con seriedad y compromiso; el amor se construye con tiempo.',
                        'Acuario': 'Amás con amistad y espacios propios; lo distinto te atrae.',
                        'Piscis': 'Amás con romanticismo total, idealización y entrega.'
                    },
                    'Marte': {
                        'Aries': 'Tu energía es pionera: actuás antes de pensar y encendés motores.',
                        'Tauro': 'Tu fuerza es constante; avanzás sin apuros pero sin freno.',
                        'Géminis': 'Tu acción es verbal e ingeniosa; pelead con palabras.',
                        'Cáncer': 'Defendés con coraje a los tuyos; tu fuerza protege.',
                        'Leo': 'Actuás con brío y coraje; tu fuego quiere liderar.',
                        'Virgo': 'Tu empuje es eficiente: hacés bien lo que empezás.',
                        'Libra': 'Actuás buscando acuerdo; peleás por la justicia y el equilibrio.',
                        'Escorpio': 'Tu poder es transformador: no rendís ni olvidás fácil.',
                        'Sagitario': 'Tu acción es franca y expansiva; caminás hacia el horizonte.',
                        'Capricornio': 'Tu ambición es metódica; escalás de a poco hacia la cima.',
                        'Acuario': 'Actuás por causas colectivas con rebeldía estructurada.',
                        'Piscis': 'Tu energía es sutil e intuitiva; actuás cuando es el momento.'
                    },
                    'Júpiter': {
                        'Aries': 'Crecés con iniciativas valientes y confianza en vos mismo.',
                        'Tauro': 'Tu expansión llega con lo estable, lo simple y lo sensorial.',
                        'Géminis': 'Crecés estudiando, viajando y conversando con el mundo.',
                        'Cáncer': 'Crecés en la familia y en el hogar que construís.',
                        'Leo': 'Tu suerte brilla en el juego creativo y en mostrar tu talento.',
                        'Virgo': 'Crecés sirviendo y perfeccionando tu oficio.',
                        'Libra': 'Tu crecimiento florece en pareja y en los lazos sociales.',
                        'Escorpio': 'Tus crisis te renuevan; crecés en la profundidad.',
                        'Sagitario': 'Crecés viajando, creyendo y buscando sentido.',
                        'Capricornio': 'Tu expansión llega por la meta lograda y el reconocimiento.',
                        'Acuario': 'Crecés en grupo, con amigos y causas del futuro.',
                        'Piscis': 'Crecés en la espiritualidad y en lo que el corazón intuitivamente percibe.'
                    },
                    'Saturno': {
                        'Aries': 'Aprendés a disciplinar el impulso; la constancia es tu camino.',
                        'Tauro': 'Tus límites están en el valor de lo que poseés y construís.',
                        'Géminis': 'Madurás ordenando la palabra y la mente.',
                        'Cáncer': 'Tus límites se vuelven hogar, seguridad y protección.',
                        'Leo': 'Madurás dejando de depender del aplauso; brillás con solidez.',
                        'Virgo': 'Tu madurez se mide en servicio, orden y efectividad.',
                        'Libra': 'Tus lecciones llegan por compromisos y relaciones maduras.',
                        'Escorpio': 'Tus límites te enseñan a manejar tus instintos.',
                        'Sagitario': 'Madurás en la sabiduría, no en la carrera.',
                        'Capricornio': 'Saturno te es natural: esfuerzo y ambición son tu casa.',
                        'Acuario': 'Tus límites te vuelven autónomo frente a lo establecido.',
                        'Piscis': 'Madurás soltando el control y confiando en la corriente.'
                    }
                },
                generational: {
                    'Urano': 'Generación que busca romper esquemas: tu originalidad se expresa según la casa que ocupa.',
                    'Neptuno': 'Generación de sueños colectivos: tu sensibilidad fina se filtra a través de la casa que ocupa.',
                    'Plutón': 'Generación de transformaciones profundas: tu poder renovador se canaliza en la casa que ocupa.'
                },
                house: {
                    1: 'tu identidad y la primera impresión que causás',
                    2: 'tus recursos, valores y seguridad material',
                    3: 'tu mente, tus estudios y tus vínculos cercanos',
                    4: 'tu hogar, tus raíces y tu mundo íntimo',
                    5: 'tu creatividad, el romance y tu alegría',
                    6: 'tu trabajo diario, tu salud y tus rutinas',
                    7: 'tus relaciones de pareja y tus sociedades',
                    8: 'tus transformaciones, la intimidad y lo compartido',
                    9: 'tus viajes, tus creencias y tu visión de mundo',
                    10: 'tu vocación, tu carrera y tu reputación',
                    11: 'tus amistades, tus proyectos y tus aspiraciones',
                    12: 'tu mundo interior, la espiritualidad y el descanso'
                }
            };

            function buildReading(list) {
                var el = document.getElementById('natalReading');
                if (!el || !list.length) return;
                var html = '<h3>&#x2726; Lectura de la Carta &#x2726;</h3>';
                list.forEach(function(p) {
                    var name = p.name;
                    var sign = (p.zodiac && p.zodiac.name) || '';
                    var house = p.house_number;
                    var base = READING.base[name] || ('Planeta ' + name + ': influye en tu vida según su lugar.');
                    var signTxt = (READING.sign[name] && READING.sign[name][sign]) ||
                        READING.generational[name] || 'Su expresión depende de la casa que ocupa.';
                    var houseTxt = READING.house[house] || 'tu vida diaria';
                    var retroTxt = p.is_retrograde ? ' <em>(retrógrado: esta energía se procesa hacia adentro)</em>' : '';
                    html += '<div class="reading-card"><h4>' + name + ' en ' + sign + '</h4>' +
                        '<p>' + base + '</p>' +
                        '<p>' + signTxt + '</p>' +
                        '<p><span class="reading-house">Casa ' + house + '</span>: se expresa en ' + houseTxt + '.</p>' +
                        (retroTxt ? '<p>' + retroTxt + '</p>' : '') +
                        '</div>';
                });
                el.innerHTML = html;
            }


            // ===== LECTURA POR REGLAS: ASPECTOS, ASCENDENTE Y BALANCE =====
            var THEME = {
                'Sol': 'tu identidad y tu vitalidad', 'Luna': 'tus emociones y tus necesidades',
                'Mercurio': 'tu forma de pensar y comunicarte', 'Venus': 'tu manera de amar y valorar',
                'Marte': 'tu impulso y tu acción', 'Júpiter': 'tu confianza y tu crecimiento',
                'Saturno': 'tu disciplina y tus límites', 'Urano': 'tu necesidad de libertad y cambio',
                'Neptuno': 'tu intuición y tu imaginación', 'Plutón': 'tu poder y tu capacidad de transformación',
                'Nodo Norte': 'tu rumbo de crecimiento'
            };
            var ASPECT_TXT = {
                'conjunción': function(a, b) { return a + ' y ' + b + ' actúan como una sola fuerza: ' + THEME[a] + ' se mezcla con ' + THEME[b] + ' y ambas se intensifican.'; },
                'trígono': function(a, b) { return 'Fluyen con naturalidad: ' + THEME[a] + ' recibe apoyo de ' + THEME[b] + '. Es un talento que se expresa casi sin esfuerzo.'; },
                'sextil': function(a, b) { return 'Se ayudan cuando los conectás a propósito: ' + THEME[a] + ' y ' + THEME[b] + ' ofrecen una oportunidad que conviene aprovechar.'; },
                'cuadratura': function(a, b) { return 'Generan tensión: ' + THEME[a] + ' choca con ' + THEME[b] + '. Es un desafío que, trabajado, se convierte en motivación y fortaleza.'; },
                'oposición': function(a, b) { return 'Piden equilibrio: ' + THEME[a] + ' y ' + THEME[b] + ' tiran en direcciones opuestas. El reto es integrar ambas sin oscilar entre extremos.'; }
            };
            var ASC_TXT = {
                'Aries': 'Te presentás con energía, iniciativa y franqueza; los demás te ven decidido/a y directo/a.',
                'Tauro': 'Transmitís calma, solidez y sensualidad; das una impresión de confianza y estabilidad.',
                'Géminis': 'Te mostrás curioso/a, ágil y conversador/a; la gente te percibe joven y comunicativo/a.',
                'Cáncer': 'Proyectás sensibilidad y calidez protectora; los demás notan tu lado empático.',
                'Leo': 'Tenés presencia y magnetismo; se te percibe seguro/a, generoso/a y con carisma.',
                'Virgo': 'Das una imagen prolija, atenta y analítica; se te ve reservado/a y servicial.',
                'Libra': 'Proyectás encanto, diplomacia y estética; buscás armonía en el primer contacto.',
                'Escorpio': 'Tu presencia es intensa y magnética; los demás perciben profundidad y misterio.',
                'Sagitario': 'Te mostrás optimista, abierto/a y aventurero/a; transmitís entusiasmo y franqueza.',
                'Capricornio': 'Proyectás seriedad, madurez y responsabilidad; se te percibe confiable y ambicioso/a.',
                'Acuario': 'Te ven original, independiente y algo distinto/a; transmitís libertad y amplitud mental.',
                'Piscis': 'Proyectás dulzura, intuición y un aire soñador; los demás sienten tu sensibilidad.'
            };
            var ELEM_NAMES = ['Fuego', 'Tierra', 'Aire', 'Agua'];
            var ELEM_TXT = {
                'Fuego': 'Predomina el Fuego: sos entusiasta, con iniciativa y necesidad de acción.',
                'Tierra': 'Predomina la Tierra: sos práctico/a, constante y orientado/a a lo concreto.',
                'Aire': 'Predomina el Aire: sos mental, sociable y necesitás comunicar e intercambiar ideas.',
                'Agua': 'Predomina el Agua: sos emocional, intuitivo/a y muy receptivo/a al entorno.'
            };
            var MODE_NAMES = ['Cardinal', 'Fijo', 'Mutable'];
            var MODE_TXT = {
                'Cardinal': 'Predomina la modalidad Cardinal: te gusta iniciar, abrir caminos y tomar la delantera.',
                'Fijo': 'Predomina la modalidad Fija: sos persistente, leal y te cuesta soltar lo que empezaste.',
                'Mutable': 'Predomina la modalidad Mutable: te adaptás con facilidad y disfrutás del cambio.'
            };
            function aspectStrength(orb) { return orb < 2 ? 'muy exacto (influencia fuerte)' : orb < 5 ? 'cercano (influencia clara)' : 'amplio (influencia suave)'; }

            function buildAspectReading(calc, aspects) {
                var el = document.getElementById('natalAspectReading');
                var facts = [];
                if (!el) return facts;
                var html = '<h3>&#x2726; Aspectos, Ascendente y Balance &#x2726;</h3>';
                var ascTxt = ASC_TXT[calc.asc.sign] || '';
                html += '<div class="reading-card"><h4>Ascendente en ' + calc.asc.sign + '</h4><p>' + ascTxt + '</p>' +
                    '<p>El Medio Cielo en ' + calc.mc.sign + ' marca cómo querés ser reconocido/a y tu vocación.</p></div>';
                facts.push('Ascendente en ' + calc.asc.sign + ': ' + ascTxt);
                var elem = [0, 0, 0, 0], mode = [0, 0, 0];
                calc.planets.forEach(function(p) {
                    if (p.name === 'Nodo Norte') return;
                    var i = Natal.SIGNS.indexOf(p.zodiac.name);
                    var w = (p.name === 'Sol' || p.name === 'Luna') ? 2 : 1;
                    elem[i % 4] += w; mode[i % 3] += w;
                });
                var e = elem.indexOf(Math.max.apply(null, elem)), m = mode.indexOf(Math.max.apply(null, mode));
                html += '<div class="reading-card"><h4>Balance de elementos y modalidades</h4><p>' + ELEM_TXT[ELEM_NAMES[e]] + '</p><p>' + MODE_TXT[MODE_NAMES[m]] + '</p></div>';
                facts.push(ELEM_TXT[ELEM_NAMES[e]]);
                facts.push(MODE_TXT[MODE_NAMES[m]]);
                var shown = aspects.filter(function(a) { return THEME[a.a] && THEME[a.b]; }).slice(0, 14);
                if (shown.length) {
                    html += '<h3>Aspectos principales</h3>';
                    shown.forEach(function(a) {
                        var txt = ASPECT_TXT[a.type](a.a, a.b);
                        html += '<div class="reading-card"><h4>' + a.a + ' ' + a.type + ' ' + a.b + '</h4><p>' + txt + '</p><p><em>Orbe ' + a.orb.toFixed(1) + '°: ' + aspectStrength(a.orb) + '</em></p></div>';
                        facts.push(a.a + ' ' + a.type + ' ' + a.b + ' (orbe ' + a.orb.toFixed(1) + '°): ' + txt);
                    });
                }
                el.innerHTML = html;
                return facts;
            }

            // ===== INFORME IA =====
            var ASPECTS = [
                { type: 'conjunción', angle: 0, orb: 8 }, { type: 'sextil', angle: 60, orb: 5 },
                { type: 'cuadratura', angle: 90, orb: 7 }, { type: 'trígono', angle: 120, orb: 7 },
                { type: 'oposición', angle: 180, orb: 8 }
            ];
            function computeAspects(list) {
                var out = [];
                for (var i = 0; i < list.length; i++) {
                    for (var j = i + 1; j < list.length; j++) {
                        if (typeof list[i].longitude !== 'number' || typeof list[j].longitude !== 'number') continue;
                        var d = Math.abs(list[i].longitude - list[j].longitude) % 360;
                        if (d > 180) d = 360 - d;
                        for (var k = 0; k < ASPECTS.length; k++) {
                            var diff = Math.abs(d - ASPECTS[k].angle);
                            if (diff <= ASPECTS[k].orb) {
                                out.push({ a: list[i].name, b: list[j].name, type: ASPECTS[k].type, orb: diff });
                                break;
                            }
                        }
                    }
                }
                return out.sort(function(x, y) { return x.orb - y.orb; }).slice(0, 40);
            }
            function renderReport(el, text) {
                el.innerHTML = '';
                text.split(/\n+/).forEach(function(line) {
                    line = line.trim();
                    if (!line) return;
                    var isH = /^#{1,3}\s/.test(line);
                    var node = document.createElement(isH ? 'h2' : 'p');
                    node.textContent = line.replace(/^#{1,3}\s*/, '').replace(/\*\*/g, '');
                    el.appendChild(node);
                });
            }
            var lastChart = null;
            var aiBtn = document.getElementById('natalAiBtn');
            if (aiBtn) {
                aiBtn.addEventListener('click', async function() {
                    var out = document.getElementById('natalAiOut');
                    if (!lastChart) return;
                    aiBtn.disabled = true;
                    out.innerHTML = '<p class="ai-status">Interpretando tu carta…</p>';
                    try {
                        var jwt = window.Account ? await Account.getAccessToken() : null;
                        if (!jwt) {
                            out.innerHTML = '<p class="ai-status">El informe completo es parte del plan mensual. <a href="#" id="natalPlanLink">Iniciá sesión y suscribite</a> para acceder.</p>';
                            var link0 = document.getElementById('natalPlanLink');
                            if (link0) link0.addEventListener('click', function(e) { e.preventDefault(); document.getElementById('authModal').style.display = 'flex'; });
                            aiBtn.disabled = false; return;
                        }
                        var res = await fetch('/api/report', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
                            body: JSON.stringify(lastChart)
                        });
                        var data = await res.json();
                        if (!res.ok) {
                            if (res.status === 402) {
                                out.innerHTML = '<p class="ai-status">' + data.error + ' <a href="#" id="natalPlanLink2">Suscribirme</a></p>';
                                var link1 = document.getElementById('natalPlanLink2');
                                if (link1) link1.addEventListener('click', function(e) { e.preventDefault(); Account.openSubscribeModal(); });
                                aiBtn.disabled = false; return;
                            }
                            throw new Error(data.error || 'No se pudo generar el informe');
                        }
                        renderReport(out, data.report);
                    } catch (err) {
                        out.innerHTML = '';
                        var p = document.createElement('p');
                        p.className = 'ai-status';
                        p.textContent = err.message;
                        out.appendChild(p);
                    }
                    aiBtn.disabled = false;
                });
            }

            // ===== CARTA NATAL =====
            var CHART_KEYS = { 'Sol': 'Sun', 'Luna': 'Moon', 'Mercurio': 'Mercury', 'Venus': 'Venus', 'Marte': 'Mars',
                'Júpiter': 'Jupiter', 'Saturno': 'Saturn', 'Urano': 'Uranus', 'Neptuno': 'Neptune', 'Plutón': 'Pluto', 'Nodo Norte': 'NNode' };
            function drawNatalChart(calc) {
                var box = document.getElementById('natalChartSvg');
                box.innerHTML = '<div id="natalChartCanvas"></div>';
                var data = { planets: {}, cusps: calc.cusps.slice(1) };
                calc.planets.forEach(function(p) { data.planets[CHART_KEYS[p.name]] = [p.longitude]; });
                var chart = new astrochart.Chart('natalChartCanvas', 560, 560, {
                    COLOR_BACKGROUND: 'transparent', POINTS_COLOR: '#e9d5ff', SIGNS_COLOR: '#c084fc',
                    CIRCLE_COLOR: '#a855f7', LINE_COLOR: '#a855f7', CUSPS_FONT_COLOR: '#e9d5ff',
                    SYMBOL_AXIS_FONT_COLOR: '#e9d5ff', SHOW_DIGNITIES_TEXT: false
                });
                chart.radix(data).aspects();
            }
            var natalBtn = document.getElementById('natalBtn');
            if (natalBtn) {
                natalBtn.addEventListener('click', function() {
                    (async function() {
                        var loading = document.getElementById('natalLoading');
                        var errorEl = document.getElementById('natalError');
                        var result = document.getElementById('natalResult');
                        natalBtn.disabled = true;
                        hideEl(errorEl); hideEl(result); showEl(loading);
                        try {
                            var profile = await resolveProfile(
                                document.getElementById('natalDateTime'),
                                document.getElementById('natalPlace'),
                                document.getElementById('natalUnknownTime'),
                                'la persona'
                            );
                            var base = {
                                'profile[datetime]': profile.datetime,
                                'profile[coordinates]': profile.coordinates
                            };
                            if (profile.unknown) base['profile[birth_time_unknown]'] = 'true';
                            var parts = profile.coordinates.split(',');
                            var calc = Natal.computeNatal(new Date(profile.datetime), parseFloat(parts[0]), parseFloat(parts[1]));
                            var list = calc.planets;
                            drawNatalChart(calc);
                            var tbody = document.getElementById('natalTableBody');
                            tbody.innerHTML = '';
                            list.forEach(function(p) {
                                var tr = document.createElement('tr');
                                var deg = Math.floor(p.degree) + '°' + Math.floor((p.degree % 1) * 60) + "'";
                                var retro = p.is_retrograde ? '<span class="retro">R</span>' : '';
                                tr.innerHTML = '<td>' + p.name + '</td><td>' + (p.zodiac ? p.zodiac.name : '') + '</td>' +
                                    '<td>' + deg + '</td><td>Casa ' + p.house_number + '</td><td>' + retro + '</td>';
                                tbody.appendChild(tr);
                            });
                            buildReading(list);
                            var aspList = computeAspects(list);
                            var syn = Reading.build(calc, aspList);
                            document.getElementById('natalSynthesis').innerHTML = '<h3>&#x2726; Tu Carta, Personalizada &#x2726;</h3>' + syn.html;
                            var facts = syn.facts.concat(buildAspectReading(calc, aspList));
                            lastChart = {
                                timeUnknown: !!profile.unknown,
                                planets: list.map(function(p) {
                                    return { name: p.name, sign: p.zodiac ? p.zodiac.name : '', degree: Math.floor(p.degree) + '°', house: p.house_number, retro: !!p.is_retrograde };
                                }),
                                aspects: aspList,
                                facts: facts
                            };
                            lastChart.planets.push({ name: 'Ascendente', sign: calc.asc.sign, degree: Math.floor(calc.asc.degree) + '°', house: 1, retro: false });
                            lastChart.planets.push({ name: 'Medio Cielo', sign: calc.mc.sign, degree: Math.floor(calc.mc.degree) + '°', house: 10, retro: false });
                            document.getElementById('natalAiOut').innerHTML = '';
                            showEl(result);
                            if (window.Account) {
                                Account.logReading('natal', 'Sol en ' + (list[0] && list[0].zodiac ? list[0].zodiac.name : '') + ', Ascendente en ' + calc.asc.sign);
                                Account.saveNatalData(lastChart, { datetime: profile.datetime, lat: parseFloat(parts[0]), lon: parseFloat(parts[1]), unknown: !!profile.unknown });
                            }
                        } catch (err) { showError(errorEl, err.message); }
                        hideEl(loading);
                        natalBtn.disabled = false;
                    })();
                });
            }

            // ===== HORÓSCOPO DEL DÍA =====
            var horoSign = document.getElementById('horoSign');
            if (horoSign) {
                fillSignSelect(horoSign);
                prefillFromProfile(horoSign);
            }
            var horoLove1 = document.getElementById('horoLove1');
            var horoLove2 = document.getElementById('horoLove2');
            if (horoLove1 && horoLove2) {
                fillSignSelect(horoLove1);
                fillSignSelect(horoLove2);
                horoLove2.value = 'virgo';
            }
            var horoBtn = document.getElementById('horoBtn');
            function paras(list) {
                return list.map(function(t) { return '<p>' + Horo.esc(t) + '</p>'; }).join('');
            }
            if (horoBtn) {
                horoBtn.addEventListener('click', function() {
                    var errorEl = document.getElementById('horoError');
                    var result = document.getElementById('horoResult');
                    hideEl(errorEl);
                    try {
                        var r = Horo.daily(horoSign.selectedIndex, new Date());
                        document.getElementById('horoSignName').textContent = r.sign;
                        document.getElementById('horoDate').textContent = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
                        document.getElementById('horoText').innerHTML = paras(r.paragraphs);
                        showEl(result);
                        if (window.Account) Account.logReading('horoscopo', r.sign);
                    } catch (err) { showError(errorEl, err.message); }
                });
            }
            var horoLoveBtn = document.getElementById('horoLoveBtn');
            if (horoLoveBtn) {
                horoLoveBtn.addEventListener('click', function() {
                    var errorEl = document.getElementById('horoLoveError');
                    var result = document.getElementById('horoLoveResult');
                    hideEl(errorEl);
                    try {
                        var r = Horo.love(horoLove1.selectedIndex, horoLove2.selectedIndex, new Date());
                        document.getElementById('horoLoveHeader').textContent = horoLove1.options[horoLove1.selectedIndex].text + ' + ' +
                            horoLove2.options[horoLove2.selectedIndex].text + ' — ' + r.score + '% de afinidad';
                        document.getElementById('horoLoveText').innerHTML = paras(r.paragraphs);
                        showEl(result);
                    } catch (err) { showError(errorEl, err.message); }
                });
            }

            // ===== COMPATIBILIDAD (SINASTRÍA) =====
            var compatBtn = document.getElementById('compatBtn');
            if (compatBtn) {
                compatBtn.addEventListener('click', function() {
                    (async function() {
                        var loading = document.getElementById('compatLoading');
                        var errorEl = document.getElementById('compatError');
                        var result = document.getElementById('compatResult');
                        compatBtn.disabled = true;
                        hideEl(errorEl); hideEl(result); showEl(loading);
                        try {
                            var p1 = await resolveProfile(
                                document.getElementById('compatDT1'),
                                document.getElementById('compatPlace1'),
                                document.getElementById('compatUnknown1'),
                                'la persona 1'
                            );
                            var p2 = await resolveProfile(
                                document.getElementById('compatDT2'),
                                document.getElementById('compatPlace2'),
                                document.getElementById('compatUnknown2'),
                                'la persona 2'
                            );
                            var c1 = p1.coordinates.split(','), c2 = p2.coordinates.split(',');
                            var A = Natal.computeNatal(new Date(p1.datetime), parseFloat(c1[0]), parseFloat(c1[1]));
                            var B = Natal.computeNatal(new Date(p2.datetime), parseFloat(c2[0]), parseFloat(c2[1]));
                            var s = Horo.synastry(A, B);
                            var box = document.getElementById('compatChartSvg');
                            box.innerHTML = '<div id="compatChartCanvas"></div>';
                            var d1 = { planets: {}, cusps: A.cusps.slice(1) }, d2 = { planets: {}, cusps: A.cusps.slice(1) };
                            A.planets.forEach(function(p) { d1.planets[CHART_KEYS[p.name]] = [p.longitude]; });
                            B.planets.forEach(function(p) { d2.planets[CHART_KEYS[p.name]] = [p.longitude]; });
                            new astrochart.Chart('compatChartCanvas', 560, 560, {
                                COLOR_BACKGROUND: 'transparent', POINTS_COLOR: '#e9d5ff', SIGNS_COLOR: '#c084fc',
                                CIRCLE_COLOR: '#a855f7', LINE_COLOR: '#a855f7', SHOW_DIGNITIES_TEXT: false
                            }).radix(d1).transit(d2);
                            var html = '<div class="reading-card"><h4>Afinidad general: ' + s.score + '%</h4>' +
                                '<p>' + Horo.esc(s.sunText) + '</p><p>' + Horo.esc(s.moonText) + '</p>' +
                                '<p><em>Cuanto más cerca de 100%, más aspectos armónicos entre ambas cartas. Es una guía, no una sentencia.</em></p></div>';
                            s.cards.forEach(function(c) {
                                html += '<div class="reading-card"><h4>' + Horo.esc(c.title) + '</h4><p>' + Horo.esc(c.text) + '</p></div>';
                            });
                            document.getElementById('compatReading').innerHTML = html;
                            lastSynastry = {
                                p1: A.planets.map(function(p) { return { name: p.name, sign: p.zodiac ? p.zodiac.name : '', house: p.house_number, retro: !!p.is_retrograde }; }),
                                p2: B.planets.map(function(p) { return { name: p.name, sign: p.zodiac ? p.zodiac.name : '', house: p.house_number, retro: !!p.is_retrograde }; }),
                                aspects: s.allAspects.map(function(a) { return { a: a.a, b: a.b, type: a.asp.type, orb: a.orb }; })
                            };
                            document.getElementById('compatAiOut').innerHTML = '';
                            showEl(result);
                        } catch (err) { showError(errorEl, err.message); }
                        hideEl(loading);
                        compatBtn.disabled = false;
                    })();
                });
            }
            var lastSynastry = null;
            var compatAiBtn = document.getElementById('compatAiBtn');
            if (compatAiBtn) {
                compatAiBtn.addEventListener('click', async function() {
                    var out = document.getElementById('compatAiOut');
                    if (!lastSynastry) return;
                    compatAiBtn.disabled = true;
                    out.innerHTML = '<p class="ai-status">Conjugando ambas cartas…</p>';
                    try {
                        var jwt = window.Account ? await Account.getAccessToken() : null;
                        if (!jwt) {
                            out.innerHTML = '<p class="ai-status">El informe extenso es parte del plan mensual. <a href="#" id="compatPlanLink">Iniciá sesión y suscribite</a> para acceder.</p>';
                            var l0 = document.getElementById('compatPlanLink');
                            if (l0) l0.addEventListener('click', function(e) { e.preventDefault(); document.getElementById('authModal').style.display = 'flex'; });
                            compatAiBtn.disabled = false; return;
                        }
                        var res = await fetch('/api/synastry-report', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
                            body: JSON.stringify(lastSynastry)
                        });
                        var data = await res.json();
                        if (!res.ok) {
                            if (res.status === 402) {
                                out.innerHTML = '<p class="ai-status">' + data.error + ' <a href="#" id="compatPlanLink2">Suscribirme</a></p>';
                                var l1 = document.getElementById('compatPlanLink2');
                                if (l1) l1.addEventListener('click', function(e) { e.preventDefault(); Account.openSubscribeModal(); });
                                compatAiBtn.disabled = false; return;
                            }
                            throw new Error(data.error || 'No se pudo generar el informe');
                        }
                        renderReport(out, data.report);
                        if (window.Account) Account.logReading('compatibilidad', 'Informe de compatibilidad completo');
                    } catch (err) {
                        out.innerHTML = '<p class="ai-status">' + err.message + '</p>';
                    }
                    compatAiBtn.disabled = false;
                });
            }
        })();
    
