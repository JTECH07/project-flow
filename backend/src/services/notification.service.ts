import prisma from '../config/database';

export type NotificationType = 'PROJECT_INVITATION' | 'TASK_ASSIGNED' | 'TASK_COMMENTED';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  message: string;
  link?: string;
}

export const createNotification = async ({
  userId,
  type,
  message,
  link,
}: CreateNotificationParams) => {
  try {
    return await prisma.notification.create({
      data: { userId, type, message, link },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
