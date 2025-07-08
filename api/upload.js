// Teste básico primeiro - versão CommonJS
module.exports = async function handler(req, res) {
  try {
    console.log('Função executada');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Apenas POST permitido' });
    }

    return res.status(200).json({ 
      message: 'API funcionando!', 
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro na função:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
}