import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { options } from '../auth/[...nextauth]';

// POST /api/post
// Required fields in body: title
// Optional fields in body: content

const secret = `secret`;

export default async function handle(req, res) {
    const { title, content } = req.body;
    //const session = await getToken({ req, secret });
    //const session = await getSession({ req });
    console.log(req.headers, req.cookies);
    const request = {
        headers: req.headers,
        cookies: req.cookies
    };
    const response = { getHeader() {}, setCookie() {}, setHeader() {} };

    const session = await getServerSession(request as any, response as any, options);
    console.log(title, content, session, req.body, JSON.stringify(session, null, 2));
    const result = await prisma.post.create({
        data: {
            title: title,
            content: content,
            author: { connect: { email: session?.user?.email } },
        },
    });
    res.json(result);
}