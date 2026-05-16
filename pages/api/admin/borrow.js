const db = require('../../../lib/db');
const jwt = require('jsonwebtoken');

function verify(req){
  const cookie = req.headers.cookie || '';
  const m = cookie.match(/\btoken=([^;]+)/);
  if(!m) return null;
  try{
    return jwt.verify(m[1], process.env.ADMIN_SECRET || 'dev_secret');
  }catch(e){return null}
}

export default function handler(req,res){
  const claim = verify(req);
  if(!claim) return res.status(401).json({error:'unauth'});
  if(req.method === 'POST'){
    const { bookId, action } = req.body;
    if(!bookId || !action) return res.status(400).json({error:'bad request'});
    const book = db.getBookById(bookId);
    if(!book) return res.status(404).json({error:'not found'});
    if(action === 'borrow' && book.available){
      db.updateBookAvailability(bookId, false);
      db.addBorrow(bookId, 'borrow');
      return res.status(200).json({ok:true});
    }
    if(action === 'return' && !book.available){
      db.updateBookAvailability(bookId, true);
      db.addBorrow(bookId, 'return');
      return res.status(200).json({ok:true});
    }
    return res.status(400).json({error:'invalid action/state'});
  }
  res.status(405).end();
}
