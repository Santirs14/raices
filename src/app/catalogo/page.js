"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Phone, MapPin, Store, ShieldCheck, ArrowLeft, Search, Eye } from "lucide-react";
import Link from "next/link";

function ContenidoCatalogo() {
  const searchParams = useSearchParams();
  const catInicial = searchParams.get("categoria") || "todas";

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(catInicial);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (searchParams.get("categoria")) {
      setCategoriaSeleccionada(searchParams.get("categoria"));
    }
  }, [searchParams]);

  async function cargarDatos() {
    setCargando(true);
    const { data: catData } = await supabase.from("categorias").select("*");
    if (catData) setCategorias(catData);

    const { data: prodData } = await supabase
      .from("productos")
      .select(`
        *,
        productores (nombre_completo, telefono_whatsapp, vereda, municipio)
      `)
      .order("created_at", { ascending: false });

    if (prodData) setProductos(prodData);
    setCargando(false);
  }

  const productosFiltrados = productos.filter((prod) => {
    const coincideCat =
      categoriaSeleccionada === "todas" ||
      prod.categoria_id === Number(categoriaSeleccionada);
    const coincideTexto =
      prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      prod.productores?.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      prod.productores?.vereda.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCat && coincideTexto;
  });

  return (
    <div className="w-full min-h-screen flex flex-col bg-stone-50">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-white border border-stone-200 group-hover:scale-105 transition-transform">
              <img 
                src="/imagenes/Raices.png" 
                alt="Logo Raíces del Occidente de Boyacá" 
                className="h-full w-full object-contain p-0.5"
              />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-zajuna-purple block leading-tight">
                Raíces del Occidente
              </span>
              <span className="text-[10px] font-bold text-zajuna-green block tracking-wider uppercase">
                Catálogo Campesino Completo
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-zajuna-purple transition px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Inicio
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 bg-zajuna-purple hover:bg-zajuna-purpleLight text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all hover:scale-105"
            >
              <ShieldCheck className="w-4 h-4 text-zajuna-yellow" />
              Panel Administrativo
            </Link>
          </div>
        </div>
      </nav>

      {/* CABECERA Y FILTROS */}
      <div className="bg-zajuna-purple text-white py-12 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            Catálogo Oficial de Cosechas
          </h1>
          <p className="text-sm text-zajuna-yellow font-medium max-w-xl">
            Explora todos los productos registrados por la administración para los campesinos de la región.
          </p>

          <div className="mt-6 max-w-md relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por producto, campesino o vereda..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-stone-800 text-sm outline-none focus:ring-2 focus:ring-zajuna-yellow shadow"
            />
          </div>
        </div>
      </div>

      {/* BOTONES CATEGORÍA */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setCategoriaSeleccionada("todas")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
            categoriaSeleccionada === "todas"
              ? "bg-zajuna-green text-white"
              : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          Todos los Rubros ({productos.length})
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaSeleccionada(String(cat.id))}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
              categoriaSeleccionada === String(cat.id)
                ? "bg-zajuna-green text-white"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* GRILLA PRODUCTOS */}
      <main className="max-w-7xl mx-auto px-4 pb-16 w-full flex-1">
        {cargando ? (
          <div className="py-24 text-center font-bold text-stone-400">Cargando catálogo...</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-stone-300 p-8">
            <Store className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-bold text-stone-700">No se encontraron productos coincidentes</h3>
            <p className="text-stone-400 text-sm">Prueba seleccionando otra categoría o limpiando la búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                <Link href={`/producto/${prod.id}`} className="relative h-52 w-full overflow-hidden bg-stone-100 block">
                  <img
                    src={prod.imagen_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"}
                    alt={prod.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 bg-zajuna-purple text-zajuna-yellow font-extrabold text-xs px-3 py-1.5 rounded-full shadow">
                    ${Number(prod.precio).toLocaleString("es-CO")} / {prod.unidad_medida}
                  </span>
                </Link>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/producto/${prod.id}`}>
                      <h3 className="text-base font-bold text-stone-800 leading-snug mb-1 group-hover:text-zajuna-purple transition-colors">
                        {prod.nombre}
                      </h3>
                    </Link>
                    <p className="text-stone-500 text-xs line-clamp-2 mb-4">
                      {prod.descripcion || "Producto fresco cosechado localmente."}
                    </p>
                  </div>

                  <div className="border-t border-stone-100 pt-3 mt-auto">
                    <p className="text-xs font-bold text-stone-700 truncate mb-1">
                      {prod.productores?.nombre_completo}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate mb-3">
                      {prod.productores?.vereda}, {prod.productores?.municipio}
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/producto/${prod.id}`}
                        className="flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2 rounded-xl text-xs transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver Detalle
                      </Link>
                      <a
                        href={`https://wa.me/57${prod.productores?.telefono_whatsapp}?text=${encodeURIComponent(
                          `Hola Don/Doña ${prod.productores?.nombre_completo}, vi su producto "${prod.nombre}" en Raíces del Occidente de Boyacá.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 bg-zajuna-green hover:bg-zajuna-greenLight text-white font-bold py-2 rounded-xl text-xs shadow transition"
                      >
                        <Phone className="w-3 h-3 text-zajuna-yellow" /> WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold">Cargando catálogo...</div>}>
      <ContenidoCatalogo />
    </Suspense>
  );
}