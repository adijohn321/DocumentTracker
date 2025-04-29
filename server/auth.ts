import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { InsertUser, User as SelectUser } from "@shared/schema";
import { log } from "./vite";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Convert callback-based scrypt to Promise-based
const scryptAsync = promisify(scrypt);

// Hash a password with a random salt
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare a supplied password to a stored, hashed password
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Custom authentication middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

export function setupAuth(app: Express) {
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "doctrack-secret-key",
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: "lax",
      },
    })
  );

  // Register a new user
  app.post("/api/register", async (req, res) => {
    try {
      log("Register request received: " + JSON.stringify(req.body));
      
      // Validate required fields
      const { username, password, name, email } = req.body;
      if (!username || !password || !name || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create the new user with hashed password
      const hashedPassword = await hashPassword(password);
      const userData: InsertUser = {
        username,
        password: hashedPassword,
        name,
        email,
        department: req.body.department || null,
        role: req.body.role || "user",
      };

      const user = await storage.createUser(userData);
      log("User registered: " + user.username);

      // Set the session
      req.session.userId = user.id;
      req.session.userRole = user.role;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      log("Registration error: " + error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  // Login an existing user
  app.post("/api/login", async (req, res) => {
    try {
      log("Login request received: " + JSON.stringify(req.body));
      
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Verify password
      const passwordValid = await comparePasswords(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Set the session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      log("User logged in: " + user.username);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      log("Login error: " + error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout the current user
  app.post("/api/logout", (req, res) => {
    log("Logout request received");
    req.session.destroy((err) => {
      if (err) {
        log("Logout error: " + err);
        return res.status(500).json({ message: "Error during logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get the current authenticated user
  app.get("/api/user", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      log("Get user error: " + error);
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // Middleware to add user to req object if authenticated
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) {
      try {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          (req as any).user = user;
          (req as any).isAuthenticated = () => true;
        }
      } catch (error) {
        // Ignore error and proceed without user
      }
    }
    
    if (!(req as any).isAuthenticated) {
      (req as any).isAuthenticated = () => false;
    }
    
    next();
  });
  
  return { requireAuth };
}
