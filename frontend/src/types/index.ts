export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  created?: string;
  updated?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  userId?: string;
  isDefault?: boolean;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  total: number;
}

export interface MonthlySummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
}

export interface TopExpense {
  transactionId: string;
  description: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  date: string;
}

export interface RecentTransaction {
  transactionId: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  date: string;
}

export interface DashboardResponse {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  incomeByCategory: CategorySummary[];
  expenseByCategory: CategorySummary[];
  monthlySummary: MonthlySummary[];
  topExpenses: TopExpense[];
  recentTransactions: RecentTransaction[];
}

export interface Transaction {
  id: string;
  userId?: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  cardId?: string; // Prepared for future card link
  createdAt?: string;
}

export interface TransactionRequest {
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  cardId?: string; // Prepared for future card link
}

export interface Card {
  id: string;
  name: string;
  limit: number;
  used: number; // Derived locally
}

export interface UserUpdateData {
  name: string;
  email: string;
  password?: string;
}
