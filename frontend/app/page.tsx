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

  const [csvResult, setCsvResult] = useState<any>(null);
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

            // AUTO-FILL REMAINING FEATURES
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
  };

  return (
    <div style={{ backgroundImage: "url('/media/main.png')" }}>
      <div className="max-w-6xl mx-auto px-6 pb-20">

        {/* FORM SECTION */}
        <section className="mt-20 p-10 rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-6">Exoplanet Prediction Model</h2>

          {/* SINGLE INPUT */}
          <div className="grid md:grid-cols-2 gap-6">
            <input type="number" placeholder="Orbital Period"
              value={form.orbital_period}
              onChange={(e) => updateField("orbital_period", e.target.value)}
              className="p-4 rounded-xl bg-black text-white border border-white/30"
            />
            <input type="number" placeholder="Planet Radius"
              value={form.planet_radius}
              onChange={(e) => updateField("planet_radius", e.target.value)}
              className="p-4 rounded-xl bg-black text-white border border-white/30"
            />
            <input type="number" placeholder="Transit Depth"
              value={form.transit_depth}
              onChange={(e) => updateField("transit_depth", e.target.value)}
              className="p-4 rounded-xl bg-black text-white border border-white/30"
            />
            <input type="number" placeholder="Stellar Temp"
              value={form.stellar_temp}
              onChange={(e) => updateField("stellar_temp", e.target.value)}
              className="p-4 rounded-xl bg-black text-white border border-white/30"
            />
            <input type="number" placeholder="KOI Score"
              value={form.koi_score}
              onChange={(e) => updateField("koi_score", e.target.value)}
              className="p-4 rounded-xl bg-black text-white border border-white/30"
            />

            <button onClick={submit}
              className="md:col-span-2 bg-white text-black font-bold py-4 rounded-xl">
              {loading ? "Predicting..." : "Predict"}
            </button>
          </div>

          {/* RESULT */}
          {result && (
            <p className="mt-6 text-xl font-bold text-center">
              <span className={result.includes("Confirmed") ? "text-green-400" : "text-red-400"}>
                {result}
              </span>
            </p>
          )}

          {/* CSV UPLOAD */}
          <hr className="my-8 border-white/20" />

          <h3 className="text-xl font-bold mb-4">Batch CSV Prediction</h3>

          {/* DROPDOWNS */}
          <div className="flex gap-4 mb-4">
            <select value={xFeature} onChange={(e) => setXFeature(e.target.value)}>
              {FEATURES.map(f => <option key={f}>{f}</option>)}
            </select>
            <select value={yFeature} onChange={(e) => setYFeature(e.target.value)}>
              {FEATURES.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>

          <input
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files && uploadCSV(e.target.files[0])}
          />

          {/* CSV RESULTS */}
          {csvResult && (
            <div className="mt-8">
              <h4 className="font-bold">Summary</h4>
              <p>Total Rows: {csvResult.summary.total_rows}</p>
              <p>Confirmed: {csvResult.summary.confirmed_exoplanets}</p>
              <p>Not Exoplanets: {csvResult.summary.not_exoplanets}</p>

              {/* RANK LIST */}
              <h4 className="font-bold mt-6">Top Candidates</h4>
              <table>
                <thead>
                  <tr>
                    <th>Kepler ID</th>
                    <th>Confidence (%)</th>
                    <th>Exoplanet</th>
                  </tr>
                </thead>
                <tbody>
                  {csvResult.rank_list.map((r: any, i: number) => (
                    <tr key={i}>
                      <td>{r.kepid}</td>
                      <td>{r.confidence}</td>
                      <td style={{ color: r.exoplanet === "Yes" ? "lightgreen" : "red" }}>
                        {r.exoplanet}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* GRAPHS */}
              <div className="mt-6">
                <img src={`http://127.0.0.1:5000${csvResult.graphs.distribution}`} />
                <img src={`http://127.0.0.1:5000${csvResult.graphs.scatter}`} />
              </div>

              {/* METRICS */}
              <div className="mt-6">
                <h4 className="font-bold">Model Performance</h4>
                <p>Accuracy: {csvResult.metrics.accuracy}</p>
                <p>Precision: {csvResult.metrics.precision}</p>
                <p>Recall: {csvResult.metrics.recall}</p>
                <p>F1 Score: {csvResult.metrics.f1_score}</p>
                <pre>{JSON.stringify(csvResult.metrics.confusion_matrix)}</pre>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
