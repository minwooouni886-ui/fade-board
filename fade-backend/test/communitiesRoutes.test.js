import { describe, expect, test, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import app from '../src/app.js'

const app = express();

vi.mock(import('../src/db.js'), () => ({
    default: { query: vi.fn() }
}))

import db from '../src/db.js'

beforeEach(() => {
    vi.resetAllMocks()
})

describe('GET /communities', () => {
    test('Returns status code 200 and rows from db', async () => {
        const fakeRows = [{id: 1, name: 'Test Jackson'}]
        db.query.mockResolvedValueOnce({ rows: fakeRows})

        const res = await request(app).get('/communities')

        expect(res.status).toBe(200)
        expect(res.body).toEqual(fakeRows)                   
    })

    test('Returns status code 500 with error message', async () => {
        db.query.mockRejectedValueOnce(new Error('db down'))

        const res = await request(app).get('/communities')

        expect(res.status).toBe(500)
        expect(res.body).toEqual({ error: "500 Internal Server Error"})
    })
})
describe('POST /communities', () => {
    test('Rejects a name longer than 40 characters without touching the db', async () => {
        const res = await request(app).post('/communities').send({ name: 'x'.repeat(41) })

        expect(res.status).toBe(400)
        expect(res.body).toEqual({ error: 'Community name must be 40 characters or fewer' })
        expect(db.query).not.toHaveBeenCalled()
    })

    test('Accepts a name of exactly 40 characters', async () => {
        const created = { id: 1, name: 'x'.repeat(40) }
        db.query.mockResolvedValueOnce({ rows: [created] })

        const res = await request(app).post('/communities').send({ name: 'x'.repeat(40) })

        expect(res.status).toBe(201)
        expect(res.body).toEqual(created)
    })
})
