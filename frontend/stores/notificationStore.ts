import type { Notification } from '@/types/resource';



export const useNotificationStore = defineStore('notificationStore', {
  state: (): {notification: Notification[]} => ({
    notification: []
  }),
  getters: {
    getAllNotification(): Notification[] {
      return this.notification;
    },

  },
  actions: {
    addNotification(notification: Notification): void {
      this.notification.push(notification);
    },
    removeNotificationById(notificationId: number) {
      this.notification = this.notification.filter(notification => notification.id !== notificationId)
    },
  },
});
