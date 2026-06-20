import axios from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  Book,
  BookRequest,
  Loan,
  Reservation,
  PageResponse,
  AdminLoan,
  AdminReservation,
  MemberWithLoanCount,
} from '@/types';
import { getToken, removeToken, removeUser } from './auth';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      removeUser();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),
  register: (data: RegisterRequest) =>
    api.post<void>('/auth/register', data).then((r) => r.data),
};

export const booksApi = {
  getAll: (params: { page?: number; size?: number; keyword?: string; searchType?: string } = {}) =>
    api.get<PageResponse<Book>>('/books', { params: { page: 0, size: 10, ...params } }).then((r) => r.data),
  getOne: (id: number) =>
    api.get<Book>(`/books/${id}`).then((r) => r.data),
  create: (data: BookRequest) =>
    api.post<Book>('/books', data).then((r) => r.data),
  update: (id: number, data: BookRequest) =>
    api.put<Book>(`/books/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    api.delete<void>(`/books/${id}`).then((r) => r.data),
};

export const loansApi = {
  getMine: () =>
    api.get<Loan[]>('/loans').then((r) => r.data),
  loan: (bookId: number) =>
    api.post<Loan>(`/loans/${bookId}`).then((r) => r.data),
  returnBook: (loanId: number) =>
    api.put<Loan>(`/loans/return/${loanId}`).then((r) => r.data),
};

export const reservationsApi = {
  getMine: () =>
    api.get<Reservation[]>('/reservations').then((r) => r.data),
  reserve: (bookId: number) =>
    api.post<Reservation>(`/reservations/${bookId}`).then((r) => r.data),
  cancel: (reservationId: number) =>
    api.delete<void>(`/reservations/${reservationId}`).then((r) => r.data),
};

export const adminApi = {
  getMembers: (page = 0, size = 10) =>
    api.get<PageResponse<MemberWithLoanCount>>('/admin/members', { params: { page, size } }).then((r) => r.data),
  getMember: (id: number) =>
    api.get<MemberWithLoanCount>(`/admin/members/${id}`).then((r) => r.data),
  getLoans: (page = 0, size = 10, status?: string) =>
    api.get<PageResponse<AdminLoan>>('/admin/loans', { params: { page, size, status } }).then((r) => r.data),
  getOverdueLoans: () =>
    api.get<AdminLoan[]>('/admin/loans/overdue').then((r) => r.data),
  getReservations: (page = 0, size = 10) =>
    api.get<PageResponse<AdminReservation>>('/admin/reservations', { params: { page, size } }).then((r) => r.data),
};

export default api;
