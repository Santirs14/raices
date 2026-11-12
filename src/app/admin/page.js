"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Package, 
  PlusCircle, 
  LogOut, 
  Store, 
  Trash2, 
  Edit3,
  XCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Wallet
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("productos"); // 'productos' o 'productores'
  const [productores, setProductores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para subida y preview de fotos
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  // Estado para saber si estamos editando un producto existente
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);

  // Formulario Producto (crear y editar)
  const estadoInicialProducto = {
    productor_id: "",
    categoria_id: "",
    nombre: "",
    descripcion: "",
    precio: "",
    unidad_medida: "Kg",
    stock: 1,
    estado: "Disponible",
    destacado: false,
    imagen_url: "",
    metodos_pago: []
  };
  const [formProducto, setFormProducto] = useState(estadoInicialProducto);

  // Formulario Nuevo Productor
  const [nuevoProd, setNuevoProd] = useState({
    nombre_completo: "",
    telefono_whatsapp: "",
    municipio: "Puerto Boyacá",
    vereda: "",
    asociacion: "",
  });

  useEffect(() => {
    verificarSesion();
  }, []);

  async function verificarSesion() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
    cargarDatos();
  }

  async function cargarDatos() {
    setCargando(true);
    const { data: prods } = await supabase.from("productores").select("*").order("created_at", { ascending: false });
    const { data: cats } = await supabase.from("categorias").select("*");
    const { data: items } = await supabase.from("productos").select(`
      *,
      productores (nombre_completo, vereda)
    `).order("created_at", { ascending: false });

    if (prods) setProductores(prods);
    if (cats) setCategorias(cats);
    if (items) setProductos(items);
    setCargando(false);
  }

  // Manejo de la selección de imagen local y preview
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoImagen(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  }

  function handleQuitarFoto() {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setArchivoImagen(null);
    setPreviewUrl(null);
    setFormProducto(prev => ({ ...prev, imagen_url: "" }));
  }

  // Funciones para gestionar Métodos de Pago dinámicos
  function handleAgregarMetodoPago() {
    setFormProducto(prev => ({
      ...prev,
      metodos_pago: [...(prev.metodos_pago || []), { metodo: "Nequi", dato: "", titular: "" }]
    }));
  }

  function handleActualizarMetodoPago(index, campo, valor) {
    setFormProducto(prev => {
      const copia = [...(prev.metodos_pago || [])];
      copia[index] = { ...copia[index], [campo]: valor };
      return { ...prev, metodos_pago: copia };
    });
  }

  function handleEliminarMetodoPago(index) {
    setFormProducto(prev => ({
      ...prev,
      metodos_pago: (prev.metodos_pago || []).filter((_, i) => i !== index)
    }));
  }

  // Activar modo edición cargando los datos del producto
  function handleEditarProducto(prod) {
    setProductoEnEdicion(prod.id);
    setFormProducto({
      productor_id: prod.productor_id,
      categoria_id: String(prod.categoria_id),
      nombre: prod.nombre,
      descripcion: prod.descripcion || "",
      precio: prod.precio,
      unidad_medida: prod.unidad_medida,
      stock: prod.stock ?? 1,
      estado: prod.estado || "Disponible",
      destacado: Boolean(prod.destacado),
      imagen_url: prod.imagen_url || "",
      metodos_pago: Array.isArray(prod.metodos_pago) ? prod.metodos_pago : []
    });
    setPreviewUrl(prod.imagen_url || null);
    setArchivoImagen(null);
    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  // Cancelar la edición y volver a creación
  function handleCancelarEdicion() {
    setProductoEnEdicion(null);
    setFormProducto(estadoInicialProducto);
    handleQuitarFoto();
  }

  // Crear o Actualizar Producto en Supabase
  async function handleSubmitProducto(e) {
    e.preventDefault();
    setSubiendoFoto(true);

    let urlFinalImagen = formProducto.imagen_url;

    // 1. Si se seleccionó una imagen nueva, subirla a Supabase Storage
    if (archivoImagen) {
      const fileExt = archivoImagen.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filePath, archivoImagen);

      if (uploadError) {
        alert("Error al subir imagen: " + uploadError.message);
        setSubiendoFoto(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath);

      urlFinalImagen = publicUrl;
    }

    // Limpiar métodos de pago vacíos antes de guardar
    const metodosLimpios = (formProducto.metodos_pago || []).filter(
      (m) => m.dato.trim() !== "" || m.metodo === "Efectivo"
    );

    const payload = {
      productor_id: formProducto.productor_id,
      categoria_id: Number(formProducto.categoria_id),
      nombre: formProducto.nombre,
      descripcion: formProducto.descripcion,
      precio: parseFloat(formProducto.precio),
      unidad_medida: formProducto.unidad_medida,
      stock: parseInt(formProducto.stock, 10),
      estado: parseInt(formProducto.stock, 10) <= 0 ? "Agotado" : formProducto.estado,
      destacado: formProducto.destacado,
      imagen_url: urlFinalImagen,
      metodos_pago: metodosLimpios
    };

    if (productoEnEdicion) {
      // MODO EDICIÓN: Actualizar registro
      const { error: updateError } = await supabase
        .from("productos")
        .update(payload)
        .eq("id", productoEnEdicion);

      if (!updateError) {
        handleCancelarEdicion();
        cargarDatos();
      } else {
        alert("Error al actualizar producto: " + updateError.message);
      }
    } else {
      // MODO CREACIÓN: Insertar nuevo
      const { error: insertError } = await supabase
        .from("productos")
        .insert([payload]);

      if (!insertError) {
        handleCancelarEdicion();
        cargarDatos();
      } else {
        alert("Error al guardar producto: " + insertError.message);
      }
    }

    setSubiendoFoto(false);
  }

  // Eliminar Producto
  async function handleEliminarProducto(id) {
    if (confirm("¿Estás seguro de retirar este producto del catálogo?")) {
      await supabase.from("productos").delete().eq("id", id);
      if (productoEnEdicion === id) {
        handleCancelarEdicion();
      }
      cargarDatos();
    }
  }

  // Guardar Productor Campesino
  async function handleCrearProductor(e) {
    e.preventDefault();
    const { error } = await supabase.from("productores").insert([nuevoProd]);
    if (!error) {
      setNuevoProd({ nombre_completo: "", telefono_whatsapp: "", municipio: "Puerto Boyacá", vereda: "", asociacion: "" });
      cargarDatos();
    } else {
      alert("Error al registrar campesino: " + error.message);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Barra Superior */}
      <header className="bg-zajuna-purple text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-zajuna-yellow rounded-xl flex items-center justify-center font-black text-zajuna-purple text-xl">
            A
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight">Panel Administrativo</h1>
            <p className="text-xs text-zajuna-yellow font-semibold">Raíces del Occidente · Las Quinchas</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl font-bold transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zajuna-yellow" />
            Ver Catálogo
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 px-3 py-2 rounded-xl font-bold transition shadow"
          >
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-6 flex gap-3">
        <button
          onClick={() => { setTab("productos"); handleCancelarEdicion(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all shadow-sm ${
            tab === "productos"
              ? "bg-zajuna-green text-white"
              : "bg-white text-stone-600 hover:bg-stone-50"
          }`}
        >
          <Package className="w-4 h-4 text-zajuna-yellow" />
          Gestión de Productos ({productos.length})
        </button>
        <button
          onClick={() => { setTab("productores"); handleCancelarEdicion(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all shadow-sm ${
            tab === "productores"
              ? "bg-zajuna-purple text-white"
              : "bg-white text-stone-600 hover:bg-stone-50"
          }`}
        >
          <Users className="w-4 h-4 text-zajuna-yellow" />
          Productores Campesinos ({productores.length})
        </button>
      </div>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1">
        {/* PESTAÑA: PRODUCTOS */}
        {tab === "productos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Formulario (Crear / Editar) - 5 Cols */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm h-fit">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-stone-800 flex items-center gap-2">
                  {productoEnEdicion ? (
                    <>
                      <Edit3 className="w-5 h-5 text-zajuna-purple" />
                      Modificar Producto
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5 text-zajuna-green" />
                      Cargar Nuevo Producto
                    </>
                  )}
                </h2>
                {productoEnEdicion && (
                  <button
                    type="button"
                    onClick={handleCancelarEdicion}
                    className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1 font-bold"
                  >
                    <XCircle className="w-4 h-4" /> Cancelar
                  </button>
                )}
              </div>

              <p className="text-xs text-stone-500 mb-4">
                {productoEnEdicion
                  ? "Edita precios, stock, métodos de pago o disponibilidad."
                  : "Asigna el producto, define el stock inicial y publica directo al catálogo."}
              </p>

              <form onSubmit={handleSubmitProducto} className="space-y-3">
                {/* Productor */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Productor Campesino *</label>
                  <select
                    required
                    value={formProducto.productor_id}
                    onChange={(e) => setFormProducto({ ...formProducto, productor_id: e.target.value })}
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5 outline-none focus:border-zajuna-green bg-stone-50/50"
                  >
                    <option value="">Selecciona al campesino...</option>
                    {productores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre_completo} ({p.vereda})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categoría */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Categoría del Rubro *</label>
                  <select
                    required
                    value={formProducto.categoria_id}
                    onChange={(e) => setFormProducto({ ...formProducto, categoria_id: e.target.value })}
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5 outline-none focus:border-zajuna-green bg-stone-50/50"
                  >
                    <option value="">Selecciona categoría...</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Nombre */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Yuca Criolla Lavada"
                    value={formProducto.nombre}
                    onChange={(e) => setFormProducto({ ...formProducto, nombre: e.target.value })}
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5 outline-none focus:border-zajuna-green"
                  />
                </div>

                {/* Precio y Unidad */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Precio (COP) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Ej: 3500"
                      value={formProducto.precio}
                      onChange={(e) => setFormProducto({ ...formProducto, precio: e.target.value })}
                      className="w-full text-xs border border-stone-300 rounded-xl p-2.5 outline-none focus:border-zajuna-green"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Unidad *</label>
                    <select
                      value={formProducto.unidad_medida}
                      onChange={(e) => setFormProducto({ ...formProducto, unidad_medida: e.target.value })}
                      className="w-full text-xs border border-stone-300 rounded-xl p-2.5 outline-none focus:border-zajuna-green bg-stone-50/50"
                    >
                      <option value="Kg">Kg</option>
                      <option value="Libra">Libra</option>
                      <option value="Litro">Litro</option>
                      <option value="Canastilla">Canastilla</option>
                      <option value="Bolsa">Bolsa</option>
                      <option value="Unidad">Unidad</option>
                    </select>
                  </div>
                </div>

                {/* STOCK Y ESTADO DISPONIBLE / AGOTADO */}
                <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">
                      Cantidad en Stock *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formProducto.stock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setFormProducto({
                          ...formProducto,
                          stock: val,
                          estado: val <= 0 ? "Agotado" : formProducto.estado
                        });
                      }}
                      className="w-full text-xs border border-stone-300 rounded-lg p-2 outline-none focus:border-zajuna-green bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">
                      Estado de Venta
                    </label>
                    <select
                      value={formProducto.estado}
                      onChange={(e) => setFormProducto({ ...formProducto, estado: e.target.value })}
                      className="w-full text-xs border border-stone-300 rounded-lg p-2 outline-none focus:border-zajuna-green bg-white font-bold"
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Agotado">Agotado</option>
                    </select>
                  </div>
                </div>

                {/* MÉTODOS DE PAGO (INFORMATIVO) */}
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-zajuna-purple" />
                      Métodos de Pago (Opcional)
                    </label>
                    <button
                      type="button"
                      onClick={handleAgregarMetodoPago}
                      className="bg-zajuna-purple hover:bg-zajuna-purpleLight text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition shadow-sm"
                    >
                      + Agregar
                    </button>
                  </div>

                  {(!formProducto.metodos_pago || formProducto.metodos_pago.length === 0) ? (
                    <p className="text-[11px] text-stone-400 italic">
                      Sin cuentas agregadas. En el catálogo dirá &quot;A convenir por WhatsApp&quot;.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {formProducto.metodos_pago.map((item, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-stone-200 space-y-1.5 relative">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={item.metodo}
                              onChange={(e) => handleActualizarMetodoPago(idx, "metodo", e.target.value)}
                              className="w-1/2 text-[11px] font-bold border border-stone-300 rounded-lg p-1.5 outline-none focus:border-zajuna-purple bg-stone-50"
                            >
                              <option value="Nequi">Nequi</option>
                              <option value="Daviplata">Daviplata</option>
                              <option value="Llave Bre-B">Llave Bre-B</option>
                              <option value="Bancolombia">Bancolombia</option>
                              <option value="Banco Agrario">Banco Agrario</option>
                              <option value="Efectivo">Efectivo</option>
                              <option value="Otro">Otro</option>
                            </select>

                            <input
                              type="text"
                              placeholder={item.metodo === "Efectivo" ? "Ej: Contra entrega" : "N° Cuenta o Llave"}
                              value={item.dato}
                              onChange={(e) => handleActualizarMetodoPago(idx, "dato", e.target.value)}
                              className="w-1/2 text-[11px] border border-stone-300 rounded-lg p-1.5 outline-none focus:border-zajuna-purple"
                            />

                            <button
                              type="button"
                              onClick={() => handleEliminarMetodoPago(idx)}
                              className="text-red-500 hover:bg-red-50 p-1 rounded-md transition"
                              title="Quitar método"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <input
                            type="text"
                            placeholder="Nombre del titular (ej: Don Jaime Pardo)"
                            value={item.titular}
                            onChange={(e) => handleActualizarMetodoPago(idx, "titular", e.target.value)}
                            className="w-full text-[11px] border border-stone-200 rounded-lg p-1.5 outline-none focus:border-zajuna-purple text-stone-600"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Casilla Producto Destacado / Popular */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="chkDestacado"
                    checked={formProducto.destacado}
                    onChange={(e) => setFormProducto({ ...formProducto, destacado: e.target.checked })}
                    className="w-4 h-4 rounded text-zajuna-purple focus:ring-zajuna-purple cursor-pointer"
                  />
                  <label htmlFor="chkDestacado" className="text-xs font-bold text-stone-700 cursor-pointer">
                    Destacar en la sección &quot;Populares de la Semana&quot;
                  </label>
                </div>

                {/* Fotografía con Preview */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Fotografía del Producto {productoEnEdicion ? "(Opcional si ya tiene)" : "*"}
                  </label>

                  {previewUrl ? (
                    <div className="relative w-full h-36 rounded-2xl overflow-hidden border-2 border-dashed border-zajuna-green bg-stone-50 group flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handleQuitarFoto}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition"
                        >
                          Cambiar Foto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-zajuna-purple rounded-2xl p-4 bg-stone-50 transition cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        required={!productoEnEdicion && !formProducto.imagen_url}
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="text-center pointer-events-none">
                        <p className="text-xs font-bold text-stone-700">Seleccionar imagen desde tu equipo</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">JPG, PNG o WEBP</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Descripción / Cosecha</label>
                  <textarea
                    rows={2}
                    placeholder="Detalles de calidad, origen, etc."
                    value={formProducto.descripcion}
                    onChange={(e) => setFormProducto({ ...formProducto, descripcion: e.target.value })}
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5 outline-none focus:border-zajuna-green"
                  ></textarea>
                </div>

                {/* Botón de Enviar */}
                <button
                  type="submit"
                  disabled={subiendoFoto}
                  className={`w-full text-white font-black py-2.5 rounded-xl shadow transition text-sm flex items-center justify-center gap-2 ${
                    productoEnEdicion
                      ? "bg-zajuna-purple hover:bg-zajuna-purpleLight"
                      : "bg-zajuna-green hover:bg-zajuna-greenLight"
                  } disabled:opacity-50`}
                >
                  {subiendoFoto ? (
                    "Guardando y subiendo foto..."
                  ) : productoEnEdicion ? (
                    <>
                      <Edit3 className="w-4 h-4 text-zajuna-yellow" />
                      Actualizar Producto
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-zajuna-yellow" />
                      Publicar en el Catálogo
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Listado de Productos con Acciones de Editar y Eliminar - 7 Cols */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-stone-800">
                  Inventario de Productos ({productos.length})
                </h2>
                <span className="text-xs font-semibold text-stone-400">
                  Acciones directas
                </span>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 uppercase font-bold border-b">
                    <tr>
                      <th className="p-3">Producto</th>
                      <th className="p-3">Productor</th>
                      <th className="p-3">Precio</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {productos.map((item) => (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-stone-50 transition ${
                          productoEnEdicion === item.id ? "bg-purple-50/60" : ""
                        }`}
                      >
                        <td className="p-3">
                          <span className="font-bold text-stone-800 block text-sm">{item.nombre}</span>
                          <span className="text-[10px] text-stone-400">Por {item.unidad_medida}</span>
                          {Array.isArray(item.metodos_pago) && item.metodos_pago.length > 0 && (
                            <span className="inline-block mt-0.5 text-[10px] font-semibold text-zajuna-purple bg-purple-50 px-1.5 py-0.5 rounded">
                              {item.metodos_pago.length} método(s) de pago
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-stone-700 block">{item.productores?.nombre_completo}</span>
                          <span className="text-[10px] text-stone-400">{item.productores?.vereda}</span>
                        </td>
                        <td className="p-3 font-extrabold text-zajuna-green text-sm">
                          ${Number(item.precio).toLocaleString("es-CO")}
                        </td>
                        <td className="p-3">
                          <span className={`font-black ${item.stock <= 5 ? "text-amber-600" : "text-stone-700"}`}>
                            {item.stock ?? 0}
                          </span>
                        </td>
                        <td className="p-3">
                          {item.estado === "Agotado" || (item.stock ?? 0) <= 0 ? (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-200">
                              <AlertCircle className="w-3 h-3" /> Agotado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Disponible
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditarProducto(item)}
                              className="p-1.5 text-zajuna-purple hover:bg-purple-100 rounded-lg transition"
                              title="Editar producto"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEliminarProducto(item.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* PESTAÑA: PRODUCTORES */}
        {tab === "productores" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm h-fit">
              <h2 className="text-lg font-black text-stone-800 mb-1 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-zajuna-purple" />
                Registrar Campesino
              </h2>
              <p className="text-xs text-stone-500 mb-4">
                Solo el administrador puede autorizar productores en el sistema.
              </p>

              <form onSubmit={handleCrearProductor} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Don Jaime Pardo"
                    value={nuevoProd.nombre_completo}
                    onChange={(e) => setNuevoProd({ ...nuevoProd, nombre_completo: e.target.value })}
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5 outline-none focus:border-zajuna-purple"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 3201234567"
                    value={nuevoProd.telefono_whatsapp}
                    onChange={(e) => setNuevoProd({ ...nuevoProd, telefono_whatsapp: e.target.value })}
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5 outline-none focus:border-zajuna-purple"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Municipio *</label>
                    <input
                      type="text"
                      required
                      value={nuevoProd.municipio}
                      onChange={(e) => setNuevoProd({ ...nuevoProd, municipio: e.target.value })}
                      className="w-full text-xs border border-stone-300 rounded-xl p-2.5 outline-none focus:border-zajuna-purple"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Vereda *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: La Esmeralda"
                      value={nuevoProd.vereda}
                      onChange={(e) => setNuevoProd({ ...nuevoProd, vereda: e.target.value })}
                      className="w-full text-xs border border-stone-300 rounded-xl p-2.5 outline-none focus:border-zajuna-purple"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Asociación (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: AsoAgroBoyacá"
                    value={nuevoProd.asociacion}
                    onChange={(e) => setNuevoProd({ ...nuevoProd, asociacion: e.target.value })}
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5 outline-none focus:border-zajuna-purple"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-zajuna-purple hover:bg-zajuna-purpleLight text-white font-black py-2.5 rounded-xl shadow transition text-xs"
                >
                  Guardar Productor
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
              <h2 className="text-lg font-black text-stone-800 mb-4">Productores Autorizados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productores.map((prod) => (
                  <div key={prod.id} className="p-4 rounded-2xl border border-stone-100 bg-stone-50 flex items-start gap-3">
                    <div className="h-10 w-10 bg-zajuna-purple/10 rounded-xl flex items-center justify-center text-zajuna-purple flex-shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="flex-1 truncate">
                      <h3 className="font-bold text-stone-800 text-sm truncate">{prod.nombre_completo}</h3>
                      <p className="text-xs text-stone-500">{prod.vereda}, {prod.municipio}</p>
                      <p className="text-xs font-semibold text-zajuna-green mt-1">WA: +57 {prod.telefono_whatsapp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}