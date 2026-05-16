const db = require('../../../lib/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export default function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  const row = db.findAdminByEmail(email);
  if(!row) return res.status(401).json({error:'Invalid'});
  if(!bcrypt.compareSync(password, row.password_hash)) return res.status(401).json({error:'Invalid'});
  const token = jwt.sign({adminId: row.id}, process.env.ADMIN_SECRET || 'dev_secret', {expiresIn:'8h'});
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${8*3600}`);
  res.status(200).json({ok:true});
}
