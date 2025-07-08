import axios from 'axios';
import FormData from 'form-data';

export default async function handler(req, res) {
  console.log('Request received');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { base64File, filename, mimeType } = req.body;
    console.log({ base64File, filename, mimeType });

    if (!base64File || !filename || !mimeType) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const buffer = Buffer.from(base64File, 'base64');
    console.log('Buffer created:', buffer.length);

    // Verifique variáveis de ambiente
    console.log('PHONE_NUMBER_ID:', process.env.PHONE_NUMBER_ID);
    console.log('WHATSAPP_TOKEN:', process.env.WHATSAPP_TOKEN ? 'Token set' : 'Token missing');

    const form = new FormData();
    form.append('file', buffer, { filename, contentType: mimeType });
    form.append('type', mimeType);
    form.append('messaging_product', 'whatsapp');

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/media`,
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          ...form.getHeaders(),
        },
      }
    );

    res.status(200).json({ media_id: response.data.id });
  } catch (err) {
    console.error('Error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Upload failed' });
  }
}
