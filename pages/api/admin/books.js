const db = require('../../../lib/db');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '30mb'
    }
  }
};

function verify(req){
  const cookie = req.headers.cookie || '';
  const m = cookie.match(/\btoken=([^;]+)/);
  if(!m) return null;
  try{
    return jwt.verify(m[1], process.env.ADMIN_SECRET || 'dev_secret');
  }catch(e){return null}
}

function safeFileName(name){
  return String(name || 'book.pdf')
    .trim()
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function savePdfFile(bookId, pdfData, pdfName){
  if (typeof pdfData !== 'string' || !pdfData) {
    throw new Error('PDF data is required.');
  }

  const buffer = Buffer.from(pdfData, 'base64');
  if (!buffer.length || buffer.toString('utf8', 0, 4) !== '%PDF') {
    throw new Error('Uploaded file must be a valid PDF.');
  }

  if (buffer.length > 25 * 1024 * 1024) {
    throw new Error('PDF must be 25 MB or smaller.');
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'books');
  fs.mkdirSync(uploadDir, { recursive: true });

  const fileName = `${bookId}-${safeFileName(pdfName || 'book.pdf')}`;
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/books/${fileName}`;
}

export default function handler(req,res){
  const claim = verify(req);
  if(!claim) return res.status(401).json({error:'unauth'});
  if(req.method === 'POST'){
    const { title, author, pdfData, pdfName, pdfType } = req.body;
    if(!title) return res.status(400).json({error:'title required'});

    if (pdfData && pdfType !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF uploads are supported.' });
    }

    const id = db.addBook(title, author || null);

    try {
      if (pdfData) {
        const pdfPath = savePdfFile(id, pdfData, pdfName);
        db.attachBookPdf(id, pdfPath, pdfName || null, pdfType || 'application/pdf');
      }
    } catch (error) {
      db.deleteBook(id);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ id });
  } else {
    res.status(405).end();
  }
}
