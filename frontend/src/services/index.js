import api from './api';

export const authService = {
  register: (nom, prenom, email, password, confirmPassword) =>
    api.post('/auth/register', { nom, prenom, email, password, confirmPassword }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  refreshToken: (refreshToken) =>
    api.post('/auth/refresh-token', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    })
};

export const familyService = {
  createFamily: (nom_famille, description) =>
    api.post('/families', { nom_famille, description }),
  
  getFamilies: () =>
    api.get('/families'),
  
  getFamily: (familyId) =>
    api.get(`/families/${familyId}`),
  
  updateFamily: (familyId, nom_famille, description) =>
    api.put(`/families/${familyId}`, { nom_famille, description }),
  
  getMembers: (familyId) =>
    api.get(`/families/${familyId}/members`),
  
  inviteMember: (familyId, email) =>
    api.post(`/families/${familyId}/members/invite`, { email }),
  
  acceptInvitation: (token) =>
    api.post(`/families/invite/${token}/accept`),
  
  removeMember: (familyId, memberId) =>
    api.delete(`/families/${familyId}/members/${memberId}`)
};

export const taskService = {
  getTasks: (familyId, status) =>
    api.get(`/tasks/${familyId}`, { params: { status } }),
  
  createTask: (familyId, titre, description, assigned_to, date_limite, priority) =>
    api.post(`/tasks/${familyId}`, { titre, description, assigned_to, date_limite, priority }),
  
  updateTask: (familyId, taskId, data) =>
    api.put(`/tasks/${familyId}/${taskId}`, data),
  
  updateTaskStatus: (familyId, taskId, status) =>
    api.patch(`/tasks/${familyId}/${taskId}/status`, { status }),
  
  deleteTask: (familyId, taskId) =>
    api.delete(`/tasks/${familyId}/${taskId}`)
};

export const expenseService = {
  getExpenses: (familyId, startDate, endDate, categorie) =>
    api.get(`/expenses/${familyId}`, { params: { startDate, endDate, categorie } }),
  
  getStats: (familyId, month, year) =>
    api.get(`/expenses/${familyId}/stats`, { params: { month, year } }),
  
  createExpense: (familyId, titre, montant, categorie, description, date_depense) =>
    api.post(`/expenses/${familyId}`, { titre, montant, categorie, description, date_depense }),
  
  updateExpense: (familyId, expenseId, data) =>
    api.put(`/expenses/${familyId}/${expenseId}`, data),
  
  deleteExpense: (familyId, expenseId) =>
    api.delete(`/expenses/${familyId}/${expenseId}`)
};

export const shoppingService = {
  getItems: (familyId, statut) =>
    api.get(`/shopping/${familyId}`, { params: { statut } }),
  
  createItem: (familyId, nom_article, quantite, unite, categorie) =>
    api.post(`/shopping/${familyId}`, { nom_article, quantite, unite, categorie }),
  
  updateItem: (familyId, itemId, data) =>
    api.put(`/shopping/${familyId}/${itemId}`, data),
  
  deleteItem: (familyId, itemId) =>
    api.delete(`/shopping/${familyId}/${itemId}`)
};

export const eventService = {
  getEvents: (familyId, startDate, endDate) =>
    api.get(`/events/${familyId}`, { params: { startDate, endDate } }),
  
  createEvent: (familyId, titre, description, date_debut, date_fin, location, couleur) =>
    api.post(`/events/${familyId}`, { titre, description, date_debut, date_fin, location, couleur }),
  
  updateEvent: (familyId, eventId, data) =>
    api.put(`/events/${familyId}/${eventId}`, data),
  
  deleteEvent: (familyId, eventId) =>
    api.delete(`/events/${familyId}/${eventId}`)
};

export const notificationService = {
  getNotifications: (lu) =>
    api.get('/notifications', { params: { lu } }),
  
  markAsRead: (notificationId) =>
    api.patch(`/notifications/${notificationId}/read`),
  
  markAllAsRead: () =>
    api.patch('/notifications/read-all'),
  
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`)
};