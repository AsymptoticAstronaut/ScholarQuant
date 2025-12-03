import type { NextAuthOptions } from 'next-auth'
import CognitoProvider from 'next-auth/providers/cognito'

import { PostgresActivityRepository } from '@/lib/server/postgres-activity-repository'

const activityRepo = new PostgresActivityRepository()

export const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID ?? '',
      clientSecret: process.env.COGNITO_CLIENT_SECRET ?? '',
      issuer: process.env.COGNITO_ISSUER,
      // Treat Cognito as full OIDC (ID token) and validate PKCE + state + nonce
      idToken: true,
      checks: ['pkce', 'state', 'nonce'],
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Enrich token with profile details on initial sign-in
      if (account && profile) {
        token.name = profile.name ?? token.name
        token.email = (profile as { email?: string }).email ?? token.email
        token.picture = (profile as { picture?: string; image?: string }).picture ?? token.picture
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? session.user.id
        session.user.image = (token.picture as string | undefined) ?? session.user.image
      }
      return session
    },
  },
  events: {
    async signIn({ user, account }) {
      try {
        const userId = (user as { id?: string }).id
        if (!userId) return

        const provider = account?.provider ?? 'auth'
        const description =
          provider === 'cognito'
            ? 'Signed in via Google'
            : `Signed in via ${provider}`

        await activityRepo.logEvent(userId, 'login', description)
      } catch (err) {
        console.error('Failed to log login activity', err)
      }
    },
  },
}
