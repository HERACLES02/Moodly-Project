import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "./lib/prisma"
import bcrypt from "bcryptjs"

export const { 
  handlers, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        
        if (user && user.password && bcrypt.compareSync(credentials.password as string, user.password)) {
          return { 
            id: user.id, 
            email: user.email, 
            anonymousName: user.anonymousName,
            isAdmin: user.isAdmin 
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        // token.anonymousName = user.anonymousName
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        // session.user.anonymousName = token.anonymousName as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    }
  },
  session: {
    strategy: "jwt"  // Make sure we're using JWT
  },
  secret: process.env.NEXTAUTH_SECRET!,
  
})