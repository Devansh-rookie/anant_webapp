import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { isRollNumberValid } from '@/helpers/extras';
import sendEmail, { mailOptions } from '@/helpers/mailer';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roll_number } = body;
    if (!roll_number) {
      return NextResponse.json(
        { message: 'Roll number missing!' },
        { status: 400 }
      );
    }
    if (typeof roll_number != 'string') {
      return NextResponse.json(
        { message: 'Invalid data type!' },
        { status: 400 }
      );
    }
    if (!isRollNumberValid(roll_number)) {
      return NextResponse.json(
        { message: 'Roll number invalid!' },
        { status: 400 }
      );
    }

    // if roll_number already registered
    const user = await prisma.user.findUnique({
      where: { roll_number: Number(roll_number) },
    });
    if (user) {
      return NextResponse.json(
        { message: 'User already registered!' },
        { status: 400 }
      );
    }

    // college mail_id
    const to = roll_number + '@nitkkr.ac.in';

    // Generate JWT Token
    // We import dynamically to avoid circular dependencies if any, though not strictly necessary here but good for consistency
    const { signVerificationToken } = await import('@/lib/actions/VerificationJwt');
    const token = signVerificationToken({
      roll_number,
      generated_time: Date.now(),
    });

    const verificationLink = `${process.env.NEXTAUTH_URL || req.nextUrl.origin}/register?token=${token}`;

    if (!process.env.MAIL_ID) {
      return NextResponse.json({ message: '.env missing' }, { status: 500 });
    }

    const maildata: mailOptions = {
      from: process.env.MAIL_ID,
      to: to,
      subject: 'Verify Registration for Anant',
      text: `Click the following link to verify your identity and complete registration:\n\n${verificationLink}\n\nThis link is valid for 15 minutes.\n\nThank You`,
      html: `<p>Click the following link to verify your identity and complete registration:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>This link is valid for 15 minutes.</p><p>Thank You</p>`
    };

    try {
      await sendEmail(maildata);
      console.log(`Verification link sent to ${to}: ${verificationLink}`);
    } catch (err) {
      console.log('error occured\n', err);
      return NextResponse.json(
        { message: 'Internal Server Error: Sending email-failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Verification link sent successfully' });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
