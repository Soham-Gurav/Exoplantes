"use client";

import { useState } from "react";

export default function ExoplanetForm() {
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

      // USER INPUTS
      koi_period: Number(form.orbital_period),
      koi_prad: Number(form.planet_radius),
      koi_depth: Number(form.transit_depth),
      koi_steff: Number(form.stellar_temp),

      // AUTO-FILL ALL OTHER REQUIRED FIELDS AS ZERO
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
;

      const data = await res.json();
      setResult(data.prediction || data.error);
    } catch (err) {
      setResult("Error connecting to backend.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 450, margin: "50px auto", color: "#fff" }}>
      <h1 style={{ textAlign: "center" }}>🔭 Exoplanet Classifier</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>

        <input
          type="number"
          placeholder="Orbital Period (days)"
          value={form.orbital_period}
          onChange={(e) => updateField("orbital_period", e.target.value)}
          className="input"
        />
        <input
          type="number"
          placeholder="Planet Radius (Earth Radii)"
          value={form.planet_radius}
          onChange={(e) => updateField("planet_radius", e.target.value)}
          className="input"
        />
        <input
          type="number"
          placeholder="Transit Depth (ppm)"
          value={form.transit_depth}
          onChange={(e) => updateField("transit_depth", e.target.value)}
          className="input"
        />
        <input
          type="number"
          placeholder="Stellar Temp (K)"
          value={form.stellar_temp}
          onChange={(e) => updateField("stellar_temp", e.target.value)}
          className="input"
        />
        <input
          type="number"
          placeholder="KOI Score (0–1)"
          value={form.koi_score}
          onChange={(e) => updateField("koi_score", e.target.value)}
          className="input"
        />

        <button
          onClick={submit}
          style={{
            padding: "12px",
            background: "#0ea5e9",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          {loading ? "Predicting..." : "Predict"}
        </button>
      </div>

      {result && (
        <div
          style={{
            marginTop: 20,
            fontSize: 20,
            textAlign: "center",
            fontWeight: 700,
            color: result.includes("Confirmed") ? "#4ade80" : "#f87171",
          }}
        >
          {result}
        </div>
      )}

      <style jsx>{`
        .input {
          padding: 12px;
          border-radius: 8px;
          background: #1e293b;
          color: white;
          border: 1px solid #334155;
        }
      `}</style>
    </div>
  );
}
