import request from 'supertest';
import express from 'express';
import session from 'express-session';
import csurf from 'csurf';
import { beforeAll, test, expect } from 'vitest';

let app: express.Express;
let agent: request.SuperAgentTest;
const users: Record<string, any> = {};

const isAuthenticated: express.RequestHandler = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: 'auth' });
};

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use(session({ secret: 'test-secret', resave: false, saveUninitialized: false }));
  app.use(csurf());

  app.get('/api/csrf', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users[email];
    if (!user || user.password !== password) return res.status(401).json({ error: 'invalid' });
    req.session.userId = email;
    res.json({ user: { id: email } });
  });

  app.post('/api/missions/generate', isAuthenticated, (_req, res) => {
    res.json({ mission: true });
  });

  users['a@b.c'] = { password: 'p' };

  agent = request.agent(app);
});

test('login and generate mission with CSRF token', async () => {
  const tokenRes = await agent.get('/api/csrf');
  const token = tokenRes.body.csrfToken;
  expect(token).toBeTruthy();

  const loginRes = await agent
    .post('/api/auth/login')
    .set('x-csrf-token', token)
    .send({ email: 'a@b.c', password: 'p' });
  expect(loginRes.status).toBe(200);

  const newTokenRes = await agent.get('/api/csrf');
  const token2 = newTokenRes.body.csrfToken;
  const missionRes = await agent
    .post('/api/missions/generate')
    .set('x-csrf-token', token2)
    .send({});
  expect(missionRes.status).toBe(200);
  expect(missionRes.body.mission).toBe(true);
});
