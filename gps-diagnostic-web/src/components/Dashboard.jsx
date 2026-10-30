import { AlertTriangle, CheckCircle, FileText, Download, BarChart2, PieChart as PieIcon, Activity, ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const SEVERITY_COLORS = {
  'Crítica': '#0f172a', 
  'Alta': '#06b6d4',    
  'Media': '#38bdf8',   
  'Baja': '#94a3b8'     
};
const FAULT_COLORS = ['#0f172a', '#06b6d4', '#0284c7', '#38bdf8', '#cbd5e1'];

export default function Dashboard({ reporte, onReset }) {
  const { vehiculo, resumenEjecutivo } = reporte.informeProfesional;
  const todasLasAlertas = reporte.detallesTecnicos.flatMap(hoja => hoja.alertas);

  const conteoSeveridad = todasLasAlertas.reduce((acc, alerta) => {
    acc[alerta.severidad] = (acc[alerta.severidad] || 0) + 1;
    return acc;
  }, {});
  const severidadData = Object.keys(conteoSeveridad).map(key => ({ name: key, value: conteoSeveridad[key] }));

  const conteoFallos = todasLasAlertas.reduce((acc, alerta) => {
    acc[alerta.errorDetectado] = (acc[alerta.errorDetectado] || 0) + 1;
    return acc;
  }, {});
  const fallosData = Object.keys(conteoFallos).map(key => ({ name: key, value: conteoFallos[key] }));

  const handleDownloadPDF = () => {
    // Abre la ventana de impresión nativa (el usuario puede seleccionar "Guardar como PDF")
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Controles Superiores: Agregamos "print:hidden" para que no salgan en el PDF */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-center bg-white/70 backdrop-blur-md p-4 rounded-3xl shadow-lg shadow-slate-200/50 border border-white">
        <button 
          onClick={onReset} 
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all px-4 py-2 rounded-full hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
          Nuevo Análisis
        </button>
        <button 
          onClick={handleDownloadPDF}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5"
        >
          <Download className="w-5 h-5" /> Exportar Informe
        </button>
      </div>

      <div id="reporte-pdf-container" className="space-y-8">
        
        {/* Fila 1: Tarjetas Ejecutivas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="group bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 hover:border-cyan-200 transition-all duration-300">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-6">
              <div className="bg-cyan-50 p-3 rounded-2xl text-cyan-500">
                <FileText className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">DATOS DEL VEHÍCULO</h2>
            </div>
            <ul className="space-y-4 text-slate-600 font-medium">
              <li className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                <span>Placas Vehiculares</span> 
                <span className="font-mono text-cyan-700 font-black bg-cyan-50 px-4 py-1.5 rounded-lg border border-cyan-100">{vehiculo.placas}</span>
              </li>
              <li className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                <span>Nombre Asignado</span> <span className="font-bold text-slate-900">{vehiculo.nombre}</span>
              </li>
              <li className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                <span>Grupo/Flota</span> <span className="font-bold text-slate-900">{vehiculo.grupo}</span>
              </li>
            </ul>
          </div>

          <div className="group bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 hover:border-cyan-200 transition-all duration-300 flex flex-col justify-between">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-6">
              <div className={`p-3 rounded-2xl ${resumenEjecutivo.nivelUrgencia.includes('ALTA') ? 'bg-red-50 text-red-500' : 'bg-cyan-50 text-cyan-500'}`}>
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">ESTADO GENERAL</h2>
            </div>
            
            <div className="flex justify-between items-end bg-slate-50/50 p-6 rounded-2xl border border-slate-50">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Urgencia</span>
                <span className={`text-xl sm:text-2xl font-black tracking-tight ${resumenEjecutivo.nivelUrgencia.includes('ALTA') ? 'text-red-500' : 'text-cyan-600'}`}>
                  {resumenEjecutivo.nivelUrgencia}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Incidencias</span>
                <span className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 drop-shadow-sm">
                  {resumenEjecutivo.totalIncidencias}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fila 2: Gráficos */}
        {todasLasAlertas.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100">
              <h3 className="font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                <div className="bg-slate-100 p-2 rounded-xl text-slate-600"><PieIcon className="w-5 h-5"/></div>
                DISTRIBUCIÓN DE SEVERIDAD
              </h3>
              <div style={{ minHeight: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={severidadData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8}>
                      {severidadData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#cbd5e1'} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip cursor={false} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 20px', fontWeight: 'bold' }}/>
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100">
              <h3 className="font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                <div className="bg-slate-100 p-2 rounded-xl text-slate-600"><BarChart2 className="w-5 h-5"/></div>
                FRECUENCIA DE FALLOS
              </h3>
              <div style={{ minHeight: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fallosData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 12, fill: '#334155', fontWeight: 700}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}/>
                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={28}>
                      {fallosData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={FAULT_COLORS[index % FAULT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Fila 3: Sugerencias */}
        {resumenEjecutivo.causasRaizSugeridas.length > 0 && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-2xl text-white">
            <h3 className="font-black mb-6 tracking-wide flex items-center gap-3 text-cyan-400">
              <CheckCircle className="w-6 h-6" /> RECOMENDACIONES TÉCNICAS
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumenEjecutivo.causasRaizSugeridas.map((causa, idx) => (
                <li key={idx} className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                  <span className="font-medium tracking-wide">{causa}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tablas Modulares */}
        {reporte.detallesTecnicos.map((hoja, idx) => (
          hoja.alertas.length > 0 && (
            <div key={idx} className="bg-white rounded-3xl shadow-xl overflow-hidden mt-8 break-inside-avoid border border-slate-100">
              <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-900 flex items-center gap-3 tracking-tight">
                  <div className="bg-white p-2 rounded-xl shadow-sm"><Activity className="w-5 h-5 text-cyan-500"/></div>
                  REGISTRO: {hoja.hojaAnalizada}
                </h3>
                <span className="bg-white px-4 py-1.5 rounded-full text-xs font-bold text-slate-500 shadow-sm border border-slate-100">
                  {hoja.alertas.length} alertas detectadas
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white text-slate-400">
                    <tr>
                      <th className="p-5 font-bold uppercase tracking-widest text-[11px]">Fila Excel</th>
                      <th className="p-5 font-bold uppercase tracking-widest text-[11px]">Fecha y Hora</th>
                      <th className="p-5 font-bold uppercase tracking-widest text-[11px]">Fallo Detectado</th>
                      <th className="p-5 font-bold uppercase tracking-widest text-[11px]">Severidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {hoja.alertas.map((alerta, i) => (
                      <tr key={i} className="hover:bg-cyan-50/50 transition-colors">
                        <td className="p-5 font-mono text-slate-400">{alerta.filaExcel}</td>
                        <td className="p-5 whitespace-nowrap text-slate-600 font-medium">{alerta.fechaYHora}</td>
                        <td className="p-5 font-bold text-slate-900">{alerta.errorDetectado}</td>
                        <td className="p-5">
                          <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase ${
                            alerta.severidad === 'Crítica' ? 'bg-slate-900 text-cyan-400' : 'bg-cyan-50 text-cyan-700'
                          }`}>
                            {alerta.severidad}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}