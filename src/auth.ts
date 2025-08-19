import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "./lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
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
          return { id: user.id, email: user.email, anonymousName: user.anonymousName }
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.isAdmin = user.isAdmin
      return token
    },
    async session({ session, token }) {
      session.user.isAdmin = token.isAdmin
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET!,
})