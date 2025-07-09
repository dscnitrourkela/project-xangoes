/**
 * @description Test service to handle test/demo operations
 */
class TestService {
    /**
     * @description Create a new user (demo implementation)
     * @param userData - User data from request body
     * @returns Created user object
     */
    public createUser(userData: any) {
        return {
            user: {
                id: crypto.randomUUID(),
                ...userData,
                createdAt: new Date().toISOString(),
            },
        };
    }

    /**
     * @description Get paginated users (demo implementation)
     * @param page - Page number
     * @param limit - Items per page
     * @param search - Search term
     * @returns Users list with pagination
     */
    public getUsers(page: number = 1, limit: number = 10, search: string = "") {
        return {
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
        };
    }

    /**
     * @description Get user by ID (demo implementation)
     * @param id - User ID
     * @returns User object
     */
    public getUserById(id: string) {
        return {
            user: {
                id,
                name: "John Doe",
                email: "john@example.com",
                age: 25,
            },
        };
    }

    /**
     * @description Update user (demo implementation)
     * @param id - User ID
     * @param updateData - Data to update
     * @returns Updated user object
     */
    public updateUser(id: string, updateData: any) {
        return {
            user: {
                id,
                ...updateData,
                updatedAt: new Date().toISOString(),
            },
        };
    }

    /**
     * @description Get test endpoint information
     * @returns Test endpoint documentation
     */
    public getTestInfo() {
        return {
            message:
                "This is a test endpoint to showcase schema validation middleware",
            endpoints: {
                "POST /test/users": "Creates a user with body validation",
                "GET /test/users": "Gets users with query parameter validation",
                "GET /test/users/:id": "Gets user by ID with params validation",
                "PUT /test/users/:id":
                    "Updates user with both params and body validation",
            },
            schemas: {
                createUser:
                    "name (string, required), email (email, required), age (number, min 18, optional)",
                updateUser: "name (string, optional), email (email, optional)",
                getUserQuery:
                    "page (number, min 1, optional), limit (number, 1-100, optional), search (string, optional)",
                userParams: "id (UUID format, required)",
            },
        };
    }
}

export const testService = new TestService();
