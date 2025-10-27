import React, { useState, useEffect, useCallback, useMemo } from 'react';

// This array must match the features used by the trained model (41 features)
// We only make the first few editable and use a default value (0.0) for the rest for simplicity.
const ALL_FEATURE_NAMES = [
    'koi_fpflag_nt', 'koi_fpflag_ss', 'koi_fpflag_co', 'koi_fpflag_ec',
    'koi_period', 'koi_period_err1', 'koi_period_err2', 'koi_time0bk',
    'koi_time0bk_err1', 'koi_time0bk_err2', 'koi_impact', 'koi_impact_err1',
    'koi_impact_err2', 'koi_duration', 'koi_duration_err1', 'koi_duration_err2',
    'koi_depth', 'koi_depth_err1', 'koi_depth_err2', 'koi_prad',
    'koi_prad_err1', 'koi_prad_err2', 'koi_teq', 'koi_insol',
    'koi_insol_err1', 'koi_insol_err2', 'koi_model_snr', 'koi_tce_plnt_num',
    'koi_steff', 'koi_steff_err1', 'koi_steff_err2', 'koi_slogg',
    'koi_slogg_err1', 'koi_slogg_err2', 'koi_srad', 'koi_srad_err1',
    'koi_srad_err2', 'ra', 'dec', 'koi_kepmag', 'koi_score'
];

// Define which features the user can actually edit in the UI
const EDITABLE_FEATURES = [
    { name: 'koi_period', label: 'Orbital Period (days)', defaultValue: 9.488 },
    { name: 'koi_prad', label: 'Planet Radius (Earth Radii)', defaultValue: 2.26 },
    { name: 'koi_depth', label: 'Transit Depth (ppm)', defaultValue: 616.2 },
    { name: 'koi_steff', label: 'Stellar Temp (K)', defaultValue: 5455 },
    { name: 'koi_score', label: 'KOI Score (0-1)', defaultValue: 1.0 },
];

// Initial state for editable inputs
const initialInputs = EDITABLE_FEATURES.reduce((acc, feat) => {
    acc[feat.name] = feat.defaultValue;
    return acc;
}, {});


// Main React Component
const App = () => {
    const [inputs, setInputs] = useState(initialInputs);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to handle input changes
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        // Ensure the value is treated as a float
        setInputs(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0.0
        }));
    }, []);

    // Function to construct the complete 41-feature dictionary
    const constructFullFeatures = useMemo(() => {
        // Start with the default value (0.0) for all features
        let fullFeatures = ALL_FEATURE_NAMES.reduce((acc, name) => {
            // Use 1.0 for the flag features by default, as 0.0 might bias the prediction heavily
            // For example, if 'koi_fpflag_nt' (not transit) is 0, it means it IS a transit.
            acc[name] = 0.0;
            return acc;
        }, {});

        // Override with user inputs
        Object.keys(inputs).forEach(name => {
            if (inputs[name] !== undefined) {
                fullFeatures[name] = inputs[name];
            }
        });

        return fullFeatures;
    }, [inputs]);

    // Function to call the prediction API
    const predict = async () => {
        setLoading(true);
        setPrediction(null);
        setError(null);
        
        const payload = {
            features: constructFullFeatures
        };

        try {
            const res = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "An unknown error occurred during prediction.");
            } else {
                setPrediction(data);
            }
        } catch (e) {
            setError("Failed to connect to the prediction API.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            <script src="https://cdn.tailwindcss.com"></script>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            
            <div className="w-full max-w-lg bg-gray-800 rounded-xl shadow-2xl p-6 md:p-10 mt-10">
                <h1 className="text-3xl font-extrabold mb-2 text-cyan-400">
                    <span className="text-4xl">🔭</span> Exoplanet Classifier
                </h1>
                <p className="text-gray-400 mb-8">
                    Model expects 41 features. Edit key inputs below; the rest are set to default values.
                </p>

                {/* Input Fields */}
                <div className="grid grid-cols-1 gap-4">
                    {EDITABLE_FEATURES.map((feat) => (
                        <div key={feat.name} className="flex flex-col items-start">
                            <label className="text-sm font-medium text-gray-300 mb-1">{feat.label}</label>
                            <input
                                type="number"
                                name={feat.name}
                                value={inputs[feat.name]}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-150"
                                step="any"
                            />
                        </div>
                    ))}
                </div>
                
                <button
                    onClick={predict}
                    disabled={loading}
                    className="w-full mt-8 py-3 rounded-lg font-bold text-lg transition duration-300 
                                bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 
                                disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/50"
                >
                    {loading ? 'Classifying...' : 'Classify Exoplanet'}
                </button>

                {/* Result Display */}
                <div className="mt-8 p-4 bg-gray-700 rounded-lg min-h-[100px] flex flex-col justify-center items-center">
                    {loading && <div className="text-cyan-400">Loading...</div>}
                    
                    {error && (
                        <div className="text-red-400 font-semibold">
                            Error: {error}
                        </div>
                    )}
                    
                    {prediction && (
                        <div className="text-center">
                            <p className="text-xl font-bold mb-2">Prediction Result:</p>
                            <p className={`text-3xl font-extrabold ${prediction.prediction.includes('CONFIRMED') ? 'text-green-400' : 'text-yellow-400'}`}>
                                {prediction.prediction}
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                                Confidence: {prediction.confidence}
                            </p>
                            
                            <p className="mt-4 text-xs text-gray-500">
                                Total features sent to API: {Object.keys(constructFullFeatures).length}
                            </p>
                        </div>
                    )}
                    
                    {!loading && !error && !prediction && (
                        <p className="text-gray-400">Enter features and click 'Classify' to begin.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
