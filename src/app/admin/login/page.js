"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setCargando(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Credenciales no válidas o usuario administrativo no autorizado.");
      setCargando(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200 max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="h-16 w-16 bg-zajuna-purple rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg text-zajuna-yellow">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-zajuna-purple">Acceso Administrativo</h2>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mt-1">
            Las Quinchas · Raíces del Occidente
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-3 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@raices.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-zajuna-purple focus:ring-2 focus:ring-zajuna-purple/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-3 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-zajuna-purple focus:ring-2 focus:ring-zajuna-purple/20 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-zajuna-green hover:bg-zajuna-greenLight text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm mt-2"
          >
            {cargando ? "Validando..." : "Ingresar al Panel"}
            <ArrowRight className="w-4 h-4 text-zajuna-yellow" />
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-zajuna-purple hover:underline font-bold">
            ← Volver al Catálogo Público
          </Link>
        </div>
      </div>
    </div>
  );
}