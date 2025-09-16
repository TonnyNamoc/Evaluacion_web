// Usa la base del API definida en index.html (o cae a /api)
const API = window.API_BASE || '/api';

const $ = s => document.querySelector(s);
const tbody = $('#tbody');
const tablaMsg = $('#tabla-msg');
const filtro = $('#filtro');

const kpiTotal = $('#kpi-total');
const kpiNuevos = $('#kpi-nuevos');
const kpiStock = $('#kpi-stock');
const kpiBajo = $('#kpi-bajo');
const kpiProm = $('#kpi-promedio');
const kpiMax = $('#kpi-max');
const kpiCats = $('#kpi-cats');
const kpiTop = $('#kpi-topcat');

const catBars = $('#cat-bars');
const sparkline = $('#sparkline');

let productos = [];

const fmtMoney = n => `S/ ${Number(n || 0).toFixed(2)}`;
const fmtDate = s => (s ? new Date(s).toLocaleDateString() : '—');

async function cargar() {
  tablaMsg.textContent = 'Cargando...';
  try {
    const res = await fetch(`${API}/productos`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al cargar');

    productos = data.data || [];
    renderKPIs(productos);
    renderBars(productos);
    renderSparkline(productos);
    renderTabla(productos);

    tablaMsg.textContent = productos.length ? '' : 'No hay productos.';
  } catch (e) {
    console.error('GET /productos ->', e);
    tablaMsg.textContent = 'No se pudo cargar productos.';
  }
}

function renderKPIs(list) {
  const total = list.length;
  const stockTotal = list.reduce((a, b) => a + Number(b.stock || 0), 0);
  const precios = list.map(x => Number(x.precio || 0));
  const prom = precios.length ? precios.reduce((a,b)=>a+b,0)/precios.length : 0;
  const max = precios.length ? Math.max(...precios) : 0;
  const hoy = new Date().toDateString();
  const nuevosHoy = list.filter(x => (x.createdAt && new Date(x.createdAt).toDateString() === hoy)).length;
  const bajo = list.filter(x => Number(x.stock) <= 5).length;

  const byCat = {};
  for (const p of list) byCat[p.categoria] = (byCat[p.categoria] || 0) + 1;
  const cats = Object.keys(byCat);
  const topCat = cats.sort((a,b)=>byCat[b]-byCat[a])[0] || '—';

  kpiTotal.textContent = total || '—';
  kpiNuevos.textContent = `${nuevosHoy} nuevos hoy`;
  kpiStock.textContent = stockTotal || '—';
  kpiBajo.textContent = `${bajo} con stock ≤ 5`;
  kpiProm.textContent = precios.length ? fmtMoney(prom) : '—';
  kpiMax.textContent = precios.length ? `máx ${fmtMoney(max)}` : 'máx —';
  kpiCats.textContent = cats.length || '—';
  kpiTop.textContent = topCat;
}

function renderBars(list) {
  const byCat = {};
  for (const p of list) byCat[p.categoria] = (byCat[p.categoria] || 0) + 1;
  const total = list.length || 1;
  catBars.innerHTML = '';
  Object.entries(byCat).forEach(([cat, count]) => {
    const pct = Math.round((count/total)*100);
    const row = document.createElement('div'); row.className='bar';
    row.innerHTML = `
      <div class="bar-label">${cat}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      <div class="bar-num">${count}</div>`;
    catBars.appendChild(row);
  });
  if (!Object.keys(byCat).length) {
    catBars.innerHTML = `<p class="muted">Sin datos.</p>`;
  }
}

function renderSparkline(list) {
  const sorted = [...list].sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0));
  const vals = sorted.map(x=>Number(x.precio||0));
  const N = vals.length;
  if (!N) { sparkline.innerHTML = `<p class="muted">Sin datos.</p>`; return; }

  const W = 600, H = 100, PAD = 6;
  const min = Math.min(...vals), max = Math.max(...vals);
  const scaleX = i => PAD + (i*(W-2*PAD))/Math.max(N-1,1);
  const scaleY = v => H-PAD - ((v-min)*(H-2*PAD)) / Math.max(max-min || 1, 1);

  sparkline.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <polyline fill="none" stroke-width="2" points="${
        vals.map((v,i)=>`${scaleX(i)},${scaleY(v)}`).join(' ')
      }"></polyline>
    </svg>`;
}

function renderTabla(list) {
  const q = (filtro?.value || '').toLowerCase();
  const filtered = list.filter(p =>
    (p.nombre||'').toLowerCase().includes(q) ||
    (p.categoria||'').toLowerCase().includes(q)
  );

  tbody.innerHTML = '';
  filtered.forEach(p=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.nombre || '—'}</td>
      <td>${p.descripcion || '—'}</td>
      <td>${fmtMoney(p.precio)}</td>
      <td>${p.stock ?? '—'}</td>
      <td>${p.categoria || '—'}</td>
      <td>${fmtDate(p.createdAt)}</td>
      <td>
        <div class="table-actions">
          <button class="icon-btn" title="Editar" data-edit="${p._id}">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="icon-btn danger" title="Eliminar" data-del="${p._id}">
            <i class="bi bi-archive"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Delegado de eventos para los botones
tbody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  if (btn.dataset.edit) {
    const id = btn.dataset.edit;
    location.href = `./create.html?id=${id}`;
    return;
  }

  if (btn.dataset.del) {
    const id = btn.dataset.del;
    if (!confirm('¿Eliminar este producto?')) return;

    btn.disabled = true;
    try {
      const res = await fetch(`${API}/productos/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) {
        alert(data?.error || 'No se pudo eliminar');
        return;
      }
      await cargar();
    } catch (err) {
      console.error(err);
      alert('Error de red o servidor al eliminar');
    } finally {
      btn.disabled = false;
    }
  }
});

filtro?.addEventListener('input', ()=>renderTabla(productos));
cargar();
