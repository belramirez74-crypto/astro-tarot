// Cálculo local de carta natal (sin API externa).
// Planetas: astronomy-engine (global Astronomy). Casas: Placidus.
(function (root) {
    var Astro = root.Astronomy || (typeof require !== 'undefined' ? require('./vendor/astronomy.browser.min.js') : null);
    var RAD = Math.PI / 180;
    var SIGNS = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
    var BODIES = [
        ['Sol', 'Sun'], ['Luna', 'Moon'], ['Mercurio', 'Mercury'], ['Venus', 'Venus'], ['Marte', 'Mars'],
        ['Júpiter', 'Jupiter'], ['Saturno', 'Saturn'], ['Urano', 'Uranus'], ['Neptuno', 'Neptune'], ['Plutón', 'Pluto']
    ];

    function norm(d) { d = d % 360; return d < 0 ? d + 360 : d; }

    // Longitud eclíptica geocéntrica verdadera de la fecha (equinoccio de la fecha).
    function eclipticLon(body, date) {
        var t = Astro.MakeTime(date);
        if (body === 'Sun') return Astro.SunPosition(t).elon;
        if (body === 'Moon') return Astro.EclipticGeoMoon(t).lon;
        var eqj = Astro.GeoVector(body, t, true);
        var eqd = Astro.RotateVector(Astro.Rotation_EQJ_EQD(t), eqj);
        var mobl = Astro.e_tilt(t).mobl * RAD; // oblicuidad media de la fecha
        var tobl = Astro.e_tilt(t).tobl * RAD;
        // De ecuatorial de la fecha a eclíptica de la fecha.
        var y = eqd.y * Math.cos(tobl) + eqd.z * Math.sin(tobl);
        var x = eqd.x;
        return norm(Math.atan2(y, x) / RAD);
    }

    function ascMcHouses(date, lat, lon) {
        var t = Astro.MakeTime(date);
        var eps = Astro.e_tilt(t).tobl * RAD;
        var ramc = norm(Astro.SiderealTime(t) * 15 + lon);
        var th = ramc * RAD;
        var mc = norm(Math.atan2(Math.sin(th), Math.cos(th) * Math.cos(eps)) / RAD);
        var asc = norm(Math.atan2(Math.cos(th), -(Math.sin(th) * Math.cos(eps) + Math.tan(lat * RAD) * Math.sin(eps))) / RAD);
        // Asegurar que el Ascendente quede en el hemisferio este respecto al MC.
        if (norm(asc - mc) > 180) asc = norm(asc + 180);
        var cusps = new Array(13);
        cusps[1] = asc; cusps[10] = mc; cusps[7] = norm(asc + 180); cusps[4] = norm(mc + 180);
        var placidus = Math.abs(lat) < 66;
        if (placidus) {
            var defs = [[11, 1 / 3, true], [12, 2 / 3, true], [2, 2 / 3, false], [3, 1 / 3, false]];
            defs.forEach(function (d) {
                var ra = d[2] ? ramc + 60 * d[1] : ramc + 180 - 60 * d[1]; // valor inicial
                var lam = 0;
                for (var i = 0; i < 40; i++) {
                    var r = ra * RAD;
                    lam = Math.atan2(Math.sin(r), Math.cos(r) * Math.cos(eps));
                    var dec = Math.asin(Math.sin(eps) * Math.sin(lam));
                    var x = -Math.tan(lat * RAD) * Math.tan(dec);
                    x = Math.max(-1, Math.min(1, x));
                    var dsa = Math.acos(x) / RAD; // semiarco diurno
                    var next = d[2] ? ramc + dsa * d[1] : ramc + 180 - (180 - dsa) * d[1];
                    if (Math.abs(next - ra) < 1e-9) { ra = next; break; }
                    ra = next;
                }
                var rr = ra * RAD;
                cusps[d[0]] = norm(Math.atan2(Math.sin(rr), Math.cos(rr) * Math.cos(eps)) / RAD);
            });
            cusps[5] = norm(cusps[11] + 180); cusps[6] = norm(cusps[12] + 180);
            cusps[8] = norm(cusps[2] + 180); cusps[9] = norm(cusps[3] + 180);
        } else {
            // Latitudes polares: casas iguales desde el Ascendente.
            for (var h = 1; h <= 12; h++) cusps[h] = norm(asc + (h - 1) * 30);
        }
        return { asc: asc, mc: mc, cusps: cusps, placidus: placidus };
    }

    function houseOf(lon, cusps) {
        for (var h = 1; h <= 12; h++) {
            var a = cusps[h], b = cusps[h % 12 + 1];
            var span = norm(b - a);
            if (norm(lon - a) < span) return h;
        }
        return 1;
    }

    function signInfo(lon) {
        var i = Math.floor(lon / 30);
        return { name: SIGNS[i], degree: lon - i * 30 };
    }

    // date: Date (UTC instant), lat/lon en grados (este positivo)
    function computeNatal(date, lat, lon) {
        var hs = ascMcHouses(date, lat, lon);
        var before = new Date(date.getTime() - 43200000), after = new Date(date.getTime() + 43200000);
        var planets = BODIES.map(function (b) {
            var l = eclipticLon(b[1], date);
            var si = signInfo(l);
            var retro = false;
            if (b[1] !== 'Sun' && b[1] !== 'Moon') {
                var d = norm(eclipticLon(b[1], after) - eclipticLon(b[1], before) + 180) - 180;
                retro = d < 0;
            }
            return { name: b[0], longitude: l, zodiac: { name: si.name }, degree: si.degree,
                house_number: houseOf(l, hs.cusps), is_retrograde: retro };
        });
        var T = (Astro.MakeTime(date).tt) / 36525; // siglos julianos desde J2000
        var node = norm(125.04452 - 1934.136261 * T);
        var ns = signInfo(node);
        planets.push({ name: 'Nodo Norte', longitude: node, zodiac: { name: ns.name }, degree: ns.degree,
            house_number: houseOf(node, hs.cusps), is_retrograde: true });
        var as = signInfo(hs.asc), ms = signInfo(hs.mc);
        return { planets: planets, cusps: hs.cusps, placidus: hs.placidus,
            asc: { longitude: hs.asc, sign: as.name, degree: as.degree },
            mc: { longitude: hs.mc, sign: ms.name, degree: ms.degree } };
    }

    var api = { computeNatal: computeNatal, SIGNS: SIGNS };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Natal = api;
})(typeof window !== 'undefined' ? window : globalThis);
