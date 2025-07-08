export default function handler(req, res) {
  try {
    console.log('Função executada - método:', req.method);
    
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    return res.status(200).json({ 
      message: 'API funcionando!', 
      method: req.method,
      timestamp: new Date().toISOString(),
      url: req.url
    });
    
  } catch (error) {
    console.error('Erro na função:', error);
    return res.status(500).json({ error: 'Erro interno', details: error.message });
  }
}