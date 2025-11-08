const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Configurações do Supabase
const SUPABASE_URL = 'https://vyrznxwepwjsvirdqmhb.supabase.co/rest/v1/niveis';
const SUPABASE_APIKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cnpueHdlcHdqc3ZpcmRxbWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjI2NjksImV4cCI6MjA3ODAzODY2OX0.1EKPOozuxHWlhzYwhSNV90eSWUE6SVyMHPyjG3Rxzn4';
const SUPABASE_BEARER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cnpueHdlcHdqc3ZpcmRxbWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjI2NjksImV4cCI6MjA3ODAzODY2OX0.1EKPOozuxHWlhzYwhSNV90eSWUE6SVyMHPyjG3Rxzn4';

// Middleware
app.use(cors());
app.use(express.json());

// Rota para buscar os níveis mais recentes
app.get('/api/niveis', async (req, res) => {
  try {
    console.log('📊 Buscando dados do Supabase...');
    
    const response = await fetch(`${SUPABASE_URL}?order=created_at.desc&limit=20`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_APIKEY,
        'Authorization': `Bearer ${SUPABASE_BEARER}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erro Supabase:', response.status, data);
      throw new Error(`Erro ${response.status}: ${data.message || response.statusText}`);
    }

    console.log(`✅ ${data.length} registros retornados`);
    
    res.json({
      success: true,
      count: data.length,
      data: data
    });

  } catch (error) {
    console.error('❌ Erro completo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para obter apenas o nível mais recente
app.get('/api/niveis/latest', async (req, res) => {
  try {
    console.log('📊 Buscando último nível registrado...');
    
    const response = await fetch(`${SUPABASE_URL}?order=created_at.desc&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_APIKEY,
        'Authorization': `Bearer ${SUPABASE_BEARER}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.length > 0) {
      console.log(`✅ Nível atual: ${data[0].nivel}`);
      res.json({
        success: true,
        data: data[0]
      });
    } else {
      res.json({
        success: false,
        message: 'Nenhum dado encontrado'
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'GARS Backend rodando ♻️',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`\n♻️  GARS Backend rodando em http://localhost:${PORT}`);
  console.log(`📡 Conectado ao Supabase`);
  console.log(`\n🔗 Rotas disponíveis:`);
  console.log(`   GET /api/status`);
  console.log(`   GET /api/niveis`);
  console.log(`   GET /api/niveis/latest\n`);
});
