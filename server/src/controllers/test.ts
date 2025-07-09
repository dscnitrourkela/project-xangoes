import { Context } from 'hono';

import {
  sendCreated,
  sendSuccess,
} from '@/middlewares';
import { testService } from '@/services/test.service';

const {
    createUser: createUserService,
    getUsers: getUsersService,
    getUserById: getUserByIdService,
    updateUser: updateUserService,
    getTestInfo: getTestInfoService,
} = testService;

export const testController = {
    // Test body validation
    createUser: async (c: Context) => {
        const body = await c.req.json();
        const result = createUserService(body);
        return sendCreated(c, result, "User created successfully");
    },

    // Test query parameter validation
    getUsers: async (c: Context) => {
        const query = c.req.query();
        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 10;
        const search = query.search || "";

        const result = getUsersService(page, limit, search);
        return sendSuccess(c, result, "Users retrieved successfully");
    },

    // Test params validation
    getUserById: async (c: Context) => {
        const { id } = c.req.param();
        const result = getUserByIdService(id);
        return sendSuccess(c, result, "User retrieved successfully");
    },

    // Test body validation for updates
    updateUser: async (c: Context) => {
        const { id } = c.req.param();
        const body = await c.req.json();

        const result = updateUserService(id, body);
        return sendSuccess(c, result, "User updated successfully");
    },

    // Simple endpoint without validation
    getTestInfo: async (c: Context) => {
        const result = getTestInfoService();
        return sendSuccess(c, result, "Test endpoint information");
    },
};
