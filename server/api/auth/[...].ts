import type { AuthConfig } from "@auth/core/types"
import { NuxtAuthHandler } from "#auth"

import Credentials from "@auth/core/providers/credentials"

const runtimeConfig = useRuntimeConfig()

//

const fakeAuth = Credentials({
  name: "fake auth",
  credentials: {
    username: { label: "Username", type: "text", placeholder: "feta" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials, req) {
    // Add logic here to look up the user from the credentials supplied
    const user = { id: "1", name: "FETA", email: "feta@cheese.gr" }
    if (user) {
      // Any object returned will be saved in `user` property of the JWT
      return user
    } else {
      return null
    }
  },
})

const credentialsAuth = Credentials({
  name: "credentials",
  credentials: {
    username: { label: "Username", type: "text", placeholder: "feta" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials, req) {
    // admin check
    if (
      credentials.username === process.env.ADMIN_USERNAME &&
      credentials.password === process.env.ADMIN_PASSWORD
    ) {
      return { id: "admin", name: "Admin", email: "feta@cheese.gr" }
    } else {
      return null
    }
  },
})

//

export const authOptions: AuthConfig = {
  basePath: "/api/auth",
  secret: runtimeConfig.authJs.secret,
  theme: {
    logo: "/icon.svg",
  },
  providers: [
    // fakeAuth,
    credentialsAuth,
  ],
}

export default NuxtAuthHandler(authOptions, runtimeConfig)
