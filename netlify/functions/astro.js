// Netlify Function: proxy seguro hacia Prokerala Astrology API
// El client_secret vive solo como variable de entorno (nunca en el frontend).

const API_BASE = 'https://api.prokerala.com/v2';
const TOKEN_URL = 'https://api.prokerala.com/token';

const ENDPOINTS = {
  'natal-chart': '/astrology/natal-chart',
  'natal-planet-position': '/astrology/natal-planet-position',
  'daily': '/horoscope/daily',
  'daily-love': '/horoscope/daily/love-compatibility',
  'synastry-chart': '/astrology/synastry-chart'
};

const REQUIRED_FOR = {
  'natal-chart': ['profile[datetime]', 'profile[coordinates]'],
  'natal-planet-position': ['profile[datetime]', 'profile[coordinates]'],
  'synastry-chart': ['primary_profile[datetime]', 'primary_profile[coordinates]', 'secondary_profile[datetime]', 'secondary_profile[coordinates]'],
  'daily': ['datetime', 'sign'],
  'daily-love': ['datetime', 'sign_one', 'sign_two']
};

let tokenCache = { access_token: null, expires_at: 0 };

async function getAccessToken() {
  if (tokenCache.access_token && Date.now() < tokenCache.expires_at) {
    return tokenCache.access_token;
  }
  const clientId = process.env.PROKERALA_CLIENT_ID;
  const clientSecret = process.env.PROKERALA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Credenciales de Prokerala no configuradas');
  }
  const body = new URLSearchParams();
  body.append('grant_type', 'client_credentials');
  body.append('client_id', clientId);
  body.append('client_secret', clientSecret);
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
  if (!res.ok) {
    throw new Error('Error solicitando token de Prokerala: ' + res.status);
  }
  const data = await res.json();
  tokenCache.access_token = data.access_token;
  tokenCache.expires_at = Date.now() + (parseInt(data.expires_in, 10) - 60) * 1000;
  return tokenCache.access_token;
}

async function callApi(path, params) {
  const token = await getAccessToken();
  const qs = new URLSearchParams(params);
  const url = API_BASE + path + '?' + qs.toString();
  const res = await fetch(url, {
    headers: { Authorization: 'Bearer ' + token }
  });
  if (res.status === 401) {
    tokenCache = { access_token: null, expires_at: 0 };
    const token2 = await getAccessToken();
    const retry = await fetch(url, {
      headers: { Authorization: 'Bearer ' + token2 }
    });
    return retry;
  }
  return res;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  try {
    const ep = event.queryStringParameters && event.queryStringParameters.ep;
    if (!ep || !ENDPOINTS[ep]) {
      return {
        statusCode: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'endpoint no permitido' })
      };
    }

    const params = {};
    Object.keys(event.queryStringParameters).forEach(function(k) {
      if (k !== 'ep') params[k] = event.queryStringParameters[k];
    });

    const required = REQUIRED_FOR[ep] || [];
    for (let i = 0; i < required.length; i++) {
      if (!params[required[i]]) {
        return {
          statusCode: 400,
          headers: { ...CORS, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'falta el par\u00e1metro: ' + required[i] })
        };
      }
    }

    const LANG_BY_EP = {
      'daily-love': 'en'
    };
    if (!params.la) params.la = LANG_BY_EP[ep] || 'es';
    if (!params.house_system) params.house_system = 'placidus';

    const upstream = await callApi(ENDPOINTS[ep], params);
    const contentType = upstream.headers.get('content-type') || 'application/json';
    const text = await upstream.text();

    if (!upstream.ok) {
      return {
        statusCode: upstream.status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: text
      };
    }

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': contentType },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'error interno' })
    };
  }
};