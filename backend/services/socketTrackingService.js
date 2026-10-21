class SocketTrackingService {
  constructor() {
    // Maps userId to { user: {id, name, email, role}, socketIds: Set<string>, connectedAt: Date }
    this.activeUsers = new Map();
  }

  addUser(socketId, user) {
    if (!user || !user.id) return;

    if (!this.activeUsers.has(user.id)) {
      this.activeUsers.set(user.id, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        socketIds: new Set([socketId]),
        connectedAt: new Date()
      });
    } else {
      this.activeUsers.get(user.id).socketIds.add(socketId);
    }
  }

  removeUser(socketId) {
    let removedUserId = null;
    for (const [userId, data] of this.activeUsers.entries()) {
      if (data.socketIds.has(socketId)) {
        data.socketIds.delete(socketId);
        if (data.socketIds.size === 0) {
          this.activeUsers.delete(userId);
          removedUserId = userId;
        }
        break;
      }
    }
    return removedUserId;
  }

  getActiveUsers() {
    return Array.from(this.activeUsers.values()).map(data => ({
      ...data.user,
      sessionCount: data.socketIds.size,
      connectedAt: data.connectedAt
    }));
  }
}

module.exports = new SocketTrackingService();
