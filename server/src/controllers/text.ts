import { Context } from 'hono';

import {
  sendCreated,
  sendSuccess,
} from '@/middlewares';

export const testController = {
    // Test body validation
    createUser: async (c: Context) => {
        const body = await c.req.json();
        return sendCreated(
            c,
            {
                user: {
                    id: crypto.randomUUID(),
                    ...body,
                    createdAt: new Date().toISOString(),
                },
            },
            "User created successfully"
        );
    },

    // Test query parameter validation
    getUsers: async (c: Context) => {
        const query = c.req.query();
        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 10;
        const search = query.search || "";

        return sendSuccess(
            c,
            {
                users: [
                    {
                        id: "123e4567-e89b-12d3-a456-426614174000",
                        name: "John Doe",
                        email: "john@example.com",
                        age: 25,
                    },
                ],
                pagination: {
                    page,
                    limit,
                    total: 1,
                    search,
                },
            },
            "Users retrieved successfully"
        );
    },

    // Test params validation
    getUserById: async (c: Context) => {
        const { id } = c.req.param();
        return sendSuccess(
            c,
            {
                user: {
                    id,
                    name: "John Doe",
                    email: "john@example.com",
                    age: 25,
                },
            },
            "User retrieved successfully"
        );
    },

    // Test body validation for updates
    updateUser: async (c: Context) => {
        const { id } = c.req.param();
        const body = await c.req.json();

        return sendSuccess(
            c,
            {
                user: {
                    id,
                    ...body,
                    updatedAt: new Date().toISOString(),
                },
            },
            "User updated successfully"
        );
    },

    // Simple endpoint without validation
    getTestInfo: async (c: Context) => {
        return sendSuccess(
            c,
            {
                message:
                    "This is a test endpoint to showcase schema validation middleware",
                endpoints: {
                    "POST /test/users": "Creates a user with body validation",
                    "GET /test/users":
                        "Gets users with query parameter validation",
                    "GET /test/users/:id":
                        "Gets user by ID with params validation",
                    "PUT /test/users/:id":
                        "Updates user with both params and body validation",
                },
                schemas: {
                    createUser:
                        "name (string, required), email (email, required), age (number, min 18, optional)",
                    updateUser:
                        "name (string, optional), email (email, optional)",
                    getUserQuery:
                        "page (number, min 1, optional), limit (number, 1-100, optional), search (string, optional)",
                    userParams: "id (UUID format, required)",
                },
            },
            "Test endpoint information"
        );
    },
};
