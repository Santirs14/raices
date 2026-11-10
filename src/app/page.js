"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Phone, 
  MapPin, 
  Store, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  ShoppingBag, 
  ChevronRight,
  Eye,
  Mail
} from "lucide-react";
import Link from "next/link";

const imagenesCarrusel = [
  "/imagenes/uno.jpeg",
  "/imagenes/dos.jpeg",
  "/imagenes/tres.jpeg",
];

const imagenesCategorias = {
  1: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80",
  2: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80",
  3: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
  4: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
  5: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80",
};

export default function Inicio() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [indiceSlide, setIndiceSlide] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceSlide((prev) => (prev + 1) % imagenesCarrusel.length);
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, []);

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

  const productosPopulares = productos.filter((p) => p.destacado).slice(0, 3);
  const ultimosProductos = productos.slice(0, 6);

  return (
    <div className="w-full min-h-screen flex flex-col bg-stone-50">
      {/* NAVBAR: Solo "Catálogo de Productos" */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 px-6 py-3.5 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
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
                Las Quinchas · Boyacá
              </span>
            </div>
          </Link>

          {/* Menú de enlaces */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-stone-600">
            <Link 
              href="/catalogo" 
              className="relative py-1 hover:text-zajuna-purple transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-zajuna-green hover:after:w-full after:transition-all after:duration-300"
            >
              Catálogo de Productos
            </Link>
            <a 
              href="#categorias" 
              className="relative py-1 hover:text-zajuna-purple transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-zajuna-green hover:after:w-full after:transition-all after:duration-300"
            >
              Categorías
            </a>
            <a 
              href="#populares" 
              className="relative py-1 hover:text-zajuna-purple transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-zajuna-green hover:after:w-full after:transition-all after:duration-300"
            >
              Campañas
            </a>
            <a 
              href="#nosotros" 
              className="relative py-1 hover:text-zajuna-purple transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-zajuna-green hover:after:w-full after:transition-all after:duration-300"
            >
              Nosotros
            </a>
            <a 
              href="#contacto" 
              className="relative py-1 hover:text-zajuna-purple transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-zajuna-green hover:after:w-full after:transition-all after:duration-300"
            >
              Contacto
            </a>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-2 bg-zajuna-purple hover:bg-zajuna-purpleLight text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-zajuna-yellow" />
            Panel Administrativo
          </Link>
        </div>
      </nav>

      {/* HERO SECTION CARRUSEL */}
      <header className="relative h-[68vh] min-h-[500px] w-full overflow-hidden flex items-center justify-center bg-stone-950">
        {imagenesCarrusel.map((url, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === indiceSlide ? "opacity-60 scale-100" : "opacity-0 scale-105"
            } transform transition-transform duration-[6000ms]`}
          >
            <img src={url} alt={`Fondo campo ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-black/40 to-black/30 pointer-events-none"></div>

        <div className="relative z-10 glassmorphism p-8 md:p-12 rounded-3xl max-w-3xl mx-4 text-center text-white shadow-2xl">
          <div className="inline-block bg-zajuna-yellow text-zajuna-purple font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 shadow animate-pulse">
            Directo de la Finca Campesina
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-md leading-tight">
            Raíces del Occidente de Boyacá – Catálogo de Productos Campesinos
          </h1>
          <p className="text-base md:text-lg text-stone-100 font-medium drop-shadow leading-relaxed mb-6">
            Descubre y adquiere productos campesinos de nuestra región, directamente de quienes los producen.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 bg-zajuna-green hover:bg-zajuna-greenLight text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              Explorar Catálogo Completo
              <ArrowRight className="w-5 h-5 text-zajuna-yellow" />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-6 z-20 flex gap-2">
          {imagenesCarrusel.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setIndiceSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === indiceSlide ? "w-8 bg-zajuna-yellow" : "w-2.5 bg-white/50 hover:bg-white"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </header>

      {/* SECCIÓN 1: CATEGORÍAS */}
      <section id="categorias" className="max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-zajuna-purple uppercase tracking-wider bg-purple-100 px-3 py-1 rounded-full">
            Rubros Campesinos
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 mt-2">
            Explora por Categorías
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Haz clic en una categoría para descubrir las cosechas y alimentos disponibles
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.id}`}
              className="group relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-stone-200"
            >
              <img
                src={imagenesCategorias[cat.id] || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"}
                alt={cat.nombre}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zajuna-purple/95 via-zajuna-purple/40 to-transparent"></div>

              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                <span className="text-xs font-bold text-zajuna-yellow uppercase tracking-wider flex items-center gap-1 mb-1 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  Ver productos <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <h3 className="font-extrabold text-lg leading-snug drop-shadow-sm group-hover:text-zajuna-yellow transition-colors">
                  {cat.nombre}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2: PRODUCTOS POPULARES */}
      {productosPopulares.length > 0 && (
        <section id="populares" className="bg-stone-100 py-16 border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-zajuna-yellow/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-stone-900">
                    Productos Destacados de la Semana
                  </h2>
                  <p className="text-stone-500 text-xs">Cosechas con mayor disponibilidad y demanda local</p>
                </div>
              </div>
              <Link
                href="/catalogo"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-zajuna-purple hover:text-zajuna-green transition"
              >
                Ver todo en el catálogo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {productosPopulares.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
                >
                  <Link href={`/producto/${prod.id}`} className="relative h-56 w-full overflow-hidden bg-stone-200 block">
                    <img
                      src={prod.imagen_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"}
                      alt={prod.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-3 right-3 bg-zajuna-purple text-zajuna-yellow font-extrabold text-xs px-3 py-1.5 rounded-xl shadow">
                      ${Number(prod.precio).toLocaleString("es-CO")} / {prod.unidad_medida}
                    </span>
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/producto/${prod.id}`}>
                        <h3 className="font-extrabold text-lg text-stone-800 mb-1 group-hover:text-zajuna-purple transition-colors">
                          {prod.nombre}
                        </h3>
                      </Link>
                      <p className="text-stone-500 text-xs line-clamp-2 mb-4">
                        {prod.descripcion || "Cosechado bajo métodos agroecológicos tradicionales."}
                      </p>
                    </div>

                    <div className="border-t border-stone-100 pt-4 mt-auto">
                      <p className="text-xs font-bold text-stone-700 flex items-center gap-1.5 mb-1">
                        <Store className="w-3.5 h-3.5 text-zajuna-green" />
                        {prod.productores?.nombre_completo}
                      </p>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1.5 mb-4">
                        <MapPin className="w-3.5 h-3.5 text-zajuna-purple" />
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
                          <Phone className="w-3 h-3 text-zajuna-yellow" /> Contactar
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECCIÓN 3: ÚLTIMOS PRODUCTOS */}
      <section className="max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-xs font-bold text-zajuna-green uppercase tracking-wider bg-green-100 px-3 py-1 rounded-full">
              Economía Popular
            </span>
            <h2 className="text-3xl font-extrabold text-stone-900 mt-2">
              Últimos Productos Publicados
            </h2>
            <p className="text-stone-500 text-sm">
              Conoce las cosechas más recientes subidas por la administración
            </p>
          </div>

          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-zajuna-purple hover:bg-zajuna-purpleLight text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-all hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4 text-zajuna-yellow" />
            Ver Catálogo Completo
          </Link>
        </div>

        {cargando ? (
          <div className="py-20 text-center font-bold text-stone-400">Cargando cosechas campesinas...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ultimosProductos.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                <Link href={`/producto/${prod.id}`} className="relative h-48 w-full overflow-hidden bg-stone-100 block">
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
                        <Phone className="w-3 h-3 text-zajuna-yellow" /> Contactar
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-3 bg-white hover:bg-stone-50 border-2 border-zajuna-purple text-zajuna-purple font-extrabold px-8 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
          >
            Ir al Catálogo Completo y Filtrar
            <ArrowRight className="w-5 h-5 text-zajuna-green" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contacto" className="bg-stone-900 text-stone-300 mt-auto border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-white border border-stone-200 group-hover:scale-105 transition-transform">
                <img 
                  src="/imagenes/Raices.png" 
                  alt="Logo Raíces del Occidente de Boyacá" 
                  className="h-full w-full object-contain p-0.5"
                />
              </div>
              <div>
                <span className="font-black text-white text-base block leading-tight">
                  Raíces del Occidente
                </span>
                <span className="text-xs text-zajuna-green font-bold block uppercase tracking-wider">
                  Las Quinchas · Boyacá
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Iniciativa para el fortalecimiento de la economía popular y campesina en el Occidente de Boyacá. Conectamos la producción rural sin intermediarios.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-zajuna-yellow pl-2">
              Categorías
            </h4>
            <ul className="space-y-2 text-xs">
              {categorias.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/catalogo?categoria=${cat.id}`}
                    className="hover:text-zajuna-yellow transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-zajuna-green" />
                    {cat.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div id="nosotros">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-zajuna-green pl-2">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
              </li>
              <li>
                <Link href="/catalogo" className="hover:text-white transition-colors">Catálogo de Productos[cite: 34]</Link>
              </li>
              <li>
                <a href="#populares" className="hover:text-white transition-colors">Campañas y Destacados[cite: 34]</a>
              </li>
              <li>
                <Link href="/admin" className="text-zajuna-yellow hover:underline font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Acceso Administrativo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-zajuna-purpleLight pl-2">
              Sede e Información
            </h4>
            <div className="space-y-3 text-xs text-stone-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zajuna-yellow flex-shrink-0" />
                Puerto Boyacá / Occidente, Boyacá - Colombia
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zajuna-green flex-shrink-0" />
                contacto@raicesboyaca.gov.co
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 py-6 text-center text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Raíces del Occidente de Boyacá · Plataforma Institucional Zajuna Campo</p>
        </div>
      </footer>
    </div>
  );
}