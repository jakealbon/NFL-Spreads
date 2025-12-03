import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Leagues
export const leagueApi = {
  create: (data: {
    name: string;
    sport?: string;
    pickFormat?: string;
    numGamesPerWeek?: number;
    pickPrimeTimeOnly?: boolean;
    pickAllGames?: boolean;
  }) => api.post('/leagues', data),
  
  join: (inviteCode: string) =>
    api.post('/leagues/join', { inviteCode }),
  
  getAll: () => api.get('/leagues'),
  
  getById: (leagueId: string) =>
    api.get(`/leagues/${leagueId}`),
  
  getLeaderboard: (leagueId: string) =>
    api.get(`/leagues/${leagueId}/leaderboard`),
  
  getWeeks: (leagueId: string) =>
    api.get(`/leagues/${leagueId}/weeks`),
};

// Weeks & Games
export const weekApi = {
  create: (data: {
    leagueId: string;
    weekNum: number;
    season: number;
    startDate: string;
    endDate: string;
  }) => api.post('/weeks', data),
  
  getGames: (weekId: string) =>
    api.get(`/weeks/${weekId}/games`),
};

// Picks
export const pickApi = {
  create: (data: {
    gameId: string;
    pickedTeam: string;
    spread: number;
  }) => api.post('/picks', data),
  
  getUserPicks: () => api.get('/picks/user'),
};

// Admin
export const adminApi = {
  updateOdds: (sport?: string) =>
    api.post('/admin/odds/update', { sport }),
  
  updateGameResults: (gameId: string, homeScore: number, awayScore: number) =>
    api.post(`/admin/games/${gameId}/results`, { homeScore, awayScore }),
};

export default api;
