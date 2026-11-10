"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Phone, 
  MapPin, 
  Store, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  ChevronRight,
  PackageCheck
} from "lucide-react";
import Link from "next/link";

export default function DetalleProducto() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [producto, setProducto] = useState(null);
  const [categoria, setCategoria] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (productId) {
      cargarDetalle();
    }
  }, [productId]);

  async function cargarDetalle() {
    setCargando(true);
    const { data: prodData, error } = await supabase
      .from("productos")
      .select(`
        *,
        productores (nombre_completo, telefono_whatsapp, vereda, municipio, asociacion),
        categorias (id, nombre)
      `)
      .eq("id", productId)
      .single();

    if (error || !prodData) {
      router.push("/catalogo");
      return;
    }

    setProducto(prodData);
    setCategoria(prodData.categorias);
    setCargando(false);
  }

  function handleCompartir() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-zajuna-purple border-t-zajuna-yellow rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-extrabold text-stone-600 text-sm">Cargando producto campesino...</p>
        </div>
      </div>
    );
  }

  if (!producto) return null;

  const estaAgotado = producto.estado === "Agotado" || producto.stock <= 0;
  const precioUnitario = Number(producto.precio);
  const precioTotal = precioUnitario * cantidad;

  const mensajeWhatsApp = encodeURIComponent(
    `¡Hola Don/Doña ${producto.productores?.nombre_completo}! Vi su producto "${producto.nombre}" en Raíces del Occidente de Boyacá.\n\n` +
    `🛒 Cantidad deseada: ${cantidad} ${producto.unidad_medida}(s)\n` +
    `💰 Total estimado: $${precioTotal.toLocaleString("es-CO")} COP\n\n` +
    `¿Tiene disponibilidad para coordinar la entrega en ${producto.productores?.municipio}?`
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-100">
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
                Zajuna Campo · Boyacá
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/catalogo"
              className="text-xs font-bold text-stone-600 hover:text-zajuna-purple transition"
            >
              Catálogo de Productos
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

      {/* MIGA DE PAN */}
      <div className="max-w-7xl mx-auto w-full px-4 py-4 text-xs font-semibold text-stone-500 flex items-center gap-2">
        <Link href="/" className="hover:text-zajuna-purple">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/catalogo" className="hover:text-zajuna-purple">Catálogo</Link>
        {categoria && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/catalogo?categoria=${categoria.id}`} className="hover:text-zajuna-purple">
              {categoria.nombre}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-800 font-bold truncate">{producto.nombre}</span>
      </div>

      {/* CONTENEDOR PRINCIPAL ESTILO MERCADO LIBRE */}
      <main className="max-w-7xl mx-auto w-full px-4 pb-16 flex-1">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* COLUMNA IZQUIERDA: FOTO GRANDE DEL PRODUCTO (7 de 12) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative w-full h-[420px] sm:h-[500px] bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 flex items-center justify-center group">
              <img
                src={producto.imagen_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"}
                alt={producto.nombre}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {producto.destacado && (
                <span className="absolute top-4 left-4 bg-zajuna-yellow text-zajuna-purple font-black text-xs px-3.5 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                  Producto Destacado
                </span>
              )}
            </div>

            {/* Ficha Informativa y Descripción */}
            <div className="mt-8 border-t border-stone-100 pt-6">
              <h3 className="text-lg font-black text-stone-900 mb-3">Descripción del Producto</h3>
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                {producto.descripcion || "Este producto campesino es obtenido directamente de parcelas tradicionales del Occidente de Boyacá, cumpliendo con buenas prácticas agropecuarias sin químicos agresivos."}
              </p>

              {/* Ficha Técnica */}
              <div className="mt-6 bg-stone-50 rounded-2xl p-4 border border-stone-200/80">
                <h4 className="text-xs font-black text-stone-700 uppercase tracking-wider mb-3">
                  Detalles de Comercialización
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-stone-400 block font-medium">Unidad de Venta</span>
                    <span className="font-bold text-stone-800">{producto.unidad_medida}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-medium">Procedencia</span>
                    <span className="font-bold text-stone-800">{producto.productores?.municipio}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-medium">Vereda</span>
                    <span className="font-bold text-stone-800">{producto.productores?.vereda}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: PANEL DE COMPRA / COTIZACIÓN (5 de 12) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="border border-stone-200 rounded-2xl p-6 bg-white shadow-sm">
              {/* Categoría y Compartir */}
              <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                <span>Nuevo · Cosecha Directa</span>
                <button
                  onClick={handleCompartir}
                  className="flex items-center gap-1 text-stone-500 hover:text-zajuna-purple font-semibold transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copiado ? "¡Enlace copiado!" : "Compartir"}
                </button>
              </div>

              {/* Título */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight mb-3">
                {producto.nombre}
              </h1>

              {/* Precio */}
              <div className="mb-4">
                <span className="text-3xl sm:text-4xl font-black text-zajuna-purple">
                  ${precioUnitario.toLocaleString("es-CO")}
                </span>
                <span className="text-sm font-bold text-stone-500 ml-2">
                  COP por {producto.unidad_medida}
                </span>
              </div>

              {/* Disponibilidad / Stock */}
              <div className="mb-6">
                {estaAgotado ? (
                  <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-200">
                    <AlertCircle className="w-4 h-4" />
                    Producto Agotado temporalmente
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Stock Disponible: {producto.stock} {producto.unidad_medida}(s)
                  </div>
                )}
              </div>

              {/* Selector de Cantidades (Si está disponible) */}
              {!estaAgotado && (
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-stone-700">Cantidad a solicitar:</label>
                    <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                        className="px-3 py-1 text-stone-600 hover:bg-stone-100 font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 text-xs font-black text-stone-800">
                        {cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCantidad((prev) => Math.min(producto.stock, prev + 1))}
                        className="px-3 py-1 text-stone-600 hover:bg-stone-100 font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-200/80 text-xs">
                    <span className="text-stone-500 font-semibold">Subtotal estimado:</span>
                    <span className="text-base font-extrabold text-zajuna-green">
                      ${precioTotal.toLocaleString("es-CO")} COP
                    </span>
                  </div>
                </div>
              )}

              {/* Botón WhatsApp de Compra Directa */}
              {estaAgotado ? (
                <button
                  disabled
                  className="w-full bg-stone-300 text-stone-500 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  No Disponible para Compra
                </button>
              ) : (
                <a
                  href={`https://wa.me/57${producto.productores?.telefono_whatsapp}?text=${mensajeWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-zajuna-green hover:bg-zajuna-greenLight text-white font-extrabold py-3.5 rounded-xl text-sm shadow-md transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <Phone className="w-4 h-4 text-zajuna-yellow" />
                  Comprar con el Productor (WhatsApp)
                </a>
              )}

              {/* Beneficios Institucionales */}
              <div className="mt-6 space-y-3 text-xs text-stone-500 border-t border-stone-100 pt-4">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-zajuna-green flex-shrink-0" />
                  <span>Entrega acordada directamente con el campesino o en punto de acopio local.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-zajuna-purple flex-shrink-0" />
                  <span>Sin intermediarios: 100% del pago va a la familia campesina.</span>
                </div>
              </div>
            </div>

            {/* Ficha del Productor que lo vende */}
            <div className="mt-6 border border-stone-200 rounded-2xl p-5 bg-stone-50 flex items-start gap-3.5">
              <div className="h-11 w-11 bg-zajuna-purple text-zajuna-yellow rounded-xl flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-zajuna-purple block">Productor Verificado</span>
                <h4 className="font-extrabold text-stone-800 text-sm">
                  {producto.productores?.nombre_completo}
                </h4>
                <p className="text-stone-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {producto.productores?.vereda}, {producto.productores?.municipio}
                </p>
                {producto.productores?.asociacion && (
                  <span className="inline-block mt-1 text-[11px] font-semibold text-zajuna-green">
                    Asociación: {producto.productores.asociacion}
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}