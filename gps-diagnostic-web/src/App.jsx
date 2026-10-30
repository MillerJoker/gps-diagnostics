import { useState } from 'react';
import axios from 'axios';
import { Activity } from 'lucide-react';
import Uploader from './components/Uploader.jsx';
import Dashboard from './components/Dashboard';

function App() {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3000/api/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReporte(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 max-w-5xl mx-auto font-sans text-gray-800">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-900 flex items-center justify-center gap-2">
          <Activity className="w-8 h-8" />
          Diagnóstico Telemétrico GPS
        </h1>
        <p className="text-gray-500 mt-2">Sube el reporte de recorrido para analizar fallos de hardware</p>
      </header>

      {!reporte ? (
        <Uploader 
          onFileUpload={handleFileUpload} 
          loading={loading} 
          error={error} 
        />
      ) : (
        <Dashboard 
          reporte={reporte} 
          onReset={() => setReporte(null)} 
        />
      )}
    </div>
  );
}

export default App;