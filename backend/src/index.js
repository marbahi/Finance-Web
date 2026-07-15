import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import express from 'express';
import cors from 'cors';
import walletsRouter from './routes/wallets.js';
import categoriesRouter from './routes/categories.js';
import transactionsRouter from './routes/transactions.js';
import budgetsRouter from './routes/budgets.js';
import debtsRouter from './routes/debts.js';
import goalsRouter from './routes/goals.js';
import recurringRouter from './routes/recurring.js';
import templatesRouter from './routes/templates.js';

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/wallets', walletsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/debts', debtsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/recurring', recurringRouter);
app.use('/api/templates', templatesRouter);

const frontendDist = join(__dirname, '../../frontend/dist')
app.use(express.static(frontendDist))
app.get('*', (req, res) => {
  res.sendFile(join(frontendDist, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
