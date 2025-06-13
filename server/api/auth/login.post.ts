export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Validate credentials
  const { username, password } = body
  
  // Check against environment variables (same logic as your current setup)
  if (
    (username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD)
  ) {
    // Set user session
    await setUserSession(event, {
      user: {
        id: "admin",
        name: "Admin", 
        email: "feta@cheese.gr"
      },
      loggedInAt: Date.now()
    })
    
    return { success: true }
  }
  
  throw createError({
    statusCode: 401,
    statusMessage: 'Invalid credentials'
  })
})
