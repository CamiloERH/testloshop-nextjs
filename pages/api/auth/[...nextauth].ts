import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { dbUsers } from "../../../database";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
    }
    interface User {
        id?: string
        _id: string
    }
};

export const authOptions: NextAuthOptions = {
    // Configure one or more authentication providers
    providers: [
        Credentials({
            name: 'Custom Login',
            credentials: {
                email: { label: 'Correo', type: 'email', placeholder: 'correo@google.com' },
                password: { label: 'Contraseña', type: 'password', placeholder: 'Contraseña' }
            },
            async authorize(credentials) {
                console.log(credentials);
                return await dbUsers.checkUserEmailPassword(credentials!.email, credentials!.password);
            }
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        })
    ],
    //CUSTOM PAGES
    
    jwt: {
        // secret: process.env.JWT_SECRET_SEED, // deprecated
    },
    session: {
        maxAge: 2592000, //30d
        strategy: 'jwt',
        updateAge: 86400
    },
    callbacks: {
        //The arguments user, account, profile and isNewUser
        // are only passed the first time this callback is called on a new session, 
        //after the user signs in. In subsequent calls, only token will be available.
        async jwt({ token, account, user }) {
            console.log('account', account);
            if (account) {
                // no existe access_token ?
                token.accessToken = account.access_token;
                switch (account.type) {
                    case 'oauth':
                        token.user = await dbUsers.oAUthToDbUser(user?.email || '', user?.name || '')
                    case 'credentials':
                        token.user = user;
                        break;
                }
            }
            return token;
        },
        async session({ session, token, user }) {
            session.accessToken = token.accessToken as any;
            session.user = token.user as any;
            return session;
        }
    }
};

export default NextAuth(authOptions);