import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertTriangle } from 'lucide-react';

export default function Uploader({ onFileUpload, loading, error }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-4 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400'}`}
    >
      <input {...getInputProps()} />
      <UploadCloud className={`w-16 h-16 mx-auto mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
      
      {loading ? (
        <p className="text-xl font-semibold text-blue-600 animate-pulse">Analizando reporte en memoria...</p>
      ) : (
        <div>
          <p className="text-xl font-semibold mb-2">Arrastra tu archivo aquí o haz clic para seleccionar</p>
          <p className="text-sm text-gray-500">Soporta formatos .xls, .xlsx y .csv</p>
        </div>
      )}
      
      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-center gap-2">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}
    </div>
  );
}