import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security Middleware
app.use(helmet()); // Sets secure HTTP headers

// Rate Limiting (Prevent abuse / DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { error: "Too many requests, please try again later." }
});
app.use('/api', limiter);

// Standard Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit payload size to prevent payload overflow attacks
// Removed mongoSanitize() due to Node.js 20+ compatibility TypeError

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

let cachedConnection = global.mongoose || { conn: null, promise: null };
global.mongoose = cachedConnection;

async function connectToDatabase() {
  if (cachedConnection.conn) return cachedConnection.conn;
  if (!MONGO_URI) {
    console.warn("⚠️ Warning: MONGO_URI is not defined in .env file. Backend will not connect to database.");
    return null;
  }
  if (!cachedConnection.promise) {
    cachedConnection.promise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // fail early if it cannot connect
    }).then((mongoose) => mongoose);
  }
  cachedConnection.conn = await cachedConnection.promise;
  console.log('✅ Connected to MongoDB Atlas');
  return cachedConnection.conn;
}

// Connect initially
connectToDatabase().catch((err) => console.error('❌ MongoDB connection error:', err));

// Mongoose Schema & Model for full bootcamp registration
const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  collegeType: { type: String, required: true },
  enrollmentNo: { type: String }, // For Amity
  collegeName: { type: String }, // For Others
  courseName: { type: String, required: true },
  specialisation: { type: String, required: true },
  year: { type: String, required: true },
  linkedinUrl: { type: String, required: true },
  githubUrl: { type: String }, // Optional
  motivation: { type: String }, // Optional
  registrationDate: { type: Date, default: Date.now }
});

const Registration = mongoose.model('Registration', registrationSchema);

// Root Route to prevent 404 on base URL
app.get('/', (req, res) => {
  res.send('Database running');
});

// API Routes
app.post('/api/register', async (req, res) => {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return res.status(500).json({ error: "Backend database not configured." });
    }

    // Log removed for privacy

    const { 
      name, email, contactNumber, collegeType, enrollmentNo, collegeName, 
      courseName, specialisation, year, linkedinUrl, githubUrl, motivation 
    } = req.body;
    
    // Detailed validation for required fields
    const missing = [];
    if (!name) missing.push("Full Name");
    if (!email) missing.push("Email Address");
    if (!contactNumber) missing.push("Contact Number");
    if (!collegeType) missing.push("College Type");
    if (!courseName) missing.push("Course Name");
    if (!specialisation) missing.push("Specialisation");
    if (!year) missing.push("Year of Study");
    if (!linkedinUrl) missing.push("LinkedIn URL");

    if (missing.length > 0) {
      return res.status(400).json({ error: `Please fill all required fields. Missing: ${missing.join(', ')}` });
    }

    // Specific validation based on college type
    if (collegeType === 'Amity' && !enrollmentNo) {
      return res.status(400).json({ error: "Enrollment Number is required for Amity University." });
    }
    if (collegeType === 'Other' && !collegeName) {
      return res.status(400).json({ error: "College Name is required." });
    }

    const newRegistration = new Registration({ 
      name, email, contactNumber, collegeType, enrollmentNo, collegeName, 
      courseName, specialisation, year, linkedinUrl, githubUrl, motivation 
    });
    
    await newRegistration.save();

    // Send confirmation email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: `"Microsoft Tech Community" <${process.env.EMAIL_USER}>`,
          replyTo: process.env.EMAIL_USER,
          to: email,
          subject: 'Successfully Registered for Microsoft Tech Community Bootcamp',
          text: `Hello ${name},\n\nYour application for the Microsoft Tech Community Bootcamp has been successfully received. We're thrilled to have you!\n\nJoin the official WhatsApp group for event details or any queries: https://chat.whatsapp.com/\n\nSee you there!`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 20px; margin: 0; color: #333333;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h2 style="color: #00a4ef; margin: 0; font-size: 24px;">Microsoft Tech Community</h2>
                </div>
                
                <h1 style="color: #111111; font-size: 24px; margin: 0 0 20px 0; text-align: center;">You're on the list! 🎉</h1>
                
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Hello <strong>${name}</strong>,<br><br>
                  Your application for the Microsoft Tech Community Bootcamp has been successfully received. We're thrilled to have you!
                </p>

                <div style="background-color: #f8f9fa; border-left: 4px solid #00a4ef; padding: 15px; margin-bottom: 24px;">
                  <p style="margin: 0; font-size: 14px;"><strong>Role:</strong> Innovator<br>
                  <strong>Date &amp; Time:</strong> TBA</p>
                </div>

                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Join the official group for event details or any queries to ask from our team.
                </p>

                <div style="text-align: center; margin-bottom: 30px;">
                  <a href="https://chat.whatsapp.com/" style="display: inline-block; background-color: #25D366; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 4px;">Join WhatsApp Group</a>
                </div>

                <p style="font-size: 14px; color: #666666; margin: 0; text-align: center;">
                  See you there!<br>
                  Microsoft Tech Community Team
                </p>
              </div>
              <div style="max-width: 600px; margin: 30px auto 0; text-align: center;">
                <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 0;">
                  This email was sent because you registered for the Microsoft Tech Community Bootcamp.<br>
                  &copy; ${new Date().getFullYear()} Microsoft Tech Community. All rights reserved.
                </p>
              </div>
            </body>
            </html>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent to', email);
      } catch (mailError) {
        console.error('Error sending confirmation email:', mailError);
      }
    }

    res.status(201).json({ message: "Registration successful", data: newRegistration });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: `Database Error: ${error.message || 'Internal Server Error'}` });
  }
});

import jwt from 'jsonwebtoken';

// Admin Login Route
app.post('/api/admin/login', (req, res) => {
  // Force reload .env so manual changes apply immediately without server restart
  dotenv.config({ override: true });
  
  const { password } = req.body;
  
  if (!process.env.ADMIN_PASSWORD) {
    console.error("⚠️ Warning: ADMIN_PASSWORD is not defined in environment variables.");
    return res.status(500).json({ error: "Server misconfiguration. Admin login disabled." });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    const jwtSecret = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD;
    const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '12h' });
    return res.status(200).json({ token });
  }

  return res.status(401).json({ error: "Invalid password" });
});

// Middleware to verify admin JWT
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  const jwtSecret = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD;
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err || decoded.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  });
};

// Admin Registrations Route (Protected)
app.get('/api/admin/registrations', verifyAdmin, async (req, res) => {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return res.status(500).json({ error: "Backend database not configured." });
    }

    const registrations = await Registration.find().sort({ registrationDate: -1 });
    res.status(200).json(registrations);
  } catch (error) {
    console.error("Fetch Registrations Error:", error);
    res.status(500).json({ error: `Database Error: ${error.message || 'Internal Server Error'}` });
  }
});

// Start Server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Database running`);
  });
}

export default app;
