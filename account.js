// Cuenta de usuario: registro por email (enlace mágico, sin contraseña), perfil con carta
// natal, historial de lecturas, plan mensual y límite de señales para quien no se registra.
// Si el usuario no se registra, el sitio sigue funcionando igual que antes (solo local).
(function () {
    var sb = null;
    var currentUser = null;
    var currentProfile = null;
    var pendingBirth = null; // datos de nacimiento a guardar apenas se confirme el login
    var FREE_SENAL_LIMIT = 3;

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src; s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    async function init() {
        try {
            var cfg = await fetch('/.netlify/functions/config').then(function (r) { return r.json(); });
            if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return; // cuentas no configuradas aún
            if (!window.supabase) await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
            sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
            wireUi();
            sb.auth.onAuthStateChange(function (event, session) {
                if (session && session.user) { currentUser = session.user; onLoggedIn(); }
                else if (event === 'SIGNED_OUT') { currentUser = null; currentProfile = null; onLoggedOut(); }
            });
            var s0 = await sb.auth.getSession();
            if (s0.data && s0.data.session) { currentUser = s0.data.session.user; onLoggedIn(); }
            checkPlanReturn();
        } catch (e) { /* sin cuentas, el sitio sigue funcionando en modo local */ }
    }

    async function onLoggedIn() {
        if (!currentUser) return;
        var birth = pendingBirth;
        pendingBirth = null;
        var patch = { id: currentUser.id, email: currentUser.email };
        if (birth) {
            patch.birth_datetime = birth.datetime;
            if (birth.place != null) patch.birth_place = birth.place;
            if (birth.lat != null) patch.birth_lat = birth.lat;
            if (birth.lon != null) patch.birth_lon = birth.lon;
            patch.birth_time_unknown = !!birth.unknown;
        }
        try { await sb.from('profiles').upsert(patch); } catch (e) {}
        await refreshProfile();
        var banner = document.getElementById('authStatus');
        if (banner) banner.textContent = '';
        document.getElementById('authModal').style.display = 'none';
        if (currentProfile && currentProfile.birth_datetime && window.showUserProfile) {
            var d = new Date(currentProfile.birth_datetime);
            window.showUserProfile(d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'));
        }
    }

    function onLoggedOut() {
        var np = document.getElementById('navProfile');
        if (np) np.classList.remove('show');
        var accBtn = document.getElementById('accountBtn');
        if (accBtn) accBtn.textContent = 'Crear mi perfil';
    }

    async function refreshProfile() {
        if (!currentUser) return null;
        try {
            var r1 = await sb.from('profiles').select('*').eq('id', currentUser.id).maybeSingle();
            currentProfile = r1.data;
        } catch (e) {}
        var accBtn = document.getElementById('accountBtn');
        if (accBtn) accBtn.textContent = 'Mi cuenta' + (currentProfile && currentProfile.plan_active ? ' ⭐' : '');
        return currentProfile;
    }

    var KIND_LABEL = {
        natal: 'Carta natal', tirada_gratis: 'Tirada gratis (Pasado/Presente/Futuro)',
        tirada_full: 'Lectura completa (7 cartas)', tirada_categoria: 'Lectura por categoría',
        horoscopo: 'Horóscopo del día', senal: 'Señal del Tarot', compatibilidad: 'Informe de compatibilidad'
    };

    function planStatusHtml(prof) {
        if (prof && prof.plan_active) {
            var used = prof.plan_tiradas_used || 0;
            return '<div class="reading-card"><h4>Plan Astro Tarot <span class="plan-badge">ACTIVO</span></h4>' +
                '<p>Informe natal completo, informe de compatibilidad completo y señales ilimitadas.</p>' +
                '<p>Tiradas pagas usadas este mes: ' + used + ' / 4</p></div>';
        }
        return '<div class="reading-card"><h4>Plan Astro Tarot</h4>' +
            '<p>Informe natal completo con IA, informe de compatibilidad completo, 4 tiradas pagas por mes incluidas y señales ilimitadas.</p>' +
            '<button class="astro-btn" id="subscribeBtn" type="button">Suscribirme — $' + (window.__planPrice || 7500) + ' ARS/mes</button>' +
            '<div class="astro-error" id="subscribeError" style="display:none"></div></div>';
    }

    async function renderAccountModal() {
        var body = document.getElementById('accountModalBody');
        if (!body || !currentUser) return;
        var prof = currentProfile || {};
        var email = prof.email || currentUser.email;
        var birth = prof.birth_datetime ? new Date(prof.birth_datetime).toLocaleString('es-AR') : 'Todavía no generaste tu carta natal';
        var freq = prof.notify_frequency_days || 21;
        var enabled = prof.notify_enabled !== false;
        var senales = prof.plan_active ? 'Ilimitadas (plan activo)' : ((prof.senal_count || 0) + ' de ' + FREE_SENAL_LIMIT + ' usadas');
        var history = [];
        try { var r2 = await sb.from('reading_history').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(15); history = r2.data || []; } catch (e) {}
        var histHtml = history.length
            ? history.map(function (h) {
                var d = new Date(h.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
                return '<div class="reading-card"><h4>' + esc(KIND_LABEL[h.kind] || h.kind) + '</h4><p>' + esc(h.label || '') + '</p><p><em>' + d + '</em></p></div>';
            }).join('')
            : '<p class="ai-status">Todavía no tenés lecturas guardadas.</p>';

        body.innerHTML =
            '<div class="reading-card"><h4>Tu cuenta</h4><p>' + esc(email) + '</p>' +
            '<p>Fecha de nacimiento: ' + esc(birth) + '</p>' +
            '<p>Señales usadas: ' + esc(senales) + '</p></div>' +
            planStatusHtml(prof) +
            '<div class="reading-card"><h4>Recordatorios por email</h4>' +
            '<label class="astro-check"><input type="checkbox" id="notifyEnabledInput"' + (enabled ? ' checked' : '') + '> Quiero recibir recordatorios</label>' +
            '<p>Cada <select id="notifyFreqInput">' +
            [7, 14, 21, 30].map(function (n) { return '<option value="' + n + '"' + (n === freq ? ' selected' : '') + '>' + n + ' días</option>'; }).join('') +
            '</select></p>' +
            '<button class="astro-btn" id="saveNotifyBtn" type="button">Guardar</button>' +
            '<button class="astro-btn" id="logoutBtn" type="button" style="margin-left:0.5rem">Cerrar sesión</button></div>' +
            '<h3 class="horo-subtitle">✦ Tus últimas lecturas ✦</h3>' + histHtml;

        var saveBtn = document.getElementById('saveNotifyBtn');
        if (saveBtn) saveBtn.addEventListener('click', async function () {
            var enabled2 = document.getElementById('notifyEnabledInput').checked;
            var freq2 = parseInt(document.getElementById('notifyFreqInput').value, 10);
            try { await sb.from('profiles').update({ notify_enabled: enabled2, notify_frequency_days: freq2 }).eq('id', currentUser.id); } catch (e) {}
        });
        var logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', async function () {
            try { await sb.auth.signOut(); } catch (e) {}
            document.getElementById('accountModal').style.display = 'none';
        });
        var subBtn = document.getElementById('subscribeBtn');
        if (subBtn) subBtn.addEventListener('click', startPlanCheckout);
    }

    async function startPlanCheckout() {
        var btn = document.getElementById('subscribeBtn');
        var errEl = document.getElementById('subscribeError');
        if (btn) btn.disabled = true;
        if (errEl) errEl.style.display = 'none';
        try {
            var res = await fetch('/.netlify/functions/subscribe', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email })
            });
            var data = await res.json();
            if (!res.ok || !data.url) throw new Error(data.error || 'No se pudo iniciar la suscripción');
            location.href = data.url;
        } catch (err) {
            if (errEl) { errEl.textContent = err.message; errEl.style.display = ''; }
            if (btn) btn.disabled = false;
        }
    }

    async function checkPlanReturn() {
        var qs = new URLSearchParams(location.search);
        var plan = qs.get('plan');
        var preapprovalId = qs.get('preapproval_id');
        if (plan !== 'exito' || !preapprovalId) return;
        history.replaceState({}, '', location.pathname);
        // Puede volver antes de que termine de cargar la sesión; se espera un instante.
        for (var i = 0; i < 20 && !currentUser; i++) await new Promise(function (r) { setTimeout(r, 300); });
        if (!currentUser) return;
        try {
            var res = await fetch('/.netlify/functions/verify-subscription?preapproval_id=' + encodeURIComponent(preapprovalId));
            var data = await res.json();
            if (res.ok && data.active) {
                await sb.from('profiles').update({
                    plan_active: true, plan_preapproval_id: preapprovalId,
                    plan_started_at: new Date().toISOString(), plan_period_start: new Date().toISOString(), plan_tiradas_used: 0
                }).eq('id', currentUser.id);
                await refreshProfile();
                document.getElementById('accountModal').style.display = 'flex';
                renderAccountModal();
            }
        } catch (e) {}
    }

    function wireUi() {
        var accBtn = document.getElementById('accountBtn');
        if (accBtn) {
            accBtn.addEventListener('click', function () {
                if (currentUser) {
                    document.getElementById('accountModal').style.display = 'flex';
                    refreshProfile().then(renderAccountModal);
                } else {
                    document.getElementById('authModal').style.display = 'flex';
                }
            });
        }
        var accountClose = document.getElementById('accountModalClose');
        if (accountClose) accountClose.addEventListener('click', function () { document.getElementById('accountModal').style.display = 'none'; });
        var authClose = document.getElementById('authModalClose');
        if (authClose) authClose.addEventListener('click', function () { document.getElementById('authModal').style.display = 'none'; });

        var authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                var email = document.getElementById('authEmailInput').value.trim();
                var status = document.getElementById('authStatus');
                if (!email) return;
                status.textContent = 'Enviando...';
                try {
                    var r = await sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.origin } });
                    if (r.error) throw r.error;
                    status.textContent = 'Te enviamos un enlace a ' + email + '. Abrilo para confirmar tu cuenta.';
                } catch (err) {
                    status.textContent = 'No se pudo enviar el enlace: ' + (err.message || 'error');
                }
            });
        }
    }

    // ---- API usada por app.js/horo.js ----

    async function logReading(kind, label, detail) {
        if (!sb || !currentUser) return;
        try { await sb.from('reading_history').insert({ user_id: currentUser.id, kind: kind, label: label, detail: detail || {} }); } catch (e) {}
    }

    // Guarda la carta natal calculada y, si todavía no había fecha cargada, también los datos
    // de nacimiento (permite que cualquiera calcule su carta y quede asociada si se registra después).
    async function saveNatalData(natalSummary, birth) {
        if (!sb || !currentUser) { pendingBirth = birth || pendingBirth; return; }
        var patch = { natal_data: natalSummary };
        if (birth && (!currentProfile || !currentProfile.birth_datetime)) {
            patch.birth_datetime = birth.datetime;
            if (birth.place != null) patch.birth_place = birth.place;
            if (birth.lat != null) patch.birth_lat = birth.lat;
            if (birth.lon != null) patch.birth_lon = birth.lon;
            patch.birth_time_unknown = !!birth.unknown;
        }
        try { await sb.from('profiles').update(patch).eq('id', currentUser.id); } catch (e) {}
        await refreshProfile();
        if (patch.birth_datetime && window.showUserProfile) {
            var d = new Date(patch.birth_datetime);
            window.showUserProfile(d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'));
        }
    }

    // Señal del tarot: 3 gratis para siempre si no hay plan activo (persistente por cuenta;
    // local si todavía no se registró). Devuelve true si se puede tirar, false si llegó al límite.
    async function checkAndCountSenal() {
        if (currentUser) {
            if (!currentProfile) await refreshProfile();
            if (currentProfile && currentProfile.plan_active) return { allowed: true, remaining: Infinity };
            var used = (currentProfile && currentProfile.senal_count) || 0;
            if (used >= FREE_SENAL_LIMIT) return { allowed: false, remaining: 0 };
            try { await sb.from('profiles').update({ senal_count: used + 1 }).eq('id', currentUser.id); } catch (e) {}
            if (currentProfile) currentProfile.senal_count = used + 1;
            return { allowed: true, remaining: FREE_SENAL_LIMIT - used - 1 };
        }
        var count = 0;
        try { count = parseInt(localStorage.getItem('tarot_senal_count') || '0', 10) || 0; } catch (e) {}
        if (count >= FREE_SENAL_LIMIT) return { allowed: false, remaining: 0 };
        try { localStorage.setItem('tarot_senal_count', String(count + 1)); } catch (e) {}
        return { allowed: true, remaining: FREE_SENAL_LIMIT - count - 1 };
    }

    // Token de sesión (JWT) para llamar a funciones protegidas por plan (report.js, tarot-report.js).
    async function getAccessToken() {
        if (!sb || !currentUser) return null;
        try { var s = await sb.auth.getSession(); return s.data && s.data.session ? s.data.session.access_token : null; } catch (e) { return null; }
    }

    function isLoggedIn() { return !!currentUser; }
    function hasActivePlan() { return !!(currentProfile && currentProfile.plan_active); }
    function openSubscribeModal() {
        if (!currentUser) { document.getElementById('authModal').style.display = 'flex'; return; }
        document.getElementById('accountModal').style.display = 'flex';
        refreshProfile().then(renderAccountModal);
    }

    window.Account = {
        logReading: logReading, saveNatalData: saveNatalData, isLoggedIn: isLoggedIn,
        checkAndCountSenal: checkAndCountSenal, getAccessToken: getAccessToken,
        hasActivePlan: hasActivePlan, openSubscribeModal: openSubscribeModal
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
