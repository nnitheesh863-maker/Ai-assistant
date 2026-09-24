import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserModel } from '../models/User.js';
import { DeviceService } from '../services/deviceService.js';
import { config } from '../config/env.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const existingUser = UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'An account with this email already exists.'
        });
      }

      const user = await UserModel.create({ name, email, password });
      
      // Auto-provision initial devices for seamless first-time experience
      const laptop = DeviceService.registerDirect({
        userId: user.id,
        name: 'My Windows Laptop',
        type: 'laptop',
        os: 'Windows 11',
        platform: 'desktop'
      });

      DeviceService.registerDirect({
        userId: user.id,
        name: 'My Android Phone',
        type: 'phone',
        os: 'Android 14',
        platform: 'mobile'
      });

      const token = jwt.sign({ id: user.id, email: user.email }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          user: { id: user.id, name: user.name, email: user.email },
          token,
          defaultLaptopToken: laptop.deviceToken,
          defaultLaptopId: laptop.deviceId
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.'
        });
      }

      const isMatch = await UserModel.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.'
        });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: { id: user.id, name: user.name, email: user.email },
          token
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
