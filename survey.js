// Encuesta breve al iniciar sesión: conocer al usuario y recomendarle la lectura que mejor le calza.
// Las respuestas se guardan en el historial de la cuenta (tipo 'encuesta'); la última vale.
(function () {
    var QUESTIONS = [
        { id: 'amor', q: '¿Cuál es su situación sentimental actual?', opts: [
            'Mantengo una relación de pareja estable', 'Mantengo una relación de pareja con dudas o dificultades',
            'Estoy sin pareja y deseo encontrarla', 'Estoy sin pareja y me encuentro bien así', 'Finalicé una relación recientemente'] },
        { id: 'trabajo', q: '¿Cuál es su situación laboral o profesional?', opts: [
            'Tengo un empleo estable y estoy conforme', 'Tengo empleo, pero deseo un cambio', 'Me encuentro en búsqueda de empleo',
            'Estoy desarrollando un emprendimiento propio', 'Estoy estudiando o definiendo mi orientación profesional'] },
        { id: 'dinero', q: '¿Cómo describiría su situación económica?', opts: [
            'Estable, cubro mis necesidades sin dificultad', 'Ajustada, me resulta difícil llegar a fin de mes',
            'En crecimiento, busco expandir mis ingresos', 'Tengo una preocupación económica puntual'] },
        { id: 'emocional', q: '¿Cómo describiría su estado emocional en este momento?', opts: [
            'Sereno y equilibrado', 'Con ansiedad o estrés', 'Con tristeza o desánimo', 'Con confusión o falta de rumbo', 'Con entusiasmo y energía'] },
        { id: 'mental', q: '¿Cómo se encuentra mentalmente respecto a sus decisiones?', opts: [
            'Tengo claridad sobre lo que deseo', 'Estoy reflexionando de forma recurrente sobre un asunto',
            'Debo tomar una decisión importante y dudo', 'Siento bloqueo o falta de ideas'] },
        { id: 'espiritual', q: '¿Cuál es su relación con la espiritualidad?', opts: [
            'Me estoy iniciando', 'La practico y deseo profundizar', 'Soy escéptico/a, me acerco por curiosidad', 'La utilizo como guía para mis decisiones'] },
        { id: 'foco', q: '¿Qué aspecto le gustaría que las lecturas le ayuden a comprender?', multi: 2, opts: [
            'Amor y relaciones', 'Dinero y trabajo', 'Familia y hogar', 'Autoconocimiento', 'Una decisión pendiente'] }
    ];

    var answers = null; // { id: índice | [índices] } de la encuesta guardada
    var draft = {}, step = 0, overlay = null;

    function skipKey() { return 'survey_skip_' + (window.Account && Account.getUserId()); }

    // ---- Recomendación: qué lectura del tarot conviene según las respuestas ----
    function recommended() {
        if (!answers) return null;
        var sc = { amor: 0, finanzas: 0, profesion: 0, familia: 0, full: 0 };
        var a = answers;
        if (a.amor === 1 || a.amor === 4) sc.amor += 2;
        if (a.amor === 2) sc.amor += 1;
        if (a.trabajo === 1 || a.trabajo === 2) sc.profesion += 2;
        if (a.trabajo === 3 || a.trabajo === 4) sc.profesion += 1;
        if (a.dinero === 1 || a.dinero === 3) sc.finanzas += 2;
        if (a.dinero === 2) sc.finanzas += 1;
        if (a.emocional === 3 || a.mental === 3) sc.full += 1;
        (a.foco || []).forEach(function (i) {
            if (i === 0) sc.amor += 3;
            else if (i === 1) { sc.finanzas += 2; sc.profesion += 2; }
            else if (i === 2) sc.familia += 3;
            else sc.full += 3;
        });
        var best = 'full', top = 0;
        ['full', 'amor', 'profesion', 'finanzas', 'familia'].forEach(function (k) { if (sc[k] > top) { top = sc[k]; best = k; } });
        return top >= 2 ? best : 'full';
    }

    var REASON = {
        full: 'Una tirada general de 7 cartas le dará una visión integral de su momento.',
        amor: 'Según sus respuestas, una lectura sobre Amor y relaciones es la más indicada para usted.',
        finanzas: 'Según sus respuestas, una lectura sobre Finanzas y dinero es la más indicada para usted.',
        profesion: 'Según sus respuestas, una lectura sobre Profesión y trabajo es la más indicada para usted.',
        familia: 'Según sus respuestas, una lectura sobre Familia y hogar es la más indicada para usted.'
    };

    function applyRecommendation() {
        document.querySelectorAll('.survey-reco').forEach(function (e) { e.remove(); });
        document.querySelectorAll('.categoria-btn.recommended, #unlockFullBtn.recommended').forEach(function (e) { e.classList.remove('recommended'); });
        var r = recommended();
        var paywall = document.getElementById('tiradaPaywall');
        if (!r || !paywall) return;
        var btn = r === 'full' ? document.getElementById('unlockFullBtn') : document.querySelector('.categoria-btn[data-item="' + r + '"]');
        if (btn) btn.classList.add('recommended');
        var note = document.createElement('p');
        note.className = 'survey-reco';
        note.innerHTML = '&#x2726; <strong>Recomendado para usted:</strong> ' + REASON[r];
        paywall.insertBefore(note, paywall.children[1] || null);
    }

    // ---- Interfaz ----
    function close() { if (overlay) { overlay.remove(); overlay = null; } }

    function render() {
        var Q = QUESTIONS[step];
        var cur = draft[Q.id];
        var sel = Q.multi ? (cur || []) : (cur === undefined ? [] : [cur]);
        var html = '<button class="mp-modal-close" type="button" data-s="x" aria-label="Cerrar">&times;</button>' +
            '<h3>&#x2726; Conozcámoslo &#x2726;</h3>' +
            (step === 0 ? '<p class="mp-modal-hint">Para ofrecerle recomendaciones más adecuadas, le pedimos responder unas breves preguntas. Es opcional y puede omitirlas.</p>' : '') +
            '<p class="survey-progress">Pregunta ' + (step + 1) + ' de ' + QUESTIONS.length + '</p>' +
            '<p class="survey-q">' + Q.q + (Q.multi ? ' <em>(hasta ' + Q.multi + ' opciones)</em>' : '') + '</p><div class="survey-opts">' +
            Q.opts.map(function (o, i) {
                return '<button type="button" class="survey-opt' + (sel.indexOf(i) !== -1 ? ' on' : '') + '" data-i="' + i + '">' + o + '</button>';
            }).join('') + '</div><div class="survey-nav">' +
            (step > 0 ? '<button type="button" class="astro-btn" data-s="back">Atrás</button>' : '') +
            '<button type="button" class="astro-btn" data-s="next"' + (sel.length ? '' : ' disabled') + '>' + (step === QUESTIONS.length - 1 ? 'Finalizar' : 'Siguiente') + '</button></div>' +
            '<p><a href="#" class="survey-skip" data-s="skip">Omitir por ahora</a></p>';
        overlay.querySelector('.mp-modal').innerHTML = html;
    }

    function open() {
        if (!window.Account || !Account.isLoggedIn()) return;
        close();
        draft = answers ? JSON.parse(JSON.stringify(answers)) : {};
        step = 0;
        overlay = document.createElement('div');
        overlay.className = 'mp-modal-overlay';
        overlay.style.display = 'flex';
        overlay.innerHTML = '<div class="mp-modal" style="max-width:520px;max-height:90vh;overflow-y:auto"></div>';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', async function (e) {
            var t = e.target.closest('button, a');
            if (!t) return;
            var Q = QUESTIONS[step];
            if (t.classList.contains('survey-opt')) {
                var i = +t.getAttribute('data-i');
                if (Q.multi) {
                    var arr = draft[Q.id] || [];
                    var k = arr.indexOf(i);
                    if (k !== -1) arr.splice(k, 1); else { if (arr.length >= Q.multi) arr.shift(); arr.push(i); }
                    draft[Q.id] = arr;
                } else draft[Q.id] = i;
                render();
                return;
            }
            var s = t.getAttribute('data-s');
            if (!s) return;
            e.preventDefault();
            if (s === 'back') { step--; render(); }
            else if (s === 'next') {
                if (step < QUESTIONS.length - 1) { step++; render(); return; }
                t.disabled = true;
                answers = draft;
                await Account.saveSurvey(answers);
                applyRecommendation();
                close();
            } else { // omitir o cerrar
                try { localStorage.setItem(skipKey(), '1'); } catch (er) {}
                close();
            }
        });
        render();
    }

    // Al iniciar sesión: carga la encuesta guardada; si no hay y no la omitió, la ofrece.
    async function maybeShow() {
        answers = await Account.getSurvey();
        applyRecommendation();
        if (answers) return;
        var skipped = false;
        try { skipped = !!localStorage.getItem(skipKey()); } catch (e) {}
        if (!skipped) setTimeout(open, 800);
    }

    window.Survey = { open: open, maybeShow: maybeShow, clear: function () { answers = null; applyRecommendation(); } };
})();
