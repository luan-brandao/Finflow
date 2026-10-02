export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  onboardingCompleted?: boolean;
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
  
  // Extended fields
  monthlyIncome?: number;
  availableValue?: number;
  committedPercentage?: number;
  cardsSummary?: Card[];
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
  goalId?: string;
  createdAt?: string;
}

export interface TransactionRequest {
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  cardId?: string; // Prepared for future card link
  goalId?: string;
}

export interface Goal {
  id: string;
  userId?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt?: string;
}

export interface GoalRequest {
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface Card {
  id: string;
  userId?: string;
  name: string;
  creditLimit?: number;
  limit: number;
  used: number;
  available?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MonthlyIncome {
  id: string;
  userId: string;
  year: number;
  month: number;
  amount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UserUpdateData {
  name: string;
  email: string;
  password?: string;
}

export interface PaginatedUsers {
  content: User[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

export interface CardInvoice {
  id: string | null;
  cardId: string;
  userId: string;
  year: number;
  month: number;
  amount: number;
  status: 'OPEN' | 'CLOSED' | 'PAID';
  dueDate: string;
  closedAt?: string;
  paidAt?: string;
}
