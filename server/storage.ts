import { type UserProfile, type InsertUserProfile } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<UserProfile | undefined>;
  getUserByEmail(email: string): Promise<UserProfile | undefined>;
  createUser(user: InsertUserProfile): Promise<UserProfile>;
}

export class MemStorage implements IStorage {
  private users: Map<string, UserProfile>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<UserProfile | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<UserProfile | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUserProfile): Promise<UserProfile> {
    const id = randomUUID();
    const now = new Date();
    const user: UserProfile = { 
      ...insertUser, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
