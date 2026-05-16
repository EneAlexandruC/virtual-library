const db = require('../../lib/db');

export default function handler(req,res){
  if(req.method === 'GET'){
    const rows = db.getBooks();
    res.status(200).json(rows);
  } else {
    res.status(405).json({error:'Method not allowed'});
  }
}
