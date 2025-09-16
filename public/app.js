const API = '/api'; // mismo host

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const form = $('#producto-form');
const formTitle = $('#form-title');
const inputId = $('#id');
const nombre = $('#nombre');
const descripcion = $('#descripcion');
const precio = $('#precio');
const stock = $('#stock');
const categoria = $('#categoria');
const btnGuardar = $('#btn-guardar');
const btnCancelar = $('#btn-cancelar');
const formError = $('#form-error');
const formOk = $('#form-ok');
const tbody = $('#tabla-body');
const tablaMsg = $('#tabla-msg');

let editMode = false;

const limpiarForm = () => {
  inputId.value = '';
  nombre.value = '';
  descripcion.value = '';
  precio.value = '';
  stock.value = '';
  categoria.value = '';
  formError.textContent = '';
  formOk.textContent = '';
};

const setCreateMode = () => {
  editMode = false;
  formTitle.textContent = 'Crear producto';
  btnGuardar.textContent = 'Guardar';
  btnCancelar.classList.add('hidden');
  limpiarForm();
};

const setEditMode = (prod) => {
  editMode = true;
  formTitle.textContent = 'Editar producto';
  btnGuardar.textContent = 'Actualizar';
  btnCancelar.classList.remove('hidden');
  inputId.value = prod._id;
  nombre.value = prod.nombre;
  descripcion.value = prod.descripcion;
  precio.value = prod.precio;
  stock.value = prod.stock;
  categoria.value = prod.categoria;
  formError.textContent = '';
  formOk.textContent = '';
};

btnCancelar.addEventListener('click', setCreateMode);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.textContent = '';
  formOk.textContent = '';

  const body = {
    nombre: nombre.value.trim(),
    descripcion: descripcion.value.trim(),
    precio: parseFloat(precio.value),
    stock: parseInt(stock.value, 10),
    categoria: categoria.value
  };

  try {
    btnGuardar.disabled = true;

    const url = editMode ? `${API}/productos/${inputId.value}` : `${API}/productos`;
    const method = editMode ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      formError.textContent = data.detalles ? data.detalles.join(' | ') : (data.error || 'Error');
      return;
    }

    formOk.textContent = editMode ? 'Producto actualizado' : 'Producto creado';
    await cargarProductos();
    if (!editMode) limpiarForm();
  } catch (err) {
    formError.textContent = 'Error de red o servidor';
  } finally {
    btnGuardar.disabled = false;
  }
});

const btnAccion = (label, clase, handler) => {
  const b = document.createElement('button');
  b.textContent = label;
  b.className = `small ${clase}`;
  b.type = 'button';
  b.addEventListener('click', handler);
  return b;
};

const renderFila = (p) => {
  const tr = document.createElement('tr');
  const celdas = [
    ['Nombre', p.nombre],
    ['Descripción', p.descripcion],
    ['Precio', `S/ ${Number(p.precio).toFixed(2)}`],
    ['Stock', p.stock],
    ['Categoría', p.categoria]
  ];
  celdas.forEach(([label, val]) => {
    const td = document.createElement('td');
    td.dataset.label = label;
    td.textContent = val;
    tr.appendChild(td);
  });

  const tdAcc = document.createElement('td');
  tdAcc.dataset.label = 'Acciones';
  tdAcc.style.display = 'flex';
  tdAcc.style.gap = '6px';

  const editar = btnAccion('Editar', 'secondary', () => setEditMode(p));
  const eliminar = btnAccion('Eliminar', 'danger', async () => {
    if (!confirm('¿Eliminar este producto?')) return;
    const res = await fetch(`${API}/productos/${p._id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Error al eliminar'); return; }
    await cargarProductos();
    if (editMode && inputId.value === p._id) setCreateMode();
  });

  tdAcc.appendChild(editar);
  tdAcc.appendChild(eliminar);
  tr.appendChild(tdAcc);
  return tr;
};

const cargarProductos = async () => {
  tbody.innerHTML = '';
  tablaMsg.textContent = 'Cargando...';
  try {
    const res = await fetch(`${API}/productos`);
    const data = await res.json();
    if (!res.ok) { tablaMsg.textContent = data.error || 'Error'; return; }
    const productos = data.data || [];
    if (productos.length === 0) {
      tablaMsg.textContent = 'No hay productos.';
      return;
    }
    tablaMsg.textContent = '';
    productos.forEach(p => tbody.appendChild(renderFila(p)));
  } catch (err) {
    tablaMsg.textContent = 'Error de red o servidor.';
  }
};

// init
setCreateMode();
cargarProductos();
