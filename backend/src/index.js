import 'express-async-errors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import express from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth.js';
import walletsRouter from './routes/wallets.js';
import categoriesRouter from './routes/categories.js';
import transactionsRouter from './routes/transactions.js';
import budgetsRouter from './routes/budgets.js';
import debtsRouter from './routes/debts.js';
import goalsRouter from './routes/goals.js';
import recurringRouter from './routes/recurring.js';
import templatesRouter from './routes/templates.js';
import authRouter from './routes/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

app.use('/api/wallets', authenticate, walletsRouter);
app.use('/api/categories', authenticate, categoriesRouter);
app.use('/api/transactions', authenticate, transactionsRouter);
app.use('/api/budgets', authenticate, budgetsRouter);
app.use('/api/debts', authenticate, debtsRouter);
app.use('/api/goals', authenticate, goalsRouter);
app.use('/api/recurring', authenticate, recurringRouter);
app.use('/api/templates', authenticate, templatesRouter);

const frontendDist = join(__dirname, '../../frontend/dist')
app.use(express.static(frontendDist))
app.get('*', (req, res) => {
  res.sendFile(join(frontendDist, 'index.html'))
})

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

export default app
