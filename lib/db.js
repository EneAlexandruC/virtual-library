const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'data', 'state.json');
fs.mkdirSync(path.dirname(dataPath), { recursive: true });

function readState(){
  try{
    const raw = fs.readFileSync(dataPath, 'utf8');
    if(!raw) return { books: [], borrows: [], admins: [] };
    return JSON.parse(raw);
  }catch(e){
    return { books: [], borrows: [], admins: [] };
  }
}
function writeState(state){
  fs.writeFileSync(dataPath, JSON.stringify(state, null, 2));
}

function getBooks(){
  const s = readState();
  return (s.books || []).slice().sort((a,b)=>b.id - a.id);
}
function addBook(title, author, extras){
  const meta = extras || {};
  const s = readState();
  s.books = s.books || [];
  const id = (s.books.reduce((m,b)=>Math.max(m,b.id||0), 0) || 0) + 1;
  const book = {
    id,
    title,
    author: author || null,
    available: 1,
    pdfPath: meta.pdfPath || null,
    pdfName: meta.pdfName || null,
    pdfType: meta.pdfType || null
  };
  s.books.push(book);
  writeState(s);
  return id;
}
function getBookById(id){
  const s = readState();
  return (s.books || []).find(b=>b.id == id) || null;
}
function updateBookAvailability(id, available){
  const s = readState();
  s.books = s.books || [];
  const b = s.books.find(x=>x.id == id);
  if(!b) return false;
  b.available = available ? 1 : 0;
  writeState(s);
  return true;
}
function attachBookPdf(id, pdfPath, pdfName, pdfType){
  const s = readState();
  s.books = s.books || [];
  const b = s.books.find(x=>x.id == id);
  if(!b) return false;
  b.pdfPath = pdfPath;
  b.pdfName = pdfName || null;
  b.pdfType = pdfType || null;
  writeState(s);
  return true;
}
function deleteBook(id){
  const s = readState();
  s.books = s.books || [];
  const before = s.books.length;
  s.books = s.books.filter(b => b.id != id);
  if(s.books.length === before) return false;
  writeState(s);
  return true;
}
function addBorrow(bookId, action){
  const s = readState();
  s.borrows = s.borrows || [];
  const id = (s.borrows.reduce((m,r)=>Math.max(m,r.id||0), 0) || 0) + 1;
  s.borrows.push({ id, book_id: bookId, action, at: new Date().toISOString() });
  writeState(s);
}
function createOrUpdateAdmin(email, password_hash){
  const s = readState();
  s.admins = s.admins || [];
  const existing = s.admins.find(a=>a.email === email);
  if(existing){ existing.password_hash = password_hash; }
  else {
    const id = (s.admins.reduce((m,a)=>Math.max(m,a.id||0),0) || 0) + 1;
    s.admins.push({ id, email, password_hash });
  }
  writeState(s);
}
function findAdminByEmail(email){
  const s = readState();
  s.admins = s.admins || [];
  return s.admins.find(a=>a.email === email) || null;
}

module.exports = {
  getBooks,
  addBook,
  getBookById,
  updateBookAvailability,
  attachBookPdf,
  deleteBook,
  addBorrow,
  createOrUpdateAdmin,
  findAdminByEmail,
  _readState: readState,
  _writeState: writeState
};