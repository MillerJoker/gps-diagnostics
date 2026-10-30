import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rulesPath = path.join(__dirname, '../config/rules.json');
const rulesJSON = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));

const motorDeReglas = rulesJSON.reglas_diagnostico.map(regla => ({
    ...regla,
    evaluar: new Function('row', `return ${regla.condicion};`)
}));

const sanitizarFila = (row) => {
    const rowClean = { ...row };
    
    if (rowClean['Bateria Vehiculo'] && typeof rowClean['Bateria Vehiculo'] === 'string') {
        const valClean = rowClean['Bateria Vehiculo'].replace('V', '').trim();
        rowClean['Bateria Vehiculo_Num'] = valClean === '-' || valClean === '' ? null : Number(valClean);
    }

    const campoVoltaje = rowClean['Bateria Vehiculo'] || rowClean['Voltaje Bateria'] || rowClean['Bateria'];
    
    if (campoVoltaje && typeof campoVoltaje === 'string') {
        const valClean = campoVoltaje.replace('V', '').trim();
        const num = parseFloat(valClean);
        rowClean['Voltaje_Parseado'] = (valClean === '-' || valClean === '' || isNaN(num)) ? 0 : num;
    } else {
        rowClean['Voltaje_Parseado'] = Number(campoVoltaje) || 0;
    }

    return rowClean;
};

export const processReport = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Por favor, adjunta un archivo de reporte." });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        
        let informacionVehiculo = {};

        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            if (sheetName.toLowerCase().includes('informaci')) {
                const rawInfo = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
                rawInfo.forEach(fila => {
                    if (fila.length >= 2 && fila[0] && fila[1]) {
                        informacionVehiculo[fila[0].trim()] = fila[1];
                    }
                });
            }
        });

        const nombreDispositivo = (informacionVehiculo['Nombre'] || '').toLowerCase();
        const esCandado = nombreDispositivo.includes('candado') || nombreDispositivo.includes('can');

        const reglasAplicables = motorDeReglas.filter(regla => {
            if (regla.exclusivoCandado && !esCandado) {
                return false; // Si es un vehículo normal, ignoramos las reglas de candado
            }
            return true;
        });

        const diagnosticoPorHoja = [];
        const todasLasAlertas = [];

        //Procesamos las hojas de Recorrido de manera limpia
        workbook.SheetNames.forEach(sheetName => {
            if (sheetName.toLowerCase().includes('informaci')) return; // Saltamos la de info

            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet, { defval: null });
            if (data.length === 0) return;

            const alertasDeHoja = [];
            let registrosEvaluados = 0;

            data.forEach((row, index) => {
                const filaExcel = index + 2; 
                registrosEvaluados++;

                const rowSanitizada = sanitizarFila(row);

                reglasAplicables.forEach(regla => {
                    try {
                        if (regla.evaluar(rowSanitizada)) {
                            const alerta = {
                                filaExcel: filaExcel,
                                fechaYHora: `${row['Fecha'] || 'N/A'} ${row['Hora'] || 'N/A'}`,
                                errorDetectado: regla.nombre,
                                severidad: regla.severidad,
                                sugerencia: regla.sugerencia
                            };
                            alertasDeHoja.push(alerta);
                            todasLasAlertas.push(alerta);
                        }
                    } catch (err) {}
                });
            });

            diagnosticoPorHoja.push({
                hojaAnalizada: sheetName,
                totalRegistrosEvaluados: registrosEvaluados,
                incidenciasEncontradas: alertasDeHoja.length,
                alertas: alertasDeHoja
            });
        });

        // Evaluar Nivel de Urgencia basado en la severidad máxima encontrada
        let nivelUrgencia = "NINGUNA - Vehículo Óptimo";
        const severidadesEncontradas = todasLasAlertas.map(a => a.severidad.toLowerCase());

        if (severidadesEncontradas.includes('crítica')) {
            nivelUrgencia = "ALTA / INMEDIATA (Riesgo de pérdida de rastreo)";
        } else if (severidadesEncontradas.includes('alta')) {
            nivelUrgencia = "MEDIA (Programar chequeo preventivo)";
        } else if (severidadesEncontradas.includes('media') || severidadesEncontradas.includes('baja')) {
            nivelUrgencia = "BAJA (Revisión de rutina)";
        }

        const causasRaiz = [...new Set(todasLasAlertas.map(a => a.sugerencia))];

        return res.json({
            estado: "Diagnóstico completado",
            informeProfesional: {
                vehiculo: {
                    nombre: informacionVehiculo['Nombre'] || "Desconocido",
                    placas: informacionVehiculo['Placas'] || "Desconocidas",
                    grupo: informacionVehiculo['Grupo'] || "N/A",
                    detallesTecnicos: informacionVehiculo
                },
                resumenEjecutivo: {
                    totalIncidencias: todasLasAlertas.length,
                    nivelUrgencia: nivelUrgencia,
                    causasRaizSugeridas: causasRaiz
                }
            },
            detallesTecnicos: diagnosticoPorHoja
        });

    } catch (error) {
        console.error("Error procesando el archivo:", error);
        return res.status(500).json({ error: "Error interno al procesar el diagnóstico." });
    }
};