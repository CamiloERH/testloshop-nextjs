import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest | any, ev: NextFetchEvent) {

    const session: any = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if ((req.nextUrl.pathname.startsWith('/auth/login')
        || req.nextUrl.pathname.startsWith('/auth/register'))
        && session) {
        const requestedPage = req.nextUrl.pathname;
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (req.nextUrl.pathname.startsWith('/admin/') && !session) {
        const requestedPage = req.nextUrl.pathname;
        console.log(req.nextUrl.pathname)
        return NextResponse.redirect(new URL(`/auth/login?p=${requestedPage}`, req.url));
    } else if (req.nextUrl.pathname.startsWith('/admin/') && session) {
        const validRoles = ['admin', 'super-user', 'SEO'];
        if (!validRoles.includes(session.user.role)) {
            return NextResponse.redirect(new URL('/', req.url));
        }
        return NextResponse.next();
    }
}

export const config = {
    matcher: ['/admin/(.*)', '/api/admin/(.*)', '/auth/(.*)']
}