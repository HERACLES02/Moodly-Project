import NextAuth from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import prisma from "./lib/prisma"
import bcrypt from "bcryptjs"

async function generateUniqueUsername(): Promise<string> {
  const FALLBACK_WORDS = ['Strawberry', 'Tofu', 'Mango', 'Cookie', 'Panda']
  const word = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
  const username = `Anon${word}`
  
  const existing = await prisma.user.findUnique({ where: { anonymousName: username } })
  if (!existing) return username
  
  return `Anon${word}${Math.floor(Math.random() * 1000)}`
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET!,
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15 // 15 minutes
      }
    }
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" && user.email) {
        let existingUser = await prisma.user.findUnique({ where: { email: user.email } })
        
        if (!existingUser) {
          const anonymousName = await generateUniqueUsername()
          existingUser = await prisma.user.create({
            data: { email: user.email, anonymousName, password: null }
          })
        }
        
        user.id = existingUser.id
        user.anonymousName = existingUser.anonymousName
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.anonymousName = user.anonymousName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.anonymousName = token.anonymousName as string
      }
      return session
    }
  }
})