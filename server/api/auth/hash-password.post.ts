export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  if (!body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password is required'
    })
  }
  
  try {
    // Use nuxt-auth-utils hashPassword function
    const hash = await hashPassword(body.password)
    
    return { hash }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to hash password'
    })
  }
})
