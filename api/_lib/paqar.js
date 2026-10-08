// Cliente de la API Paq.ar 2.0 de Correo Argentino (alta de orden, rótulo y cancelación).
// Variables: PAQAR_AGREEMENT, PAQAR_APIKEY, PAQAR_ENV (test | prod, por defecto prod) y los datos del remitente
// PAQAR_SENDER_NAME, PAQAR_SENDER_EMAIL, PAQAR_SENDER_PHONE, PAQAR_SENDER_STREET, PAQAR_SENDER_NUMBER,
// PAQAR_SENDER_CITY, PAQAR_SENDER_STATE (letra de provincia), PAQAR_SENDER_ZIP
// (opcionales: PAQAR_SENDER_ID, PAQAR_SENDER_FLOOR, PAQAR_SENDER_DEPT, PAQAR_SERVICE_TYPE, PAQAR_CATEGORY).

const PROVINCES = [
  ['A', 'Salta'], ['B', 'Buenos Aires'], ['C', 'Ciudad Autónoma de Buenos Aires'], ['D', 'San Luis'], ['E', 'Entre Ríos'], ['F', 'La Rioja'],
  ['G', 'Santiago del Estero'], ['H', 'Chaco'], ['J', 'San Juan'], ['K', 'Catamarca'], ['L', 'La Pampa'], ['M', 'Mendoza'], ['N', 'Misiones'],
  ['P', 'Formosa'], ['Q', 'Neuquén'], ['R', 'Río Negro'], ['S', 'Santa Fe'], ['T', 'Tucumán'], ['U', 'Chubut'], ['V', 'Tierra del Fuego'],
  ['W', 'Corrientes'], ['X', 'Córdoba'], ['Y', 'Jujuy'], ['Z', 'Santa Cruz']
];

function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim(); }

// Intenta deducir la letra de provincia desde el texto que escribió el cliente ("CABA", "Bs As", "Córdoba"...).
function provinceCode(text) {
  const t = norm(text);
  if (!t) return '';
  if (/^[a-z]$/.test(t) && PROVINCES.some(function (p) { return p[0].toLowerCase() === t; })) return t.toUpperCase();
  if (/^(caba|capital federal|ciudad autonoma.*|ciudad de buenos aires|capital)$/.test(t)) return 'C';
  if (/^(bs as|bs\.? as\.?|bsas|buenos aires|provincia de buenos aires|gba|pba)$/.test(t)) return 'B';
  const hit = PROVINCES.filter(function (p) { return norm(p[1]) === t; })[0];
  if (hit) return hit[0];
  const part = PROVINCES.filter(function (p) { return t.indexOf(norm(p[1])) !== -1 && p[0] !== 'C'; })[0];
  return part ? part[0] : '';
}

// "Av. Rivadavia 1234 piso 3 B" -> { street, number, rest }
function splitAddress(addr) {
  const m = /^(.*?)[\s,]+(\d{1,6})\b[\s,]*(.*)$/.exec(String(addr || '').trim());
  return m ? { street: m[1].trim(), number: m[2], rest: m[3].trim() } : { street: String(addr || '').trim(), number: '', rest: '' };
}

function configured() { return !!(process.env.PAQAR_AGREEMENT && process.env.PAQAR_APIKEY); }
function baseUrl() { return process.env.PAQAR_ENV === 'test' ? 'https://apitest.correoargentino.com.ar/paqar/v1' : 'https://api.correoargentino.com.ar/paqar/v1'; }

async function call(method, path, body) {
  const r = await fetch(baseUrl() + path, {
    method: method,
    headers: { authorization: 'Apikey ' + process.env.PAQAR_APIKEY, agreement: String(process.env.PAQAR_AGREEMENT), 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let data = null;
  try { data = await r.json(); } catch (e) { data = null; }
  return { ok: r.ok, status: r.status, data: data };
}

function senderData() {
  const e = process.env;
  const s = {
    businessName: e.PAQAR_SENDER_NAME || '', email: e.PAQAR_SENDER_EMAIL || '', observation: '',
    areaCodePhone: '', phoneNumber: '', areaCodeCellphone: '', cellphoneNumber: String(e.PAQAR_SENDER_PHONE || ''),
    address: { streetName: e.PAQAR_SENDER_STREET || '', streetNumber: e.PAQAR_SENDER_NUMBER || '', cityName: e.PAQAR_SENDER_CITY || '',
      floor: e.PAQAR_SENDER_FLOOR || '', department: e.PAQAR_SENDER_DEPT || '', state: e.PAQAR_SENDER_STATE || '', zipCode: e.PAQAR_SENDER_ZIP || '' }
  };
  if (e.PAQAR_SENDER_ID) s.id = e.PAQAR_SENDER_ID;
  return s;
}
function senderMissing() {
  const e = process.env;
  return ['PAQAR_SENDER_NAME', 'PAQAR_SENDER_STREET', 'PAQAR_SENDER_NUMBER', 'PAQAR_SENDER_CITY', 'PAQAR_SENDER_STATE', 'PAQAR_SENDER_ZIP'].filter(function (k) { return !e[k]; });
}

// Fecha en formato AAAA-MM-DDTHH:mm:ss-03:00 (hora argentina)
function arDate(iso) {
  const d = new Date(new Date(iso).getTime() - 3 * 3600 * 1000);
  return d.toISOString().slice(0, 19) + '-03:00';
}

// Da de alta la orden en Correo Argentino y devuelve el número de seguimiento.
async function createOrder(order, rcpt, parcel) {
  const body = {
    sellerId: String(process.env.PAQAR_AGREEMENT),
    order: {
      senderData: senderData(),
      shippingData: {
        name: rcpt.name, areaCodePhone: '', phoneNumber: '', areaCodeCellphone: '', cellphoneNumber: String(rcpt.phone || ''), email: rcpt.email || '', observation: rcpt.observation || '',
        address: { streetName: rcpt.street, streetNumber: String(rcpt.number), cityName: rcpt.city, floor: rcpt.floor || '', department: rcpt.department || '', state: rcpt.state, zipCode: String(rcpt.zip) }
      },
      parcels: [{
        dimensions: { height: String(parcel.height), width: String(parcel.width), depth: String(parcel.depth) },
        productWeight: String(parcel.weight), productCategory: process.env.PAQAR_CATEGORY || 'Articulos esotericos', declaredValue: String(Math.round(parcel.declaredValue))
      }],
      deliveryType: 'homeDelivery', agencyId: '', saleDate: arDate(order.created_at), serviceType: process.env.PAQAR_SERVICE_TYPE || 'CP', shipmentClientId: ''
    }
  };
  const r = await call('POST', '/orders', body);
  if (!r.ok) return { ok: false, status: r.status, message: (r.data && (r.data.message || r.data.error)) || 'Error ' + r.status };
  const tn = r.data && (r.data.trackingNumber || (r.data.order && r.data.order.trackingNumber));
  if (!tn) return { ok: false, status: r.status, message: 'Correo no devolvió el número de seguimiento.' };
  return { ok: true, trackingNumber: String(tn) };
}

async function getLabel(trackingNumber) {
  const r = await call('POST', '/labels?labelFormat=10x15', [{ sellerId: String(process.env.PAQAR_AGREEMENT), trackingNumber: trackingNumber }]);
  if (!r.ok) return { ok: false, message: (r.data && (r.data.message || r.data.error)) || 'Error ' + r.status };
  const item = Array.isArray(r.data) ? r.data[0] : null;
  if (!item || item.result !== 'OK' || !item.fileBase64) return { ok: false, message: (item && item.result) || 'No se pudo obtener el rótulo.' };
  return { ok: true, fileBase64: item.fileBase64, fileName: item.fileName || 'rotulo.pdf' };
}

async function cancelOrder(trackingNumber) {
  const r = await call('PATCH', '/orders/' + encodeURIComponent(trackingNumber) + '/cancel');
  if (!r.ok) return { ok: false, message: (r.data && (r.data.message || r.data.error)) || 'Error ' + r.status };
  return { ok: true };
}

module.exports = { PROVINCES: PROVINCES, provinceCode: provinceCode, splitAddress: splitAddress, configured: configured, senderMissing: senderMissing, createOrder: createOrder, getLabel: getLabel, cancelOrder: cancelOrder };
