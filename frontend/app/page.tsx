"use client";

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    orbital_period: "",
    planet_radius: "",
    transit_depth: "",
    stellar_temp: "",
    koi_score: "",
  });

  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateField = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features: {
            koi_score: Number(form.koi_score),
            koi_period: Number(form.orbital_period),
            koi_prad: Number(form.planet_radius),
            koi_depth: Number(form.transit_depth),
            koi_steff: Number(form.stellar_temp),

            // AUTO-FILL
            koi_fpflag_nt: 0,
            koi_fpflag_ss: 0,
            koi_fpflag_co: 0,
            koi_fpflag_ec: 0,
            koi_period_err1: 0,
            koi_period_err2: 0,
            koi_time0bk: 0,
            koi_time0bk_err1: 0,
            koi_time0bk_err2: 0,
            koi_impact: 0,
            koi_impact_err1: 0,
            koi_impact_err2: 0,
            koi_duration: 0,
            koi_duration_err1: 0,
            koi_duration_err2: 0,
            koi_depth_err1: 0,
            koi_depth_err2: 0,
            koi_prad_err1: 0,
            koi_prad_err2: 0,
            koi_teq: 0,
            koi_insol: 0,
            koi_insol_err1: 0,
            koi_insol_err2: 0,
            koi_model_snr: 0,
            koi_tce_plnt_num: 0,
            koi_steff_err1: 0,
            koi_steff_err2: 0,
            koi_slogg: 0,
            koi_slogg_err1: 0,
            koi_slogg_err2: 0,
            koi_srad: 0,
            koi_srad_err1: 0,
            koi_srad_err2: 0,
            ra: 0,
            dec: 0,
            koi_kepmag: 0,
          },
        }),
      });

      const data = await res.json();
      setResult(data.prediction || data.error);
    } catch {
      setResult("Error connecting to backend.");
    }

    setLoading(false);
  };

  return (
    <div style={{ backgroundImage: "url('/media/main.png')" }}>
      <div className="max-w-6xl mx-auto px-6 pb-20" >

        {/* HERO SECTION */}
        <section className=" grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-center md:text-left"
        >


          <div>
            <p className="text-gray-300 mt-30 text-lg leading-relaxed">
              Explore worlds beyond our solar system with our Machine Learning model.
              Using 41 astrophysical parameters from NASA’s Kepler mission,
              our system predicts whether a signal corresponds to a real exoplanet.
            </p>
          </div>

        </section>

        {/* FORM SECTION */}
        <section
          className="mt-20 p-10 rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl"
          style={{
            background:
              "linear-gradient(180deg,rgba(94, 94, 94, 0.25) 10%, rgba(255, 255, 255, 0) 100%)",
          }}
        >
          <h2 className="text-3xl font-bold mb-6">Exoplanet Prediction Model</h2>

          <div className="grid md:grid-cols-2 gap-6">

            <input
              type="number"
              placeholder="Orbital Period (koi_period)"
              value={form.orbital_period}
              onChange={(e) => updateField("orbital_period", e.target.value)}
              className="p-4 rounded-xl bg-black text-white border border-white/30"
            />

            <input
              type="number"
              placeholder="Planet Radius (koi_prad)"
              value={form.planet_radius}
              onChange={(e) => updateField("planet_radius", e.target.value)}
              className="p-4 rounded-xl bg-black text-white border border-white/30"
            />

            <input
              type="number"
              placeholder="Transit Depth (koi_depth)"
              value={form.transit_depth}
              onChange={(e) => updateField("transit_depth", e.target.value)}
              className="p-4 rounded-xl bg-black text-white border border-white/30"
            />

            <input
              type="number"
              placeholder="Stellar Temp (koi_steff)"
              value={form.stellar_temp}
              onChange={(e) => updateField("stellar_temp", e.target.value)}
              className="p-4 rounded-xl bg-black text-white border border-white/30"
            />

            <input
              type="number"
              placeholder="KOI Score (koi_score)"
              value={form.koi_score}
              onChange={(e) => updateField("koi_score", e.target.value)}
              className="p-4 rounded-xl bg-black text-white border border-white/30"
            />

            <button
              onClick={submit}
              className="md:col-span-2 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition"
            >
              {loading ? "Predicting..." : "Predict"}
            </button>

          </div>

          {result && (
            <p className="mt-8 text-xl font-bold text-center">
              <span className={result.includes("Confirmed") ? "text-green-400" : "text-red-400"}>
                {result}
              </span>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
