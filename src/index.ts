import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
}

let books: Book[] = [];
let nextId = 1;

// POST /api/add/book
app.post('/api/add/book', (req, res) => {
  const { title, author, year } = req.body;
  if(!title || !author || !year) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  books.push({ id: nextId++, title, author, year });
  res.json({ message: 'Book added successfully' });
  res.status(201);
});

// PUT /api/update/book/:id
app.put('/api/update/book/:id', (req, res) => {
  const id = Number(req.params.id);
  const bookIndex = books.findIndex(b => b.id === id);
  if (bookIndex === -1) {
    return res.status(404).send({ message: 'Book not found' });
  }
  const { title, author, year } = req.body;
  if(!title || !author || !year) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  books[bookIndex] = { id, title, author, year };
  res.json({ message: 'Book updated successfully' });
});

// DELETE /api/delete/book/:id
app.delete('/api/delete/book/:id', (req, res) => {
  const id = Number(req.params.id);
  const bookIndex = books.findIndex(b => b.id === id);
  if (bookIndex === -1) {
    return res.status(404).send({ message: 'Book not found' });
  }
  books.splice(bookIndex, 1);
  res.json({ message: 'Book deleted successfully' });
}); 


// GET /api/books
app.get('/api/books', (req, res)=>{
  res.json(books);
});

// GET /api/books/:id
app.get('/api/books/:id', (req, res)=>{
  const id = Number(req.params.id)
  const book = books.find(b => b.id === id)
  if (book) {
    res.json(book);
  }
  else {
    res.status(404).send({message: 'Book not found'})
  }
});

// Test endpoint
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});