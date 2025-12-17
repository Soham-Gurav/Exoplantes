"use client";

import { useState } from "react";

const FEATURES = [
  "koi_period",
  "koi_prad",
  "koi_depth",
  "koi_steff",
  "koi_score",
];

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scatterX, setScatterX] = useState("koi_prad");
const [scatterY, setScatterY] = useState("koi_period");
const [scatterLoading, setScatterLoading] = useState(false);

const refreshScatter = async () => {
  if (!csvResult) return;

  setScatterLoading(true);

  const formData = new FormData();
  formData.append("x_feature", scatterX);
  formData.append("y_feature", scatterY);

  const res = await fetch("http://127.0.0.1:5000/update-scatter", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  // force reload image
  setCsvResult((prev: any) => ({
    ...prev,
    graphs: {
      ...prev.graphs,
      scatter: data.scatter + "?t=" + Date.now(),
    },
  }));

  setScatterLoading(false);
};


  const [csvResult, setCsvResult] = useState<any>(null);
  const [showBatch, setShowBatch] = useState(false);
  const [xFeature, setXFeature] = useState("koi_period");
  const [yFeature, setYFeature] = useState("koi_prad");

  const updateField = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  // ---------------- SINGLE PREDICTION ----------------
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

            // autofill remaining features
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

  // ---------------- CSV UPLOAD ----------------
  const uploadCSV = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("x_feature", xFeature);
    formData.append("y_feature", yFeature);

    const res = await fetch("http://127.0.0.1:5000/predict-csv", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setCsvResult(data);
    setShowBatch(true);
  };

  return (
    <div style={{ backgroundImage: "url('/media/main.png')" }} className="min-h-screen text-white">

      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* ================= HERO / PROJECT CARD ================= */}
        <section className="flex justify-between items-start p-12 rounded-2xl bg-black/50 border border-white/20">
          <div>
            <h1 className="text-7xl font-bold tracking-widest">EXOR</h1>

            <div className="mt-6 space-y-2 text-gray-300">
              <p>Accuracy: 95%</p>
              <p>Precision: 94%</p>
              <p>Recall: 95%</p>
              <p>F1 Score: 94.5%</p>
            </div>

            <p className="mt-6 text-white max-w-md">
              Our model is accurate, scalable, and works reliably on real Kepler mission data.
            </p>

            <div className="mt-6">
              <p>
                Check out the model
                <a
                  href="https://github.com/Soham-Gurav/Exoplantes.git"
                  target="_blank"
                  className="underline text-blue-400 ml-1"
                >
                  code
                </a>
              </p>
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-7xl font-bold">95%</h1>
            <p className="text-gray-400">Accuracy</p>
          </div>
        </section>

        {/* ================= PREDICTION MODEL ================= */}
        <section className="mt-20">
          <h1 className="text-4xl font-bold mb-10">Prediction Model</h1>

          <div className="flex flex-col gap-6">

            {/* BATCH CSV CARD */}
            <div
              className="p-6 rounded-xl bg-black/50 border border-white/20"
            >
              <h3 className="text-xl font-semibold mb-4">Batch CSV Prediction</h3>

              <div
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "18px",
                  padding: "20px",
                  maxWidth: "420px",
                }}
              >
                {/* File Input */}
                <div
                  style={{
                    background: "#d1d5db", // grey
                    borderRadius: "12px",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: "#000", fontSize: "14px" }}>
                    {selectedFile ? selectedFile.name : "Choose CSV file"}
                  </span>

                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      if (e.target.files) setSelectedFile(e.target.files[0]);
                    }}
                    style={{
                      opacity: 0,
                      position: "absolute",
                      width: "100%",
                      cursor: "pointer",
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  disabled={!selectedFile}
                  onClick={() => selectedFile && uploadCSV(selectedFile)}
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    padding: "12px",
                    background: "#ffffff",
                    color: "#000",
                    borderRadius: "12px",
                    fontWeight: 600,
                    opacity: selectedFile ? 1 : 0.5,
                    cursor: selectedFile ? "pointer" : "not-allowed",
                  }}
                >
                  Submit
                </button>
              </div>
            </div>

            {/* SINGLE PREDICTION CARD */}
            <div className="p-6 rounded-xl bg-black/50 border border-white/20">
              <h3 className="text-xl font-semibold mb-4">Single Prediction</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <input placeholder="Orbital Period" className="p-4 rounded-xl bg-black border border-white/30"
                  value={form.orbital_period} onChange={(e) => updateField("orbital_period", e.target.value)} />
                <input placeholder="Planet Radius" className="p-4 rounded-xl bg-black border border-white/30"
                  value={form.planet_radius} onChange={(e) => updateField("planet_radius", e.target.value)} />
                <input placeholder="Transit Depth" className="p-4 rounded-xl bg-black border border-white/30"
                  value={form.transit_depth} onChange={(e) => updateField("transit_depth", e.target.value)} />
                <input placeholder="Stellar Temp" className="p-4 rounded-xl bg-black border border-white/30"
                  value={form.stellar_temp} onChange={(e) => updateField("stellar_temp", e.target.value)} />
                <input placeholder="KOI Score" className="p-4 rounded-xl bg-black border border-white/30"
                  value={form.koi_score} onChange={(e) => updateField("koi_score", e.target.value)} />

                <button onClick={submit}
                  className="md:col-span-2 bg-white text-black font-bold py-4 rounded-xl">
                  {loading ? "Predicting..." : "Predict"}
                </button>
              </div>

              {result && (
                <p className="mt-4 text-center font-bold">
                  <span className={result.includes("Confirmed") ? "text-green-400" : "text-red-400"}>
                    {result}
                  </span>
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ================= BATCH OVERLAY ================= */}
      {showBatch && csvResult && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-black rounded-2xl w-[90%] h-[90%] p-8 overflow-y-auto relative">

            <button
              onClick={() => setShowBatch(false)}
              className="absolute top-4 right-4 text-xl"
            >
              ✕
            </button>

            <h1 className="text-4xl font-bold mb-6">BATCH PREDICTION</h1>

            <div className="flex gap-8">
              {/* LEFT */}
              <div className="w-1/2 space-y-6">
                <p>{csvResult.ai_summary}</p>

                <p>Total Rows: {csvResult?.summary?.total_rows}</p>
                <p>Confirmed Exoplanets: {csvResult?.summary?.confirmed_exoplanets}</p>

                <h3 className="font-bold">Top Candidates</h3>
                {csvResult.rank_list.map((r: any, i: number) => (
                  <p key={i}>{r.kepid} — {r.confidence}% — {r.exoplanet}</p>
                ))}  b
              </div>

              {/* RIGHT */}
              <div className="w-1/2 space-y-6">
                <img src={`http://127.0.0.1:5000${csvResult.graphs.distribution}`} />
                {/* SCATTER GRAPH */}
<img
  src={`http://127.0.0.1:5000${csvResult.graphs.scatter}`}
  className="rounded-xl"
/>

{/* CONTROLS */}
<div
  style={{
    marginTop: "16px",
    padding: "14px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "16px",
    display: "flex",
    gap: "12px",
    alignItems: "center",
  }}
>
  <select
    value={scatterX}
    onChange={(e) => setScatterX(e.target.value)}
    style={{
      background: "#000",
      color: "#fff",
      borderRadius: "12px",
      padding: "8px 12px",
      border: "1px solid rgba(255,255,255,0.2)",
    }}
  >
    {FEATURES.map((f) => (
      <option key={f} value={f}>{f}</option>
    ))}
  </select>

  <select
    value={scatterY}
    onChange={(e) => setScatterY(e.target.value)}
    style={{
      background: "#000",
      color: "#fff",
      borderRadius: "12px",
      padding: "8px 12px",
      border: "1px solid rgba(255,255,255,0.2)",
    }}
  >
    {FEATURES.map((f) => (
      <option key={f} value={f}>{f}</option>
    ))}
  </select>
</div>

<button
  onClick={refreshScatter}
  disabled={scatterLoading}
  style={{
    marginTop: "12px",
    width: "100%",
    padding: "10px",
    background: "#ffffff",
    color: "#000",
    borderRadius: "12px",
    fontWeight: 600,
    opacity: scatterLoading ? 0.6 : 1,
  }}
>
  {scatterLoading ? "Refreshing..." : "Refresh Graph"}
</button>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
