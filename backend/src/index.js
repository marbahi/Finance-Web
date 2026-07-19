import 'express-async-errors'
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

const AUTH_USER = process.env.AUTH_USER || ''
const AUTH_PASS = process.env.AUTH_PASS || ''
if (AUTH_USER && AUTH_PASS) {
  app.use((req, res, next) => {
    const auth = req.headers.authorization
    if (!auth || !auth.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Finance Monitor"')
      return res.status(401).end()
    }
    const buf = Buffer.from(auth.slice(6), 'base64').toString()
    const [user, pass] = buf.split(':')
    if (user !== AUTH_USER || pass !== AUTH_PASS) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Finance Monitor"')
      return res.status(401).end()
    }
    next()
  })
}

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
