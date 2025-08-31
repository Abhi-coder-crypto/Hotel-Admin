import { randomUUID } from "crypto";
export class MemStorage {
    users;
    serviceRequests;
    constructor() {
        this.users = new Map();
        this.serviceRequests = new Map();
    }
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        return Array.from(this.users.values()).find((user) => user.username === username);
    }
    async createUser(insertUser) {
        const id = randomUUID();
        const user = { ...insertUser, id };
        this.users.set(id, user);
        return user;
    }
    async createServiceRequest(insertRequest) {
        const id = randomUUID();
        const serviceRequest = {
            ...insertRequest,
            id,
            notes: insertRequest.notes || null,
            createdAt: new Date()
        };
        this.serviceRequests.set(id, serviceRequest);
        return serviceRequest;
    }
    async getServiceRequests() {
        return Array.from(this.serviceRequests.values());
    }
}
export const storage = new MemStorage();
