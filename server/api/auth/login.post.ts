export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  
  // Validate credentials
  const { username, password } = body
  
  // Parse users from runtime config
  const usersString = config.authUsers || ''
  const userPairs = usersString.split(';').filter((pair: string) => pair.includes(':'))
  
  for (const pair of userPairs) {
    const [envUsername, hashedPassword] = pair.split(':')
    
    if (username === envUsername) {
      // Verify password using nuxt-auth-utils
      const isValid = await verifyPassword(hashedPassword, password)
      
      if (isValid) {
        // Set user session
        await setUserSession(event, {
          user: {
            id: username,
            name: username,
          },
          loggedInAt: Date.now()
        })
        
        return { success: true }
      }
    }
  }
  
  throw createError({
    statusCode: 401,
    statusMessage: 'Invalid credentials'
  })
})
