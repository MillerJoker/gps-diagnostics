import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportRoutes from './routes/reporte_routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT||3000;

app.use(cors());
app.use(express.json());

app.get('api/status', (req, res) =>{
    res.json({message: 'API de diagnóstico operativa'});
});

app.use('/api/reports', reportRoutes);

app.listen(PORT, ()=>{
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});