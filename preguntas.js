// Tirada con preguntas: la persona escribe hasta 3 preguntas y se sacan cartas para responderlas.
// Es un servicio aparte de la tirada general. Reutiliza (vía window.TarotCore) el pago, el guardado de
// lecturas y el dibujo de cartas de app.js, sin modificar la tirada general.
(function () {
    var core = null;            // window.TarotCore (lo expone app.js)
    var price = null;
    var MAX_Q = 3;

    function $(id) { return document.getElementById(id); }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

    // ---- Elección entre tirada general y tirada con preguntas ----
    function setMode(mode) {
        var g = $('tiradaGeneral'), p = $('tiradaPreguntas');
        if (!g || !p) return;
        g.style.display = mode === 'general' ? '' : 'none';
        p.style.display = mode === 'preguntas' ? '' : 'none';
        document.querySelectorAll('#tiradaChoice .choice-card').forEach(function (c) {
            c.classList.toggle('on', c.getAttribute('data-mode') === mode);
        });
        try { sessionStorage.setItem('tarot_mode', mode); } catch (e) {}
        if (mode === 'preguntas') showEntry();
    }

    // ---- Preguntas ----
    function readQuestions() {
        var qs = [];
        document.querySelectorAll('#tiradaPreguntas .preg-input').forEach(function (i) {
            var v = String(i.value || '').replace(/\s+/g, ' ').trim().slice(0, 200);
            if (v) qs.push(v);
        });
        return qs;
    }
    function pendingQuestions() {
        try { var r = JSON.parse(sessionStorage.getItem('tarot_pending_questions') || 'null'); if (Array.isArray(r) && r.length) return r.slice(0, MAX_Q); } catch (e) {}
        return null;
    }
    function err(msg) { var e = $('pregError'); e.textContent = msg; e.style.display = msg ? '' : 'none'; }

    function labelsFor(n) {
        var out = [];
        for (var i = 1; i <= n; i++) { out.push('Pregunta ' + i + ': respuesta'); out.push('Pregunta ' + i + ': consejo'); }
        out.push('Mensaje central');
        return out;
    }

    // Muestra la lectura guardada si existe; si no, el formulario.
    async function showEntry() {
        var saved = await core.loadSaved('preguntas');
        if (saved && saved.report) renderResult(saved); else showForm();
    }
    function showForm() {
        $('pregForm').style.display = '';
        $('pregResult').style.display = 'none';
        err('');
    }

    function renderResult(saved) {
        var n = (saved.questions || []).length;
        $('pregForm').style.display = 'none';
        $('pregResult').style.display = '';
        $('pregQList').innerHTML = (saved.questions || []).map(function (q, i) { return '<li>' + esc(q) + '</li>'; }).join('');
        var deck = core.allCards();
        var picks = (saved.picks || []).map(function (p) {
            var card = deck.filter(function (c) { return c.name === p.name; })[0];
            return card ? { card: card, reversed: !!p.reversed } : null;
        }).filter(Boolean);
        core.renderSpread($('pregSpread'), picks, labelsFor(n));
        var out = $('pregOut');
        core.tRenderReport(out, saved.report);
        var note = document.createElement('p');
        note.className = 'ai-status';
        note.textContent = 'Esta consulta queda guardada y no cambia. Para hacer otras preguntas hay que iniciar una nueva consulta.';
        out.appendChild(note);
        var again = document.createElement('button');
        again.className = 'astro-btn'; again.type = 'button'; again.textContent = 'Hacer otra consulta';
        again.addEventListener('click', function () {
            document.querySelectorAll('#tiradaPreguntas .preg-input').forEach(function (i) { i.value = ''; });
            showForm();
        });
        out.appendChild(again);
        $('pregResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ---- Consultar: pago (o plan) y lectura ----
    async function start() {
        err('');
        var qs = readQuestions();
        if (!qs.length) { err('Escribí al menos una pregunta.'); return; }
        if (qs[0].length < 8) { err('La pregunta es muy corta. Contanos un poco más.'); return; }
        try { sessionStorage.setItem('tarot_pending_questions', JSON.stringify(qs)); } catch (e) {}
        var btn = $('pregBtn');
        var token = core.getToken('preguntas');
        if (token) { run(token, null); return; }
        if (window.Account && Account.isLoggedIn() && Account.hasActivePlan()) {
            var left = Account.tiradasLeft();
            if (left <= 0) { err('Ya usaste tus 4 tiradas de este mes. Se renuevan el mes próximo. Mientras tanto podés pagar una lectura por categoría, que es independiente.'); return; }
            if (!confirm('Tu plan incluye 4 tiradas por mes y te quedan ' + left + '. Esta consulta va a usar 1, y no se renuevan hasta el mes próximo. ¿Continuar?')) return;
            var jwt = await Account.getAccessToken();
            if (jwt) { run(null, jwt); return; }
        }
        core.startCheckout('preguntas', btn, $('pregError'));
    }

    async function run(token, jwt) {
        var qs = pendingQuestions() || readQuestions();
        if (!qs.length) { setMode('preguntas'); showForm(); err('Escribí tus preguntas para continuar.'); return; }
        setMode('preguntas');
        var labels = labelsFor(qs.length);
        var picks = core.drawSpread(labels.length);
        $('pregForm').style.display = 'none';
        $('pregResult').style.display = '';
        $('pregQList').innerHTML = qs.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('');
        core.renderSpread($('pregSpread'), picks, labels);
        var out = $('pregOut');
        out.innerHTML = '<p class="ai-status">Interpretando tus cartas…</p>';
        $('pregResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
        try {
            var headers = { 'Content-Type': 'application/json' };
            if (jwt) headers['Authorization'] = 'Bearer ' + jwt;
            var res = await fetch('/api/tarot-report', {
                method: 'POST', headers: headers,
                body: JSON.stringify({
                    item: 'preguntas', token: token, questions: qs,
                    cards: picks.map(function (p, i) { return { position: labels[i], name: p.card.name, reversed: p.reversed, meaning: p.card.desc }; })
                })
            });
            var data = await res.json();
            if (!res.ok) {
                if (res.status === 402 && token) { try { localStorage.removeItem('tarot_unlock_preguntas'); } catch (e) {} }
                throw new Error(data.error || 'No se pudo generar la lectura');
            }
            var saved = { item: 'preguntas', questions: qs, report: data.report, picks: picks.map(function (p) { return { name: p.card.name, reversed: p.reversed }; }) };
            core.storeSaved('preguntas', saved);
            if (token) { try { localStorage.removeItem('tarot_unlock_preguntas'); } catch (e) {} }
            try { sessionStorage.removeItem('tarot_pending_questions'); } catch (e) {}
            renderResult(saved);
            if (window.Account) {
                if (jwt && Account.refreshProfile) Account.refreshProfile();
                Account.logReading('tirada_preguntas', 'Tirada con preguntas: ' + qs.join(' | ').slice(0, 120), saved);
            }
        } catch (e) {
            out.innerHTML = '<p class="ai-status">' + esc(e.message) + '</p>';
            var retry = document.createElement('button');
            retry.className = 'astro-btn'; retry.type = 'button'; retry.textContent = 'Volver a las preguntas';
            retry.addEventListener('click', showForm);
            out.appendChild(retry);
        }
    }

    function init() {
        core = window.TarotCore;
        if (!core || !$('tiradaChoice')) return;
        document.querySelectorAll('#tiradaChoice [data-mode]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                var mode = el.getAttribute('data-mode');
                if (el.tagName === 'DIV' && e.target.closest('button')) return; // el botón ya maneja su propio click
                setMode(mode);
            });
        });
        $('pregBtn').addEventListener('click', start);
        document.querySelectorAll('.preg-input').forEach(function (i) {
            i.addEventListener('input', function () { var c = $('pregCount' + i.getAttribute('data-n')); if (c) c.textContent = i.value.length + '/200'; });
        });
        fetch('/api/prices').then(function (r) { return r.json(); }).then(function (p) {
            price = p.preguntas;
            if (price) $('pregPrice').textContent = '$' + price + ' ' + p.currency;
        }).catch(function () {});
    }

    window.Preguntas = { setMode: setMode, run: run, errEl: function () { return $('pregError'); } };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
