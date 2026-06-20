export type MemberRole = 'ROLE_USER' | 'ROLE_ADMIN';
export type BookStatus = 'AVAILABLE' | 'LOANED' | 'RESERVED';
export type LoanStatus = 'ACTIVE' | 'OVERDUE' | 'RETURNED';
export type ReservationStatus = 'WAITING' | 'COMPLETED' | 'CANCELLED';

export interface Member {
  id: number;
  username: string;
  nickname: string;
  email: string;
  role: MemberRole;
  createdAt: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  status: BookStatus;
  createdAt: string;
}

export interface Loan {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: LoanStatus;
  overdue: boolean;
}

export interface Reservation {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  reservedAt: string;
  status: ReservationStatus;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  nickname: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: MemberRole;
}

export interface BookRequest {
  title: string;
  author: string;
  publisher: string;
  isbn: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export interface AdminLoan {
  id: number;
  username: string;
  bookTitle: string;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: LoanStatus;
}

export interface AdminReservation {
  id: number;
  username: string;
  bookTitle: string;
  reservedAt: string;
  status: ReservationStatus;
}

export interface MemberWithLoanCount extends Member {
  activeLoans: number;
}
