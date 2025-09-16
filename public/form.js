const API = window.API_BASE;
const $ = s => document.querySelector(s);

const form = $('#form');
const formTitle = $('#form-title');
const nombre = $('#nombre');
const descripcion = $('#descripcion');
const precio = $('#precio');
const stock = $('#stock');
const categoria = $('#categoria');
const ok = $('#msg-ok');
const errorMsg = $('#msg-error');

const params = new URLSearchParams(location.search);
const editId = params.get('id');
let editMode = !!editId;

async function cargarProducto(id) {
  try {
    const res = await fetch(`${API}/productos/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar el producto');

    const p = data.data;
    nombre.value = p.nombre || '';
    descripcion.value = p.descripcion || '';
    precio.value = p.precio ?? '';
    stock.value = p.stock ?? '';
    categoria.value = p.categoria || '';

    formTitle.textContent = 'Editar producto';
  } catch (e) {
    console.error(e);
    errorMsg.textContent = e.message;
  }
}

if (editMode) {
  cargarProducto(editId);
  form.querySelector('button[type="submit"]').textContent = 'Actualizar';
} else {
  formTitle.textContent = 'Registrar producto';
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  ok.textContent = '';
  errorMsg.textContent = '';

  const body = {
    nombre: nombre.value.trim(),
    descripcion: descripcion.value.trim(),
    precio: parseFloat(precio.value),
    stock: parseInt(stock.value,10),
    categoria: categoria.value
  };

  const url = editMode ? `${API}/productos/${editId}` : `${API}/productos`;
  const method = editMode ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(()=>({}));

    if (!res.ok) {
      errorMsg.textContent = data.detalles ? data.detalles.join(' | ') : (data.error || 'Error');
      return;
    }

    ok.textContent = editMode ? '✅ Producto actualizado' : '✅ Producto registrado';

    // Redirigir al dashboard después de 1s
    setTimeout(()=> location.href = './index.html', 800);
  } catch (err) {
    console.error(err);
    errorMsg.textContent = 'Error de red o servidor';
  }
});
