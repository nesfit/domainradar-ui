import prisma from "~/lib/prisma"
import { defineEventHandler, getQuery, sendError, H3Event } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const query = getQuery(event);
    if (query.status_code) {
      // Get by status_code
      const statusCode = parseInt(query.status_code as string, 10);
      if (isNaN(statusCode)) {
        return sendError(event, createError({ statusCode: 400, statusMessage: 'Invalid status_code' }));
      }
      const status = await prisma.collectorStatusType.findUnique({
        where: { status_code: statusCode },
      });
      if (!status) {
        return sendError(event, createError({ statusCode: 404, statusMessage: 'Status not found' }));
      }
      return status;
    } else {
      // Get all
      const statuses = await prisma.collectorStatusType.findMany();
      return statuses;
    }
  } catch (error) {
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Internal Server Error' }));
  }
});
