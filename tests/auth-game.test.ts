import request from 'supertest';
import express from 'express';
import session from 'express-session';
import { beforeAll, test, expect } from 'vitest';

let app: express.Express;
let agent: request.SuperAgentTest;
const users: Record<string, any> = {};
const verificationCodes: Record<string, string> = {};
const gameSaves: Record<string, any> = {};

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use(
    session({ secret: 'test-secret', resave: false, saveUninitialized: false })
  );

  app.post('/api/auth/register', (req, res) => {
    const { hackerName, email, password } = req.body;
    if (!hackerName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (users[email]) return res.status(409).json({ error: 'exists' });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[email] = code;
    users[email] = { id: email, hackerName, email, password, verified: false };
    res.json({ message: 'ok', success: true, requiresVerification: true });
  });

  app.post('/api/auth/verify', (req, res) => {
    const { email, code } = req.body;
    if (verificationCodes[email] !== code) {
      return res.status(400).json({ error: 'bad code' });
    }
    users[email].verified = true;
    req.session.userId = email;
    res.json({ user: { id: email, hackerName: users[email].hackerName, email } });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users[email];
    if (!user || user.password !== password || !user.verified) {
      return res.status(401).json({ error: 'invalid' });
    }
    req.session.userId = email;
    res.json({ user: { id: email, hackerName: user.hackerName, email } });
  });

  app.post('/api/game/save', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'auth' });
    const userId = req.session.userId as string;
    const state = { credits: 1000, ...(req.body.gameState || {}) };
    gameSaves[userId] = state;
    res.json({ userId, ...state });
  });

  app.get('/api/game/load/:gameMode?', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'auth' });
    const state = gameSaves[req.session.userId as string];
    if (!state) return res.status(404).json({ error: 'not found' });
    res.json(state);
  });

  agent = request.agent(app);
});

test('register and verify user', async () => {
  const email = 'testuser@example.com';
  const password = 'password123';
  const hackerName = 'TestHacker';

  const regRes = await agent
    .post('/api/auth/register')
    .send({ hackerName, email, password });
  expect(regRes.status).toBe(200);

  const code = verificationCodes[email];

  const verifyRes = await agent.post('/api/auth/verify').send({ email, code });
  expect(verifyRes.status).toBe(200);
  expect(verifyRes.body.user.hackerName).toBe(hackerName);
});

test('login and save/load game state', async () => {
  const email = 'testuser@example.com';
  const password = 'password123';

  const loginAgent = request.agent(app);
  const loginRes = await loginAgent.post('/api/auth/login').send({ email, password });
  expect(loginRes.status).toBe(200);

  const saveRes = await loginAgent
    .post('/api/game/save')
    .send({ gameState: { credits: 2000, currentMission: 1 } });
  expect(saveRes.status).toBe(200);

  const loadRes = await loginAgent.get('/api/game/load');
  expect(loadRes.status).toBe(200);
  expect(loadRes.body.credits).toBe(2000);
});
