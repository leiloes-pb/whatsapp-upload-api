import axios from 'axios';
import FormData from 'form-data';

export default async function handler(req, res) {
  try {
    console.log('Função executada - método:', req.method);
    
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Endpoint de teste para GET
    if (req.method === 'GET') {
      return res.status(200).json({ 
        message: 'WhatsApp Upload API funcionando!', 
        method: req.method,
        timestamp: new Date().toISOString(),
        endpoints: {
          upload: 'POST /api/upload',
          test: 'GET /api/upload'
        }
      });
    }
    
    // Processar upload
    if (req.method === 'POST') {
      const { base64File, filename, mimeType } = req.body;
      
      console.log('Dados recebidos:', {
        filename,
        mimeType,
        base64Length: base64File?.length || 0
      });

      // Validar parâmetros
      if (!base64File || !filename || !mimeType) {
        return res.status(400).json({ 
          error: 'Parâmetros obrigatórios ausentes',
          required: ['base64File', 'filename', 'mimeType']
        });
      }

      // Validar variáveis de ambiente
      if (!process.env.PHONE_NUMBER_ID || !process.env.WHATSAPP_TOKEN) {
        console.error('Variáveis de ambiente ausentes');
        return res.status(500).json({ 
          error: 'Configuração do servidor incompleta',
          missing: {
            PHONE_NUMBER_ID: !process.env.PHONE_NUMBER_ID,
            WHATSAPP_TOKEN: !process.env.WHATSAPP_TOKEN
          }
        });
      }

      // Converter base64 para buffer
      const buffer = Buffer.from(base64File, 'base64');
      console.log('Buffer criado:', buffer.length, 'bytes');

      // Preparar FormData
      const form = new FormData();
      form.append('file', buffer, { filename, contentType: mimeType });
      form.append('type', mimeType);
      form.append('messaging_product', 'whatsapp');

      console.log('Enviando para WhatsApp API...');
      
      // Fazer upload para WhatsApp
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/media`,
        form,
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            ...form.getHeaders(),
          },
          timeout: 30000, // 30 segundos
        }
      );

      console.log('Upload realizado com sucesso:', response.data);
      
      return res.status(200).json({ 
        success: true,
        media_id: response.data.id,
        filename: filename,
        size: buffer.length,
        mimeType: mimeType,
        timestamp: new Date().toISOString()
      });
    }

    // Método não permitido
    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    console.error('Erro na função:', error);
    
    // Tratar erros específicos do WhatsApp
    if (error.response) {
      const statusCode = error.response.status;
      const errorData = error.response.data;
      
      console.error('Erro da API do WhatsApp:', {
        status: statusCode,
        data: errorData
      });
      
      return res.status(statusCode).json({
        error: 'Erro na API do WhatsApp',
        details: errorData.error?.message || 'Erro desconhecido',
        code: errorData.error?.code,
        whatsapp_error: errorData
      });
    }
    
    // Erro genérico
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}