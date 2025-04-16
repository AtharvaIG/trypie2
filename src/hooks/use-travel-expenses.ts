
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GroupExpense, ExpenseShare } from '@/types/travel-group-types';
import { 
  fetchGroupExpenses, 
  createExpense, 
  updateExpenseShare 
} from '@/services/travel-group-service';

export function useTravelExpenses(groupId: string) {
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadExpenses = async () => {
    if (!groupId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedExpenses = await fetchGroupExpenses(groupId);
      setExpenses(fetchedExpenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses');
      toast({
        title: "Error",
        description: "Failed to load group expenses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (expenseData: {
    title: string;
    amount: number;
    currency: string;
    paidBy: string;
    shares: { userId: string; amount: number }[];
  }) => {
    if (!groupId || !user?.id) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newExpense = await createExpense({
        group_id: groupId,
        title: expenseData.title,
        amount: expenseData.amount,
        currency: expenseData.currency,
        paid_by: expenseData.paidBy,
        shares: expenseData.shares
      });
      
      setExpenses(prev => [...prev, newExpense]);
      
      toast({
        title: "Expense Added",
        description: "The expense has been added successfully",
      });
      
      return newExpense;
    } catch (err) {
      console.error('Error creating expense:', err);
      setError('Failed to add expense');
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const markShareAsPaid = async (shareId: string, isPaid: boolean) => {
    if (!shareId) return false;
    
    try {
      await updateExpenseShare(shareId, isPaid);
      
      // Update the local state
      setExpenses(prev => 
        prev.map(expense => ({
          ...expense,
          shares: expense.shares?.map(share => 
            share.id === shareId 
              ? { ...share, is_paid: isPaid }
              : share
          )
        }))
      );
      
      toast({
        title: isPaid ? "Marked as Paid" : "Marked as Unpaid",
        description: `The expense has been marked as ${isPaid ? 'paid' : 'unpaid'}`,
      });
      
      return true;
    } catch (err) {
      console.error('Error updating expense share:', err);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    expenses,
    isLoading,
    error,
    loadExpenses,
    addExpense,
    markShareAsPaid
  };
}
