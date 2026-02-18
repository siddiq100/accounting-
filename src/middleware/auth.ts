import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: string;
        permissions?: any;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'لم يتم توفير token' });
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'token غير صالح' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'لا توجد صلاحية للوصول' });
  }
  next();
};

export const checkPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'يرجى تسجيل الدخول' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.permissions && (req.user.permissions as any)[permission]) {
      return next();
    }

    res.status(403).json({ error: 'لا توجد صلاحية لهذه العملية' });
  };
};
