import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const userCollection = db.getCollection('users');

export const UserModel = {
  findById(id) {
    return userCollection.findOne((u) => u.id === id);
  },

  findByEmail(email) {
    return userCollection.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async create({ name, email, password }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    return userCollection.insert(newUser);
  },

  async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }
};
