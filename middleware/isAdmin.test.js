const isAdmin = require('./isAdmin');
const userDAO = require('../dao/user');

jest.mock('../dao/user');

describe('isAdmin middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            userId: 'testUserId'
        };
        res = {
            status: jest.fn(() => res),
            send: jest.fn()
        };
        next = jest.fn();
    });

    test('should return 401 if user is not found', async () => {
        userDAO.getUserById.mockResolvedValue(null);

        await isAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Unauthorized. User not found.');
        expect(next).not.toHaveBeenCalled();
    });

    test('should return 403 if user is not an admin', async () => {
        userDAO.getUserById.mockResolvedValue({ roles: ['user'] });

        await isAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('Unauthorized. User is not an admin.');
        expect(next).not.toHaveBeenCalled();
    });

    test('should call next if user is an admin', async () => {
        userDAO.getUserById.mockResolvedValue({ roles: ['admin'] });

        await isAdmin(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.send).not.toHaveBeenCalled();
    });

    test('should handle errors', async () => {
        const error = new Error('Test error');
        userDAO.getUserById.mockRejectedValue(error);

        await isAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Internal server error');
        expect(next).not.toHaveBeenCalled();
    });
});
