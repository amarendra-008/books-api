import { Router, Response } from 'express';
import pool from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - year
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               year:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, author, year } = req.body;
    const userId = req.user?.userId;

    if (!title || !author || !year) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO books (title, author, year, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, author, year, userId]
    );

    res
      .status(201)
      .json({ message: 'Book added successfully', book: result.rows[0] });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all books
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        books.id,
        books.title,
        books.author,
        books.year,
        books.created_at,
        books.updated_at,
        users.id AS owner_id,
        users.username AS owner_username
      FROM books
      JOIN users ON books.user_id = users.id
      ORDER BY books.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/books/my:
 *   get:
 *     summary: Get current user's books
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's books
 *       401:
 *         description: Unauthorized
 */
router.get('/my', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const result = await pool.query(
      'SELECT * FROM books WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user books:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Book details
 *       404:
 *         description: Book not found
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book (owner only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Book not found
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;
    const { title, author, year } = req.body;

    if (!title || !author || !year) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const bookCheck = await pool.query(
      'SELECT user_id FROM books WHERE id = $1',
      [id]
    );

    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (bookCheck.rows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this book' });
    }

    const result = await pool.query(
      'UPDATE books SET title = $1, author = $2, year = $3 WHERE id = $4 RETURNING *',
      [title, author, year, id]
    );

    res.json({ message: 'Book updated successfully', book: result.rows[0] });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book (owner only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Book not found
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;

    const bookCheck = await pool.query(
      'SELECT user_id FROM books WHERE id = $1',
      [id]
    );

    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (bookCheck.rows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this book' });
    }

    const result = await pool.query(
      'DELETE FROM books WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({ message: 'Book deleted successfully', book: result.rows[0] });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
