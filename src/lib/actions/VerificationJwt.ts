import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.REGISTRATION_SECRET || 'registration_super_secret_key';

export interface VerificationTokenPayload {
    roll_number: string;
    generated_time: number;
}

export function signVerificationToken(payload: VerificationTokenPayload): string {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '15m' }); // Token valid for 15 minutes
}

export function verifyVerificationToken(token: string): VerificationTokenPayload | null {
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as VerificationTokenPayload;
        return decoded;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}
