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