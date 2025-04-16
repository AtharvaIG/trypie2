
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  Users, 
  Plus, 
  CheckCircle, 
  Circle,
  RefreshCw 
} from "lucide-react";
import { useTravelExpenses } from "@/hooks/use-travel-expenses";
import { GroupMember } from "@/types/travel-group-types";

interface TravelGroupExpensesProps {
  groupId: string;
  groupMembers: GroupMember[];
  currentUserId: string | undefined;
}

const TravelGroupExpenses = ({ 
  groupId, 
  groupMembers,
  currentUserId 
}: TravelGroupExpensesProps) => {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [paidByUserId, setPaidByUserId] = useState("");
  const [splitMethod, setSplitMethod] = useState<"equal" | "custom">("equal");
  const [customShares, setCustomShares] = useState<{[userId: string]: string}>({});
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { 
    expenses, 
    isLoading, 
    loadExpenses, 
    addExpense, 
    markShareAsPaid 
  } = useTravelExpenses(groupId);
  
  useEffect(() => {
    if (groupId) {
      loadExpenses();
    }
  }, [groupId]);
  
  useEffect(() => {
    if (user?.id) {
      setPaidByUserId(user.id);
    }
  }, [user]);

  const handleAddExpense = async () => {
    if (!expenseTitle || !expenseAmount || !paidByUserId) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    // Calculate shares based on split method
    let shares: { userId: string; amount: number }[] = [];
    
    if (splitMethod === "equal") {
      const shareAmount = amount / groupMembers.length;
      shares = groupMembers.map(member => ({
        userId: member.user_id,
        amount: Number(shareAmount.toFixed(2))
      }));
    } else {
      // Validate custom shares
      let totalShare = 0;
      const customShareEntries = Object.entries(customShares);
      
      for (const [userId, shareAmount] of customShareEntries) {
        const share = parseFloat(shareAmount);
        if (isNaN(share) || share < 0) {
          toast({
            title: "Invalid share amount",
            description: "Please enter valid amounts for all members",
            variant: "destructive",
          });
          return;
        }
        totalShare += share;
      }
      
      // Check if total shares match total expense amount
      if (Math.abs(totalShare - amount) > 0.01) {
        toast({
          title: "Share amounts don't match",
          description: "The sum of all shares must equal the total expense amount",
          variant: "destructive",
        });
        return;
      }
      
      shares = customShareEntries.map(([userId, shareAmount]) => ({
        userId,
        amount: parseFloat(shareAmount)
      }));
    }

    const success = await addExpense({
      title: expenseTitle,
      amount,
      currency,
      paidBy: paidByUserId,
      shares
    });

    if (success) {
      setIsAddExpenseOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setExpenseTitle("");
    setExpenseAmount("");
    setCurrency("USD");
    setPaidByUserId(user?.id || "");
    setSplitMethod("equal");
    setCustomShares({});
  };
  
  const handleSplitMethodChange = (method: "equal" | "custom") => {
    setSplitMethod(method);
    
    if (method === "custom") {
      // Initialize custom shares with 0 for each member
      const shares: {[userId: string]: string} = {};
      groupMembers.forEach(member => {
        shares[member.user_id] = "0";
      });
      setCustomShares(shares);
    }
  };
  
  const updateCustomShare = (userId: string, value: string) => {
    setCustomShares(prev => ({
      ...prev,
      [userId]: value
    }));
  };
  
  const handleMarkAsPaid = async (shareId: string, currentStatus: boolean) => {
    await markShareAsPaid(shareId, !currentStatus);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-trypie-600" />
          <h2 className="text-lg font-medium">Group Expenses</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={loadExpenses}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          <Button 
            size="sm"
            onClick={() => setIsAddExpenseOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Expense
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-grow px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Loading expenses...</p>
          </div>
        ) : expenses.length > 0 ? (
          <div className="space-y-4 py-4">
            {expenses.map(expense => (
              <div 
                key={expense.id}
                className="border rounded-lg overflow-hidden bg-white"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">{expense.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>Paid by </span>
                        <div className="flex items-center ml-1">
                          <Avatar className="h-5 w-5 mr-1">
                            <AvatarImage src={expense.paidByProfile?.avatarUrl || undefined} />
                            <AvatarFallback>
                              {expense.paidByProfile?.fullName?.substring(0, 2) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span>{expense.paidByProfile?.fullName || "User"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {expense.currency} {expense.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(expense.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {expense.shares && expense.shares.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="text-sm font-medium mb-2">Shares</h4>
                      <div className="space-y-2">
                        {expense.shares.map(share => {
                          const member = groupMembers.find(m => m.user_id === share.user_id);
                          const isCurrentUser = share.user_id === currentUserId;
                          
                          return (
                            <div 
                              key={share.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={member?.profile?.avatarUrl || undefined} />
                                  <AvatarFallback>
                                    {member?.profile?.fullName?.substring(0, 2) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span>
                                  {member?.profile?.fullName || "User"}
                                  {isCurrentUser && " (You)"}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {expense.currency} {share.amount.toFixed(2)}
                                </span>
                                
                                {(isCurrentUser || expense.paid_by === currentUserId) && (
                                  <button 
                                    className="flex items-center text-xs text-gray-500 hover:text-trypie-600"
                                    onClick={() => handleMarkAsPaid(share.id, share.is_paid || false)}
                                  >
                                    {share.is_paid ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Circle className="h-4 w-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-40">
            <DollarSign className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-gray-500 mb-2">No expenses yet</p>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsAddExpenseOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add First Expense
            </Button>
          </div>
        )}
      </ScrollArea>

      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="expense-title">Expense Name</Label>
              <Input
                id="expense-title"
                placeholder="e.g., Dinner at Restaurant"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expense-currency">Currency</Label>
                <select
                  id="expense-currency"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paid-by">Paid By</Label>
              <select
                id="paid-by"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={paidByUserId}
                onChange={(e) => setPaidByUserId(e.target.value)}
              >
                {groupMembers.map(member => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.profile?.fullName || "User"}
                    {member.user_id === currentUserId ? " (You)" : ""}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Split Method</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={splitMethod === "equal" ? "default" : "outline"}
                  onClick={() => handleSplitMethodChange("equal")}
                  className="flex-1"
                >
                  Split Equally
                </Button>
                <Button
                  type="button" 
                  variant={splitMethod === "custom" ? "default" : "outline"}
                  onClick={() => handleSplitMethodChange("custom")}
                  className="flex-1"
                >
                  Custom Split
                </Button>
              </div>
            </div>
            
            {splitMethod === "custom" && (
              <div className="space-y-2 border p-3 rounded-md">
                <Label className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  Custom Shares
                </Label>
                <div className="space-y-3">
                  {groupMembers.map(member => (
                    <div key={member.user_id} className="flex items-center gap-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.profile?.avatarUrl || undefined} />
                        <AvatarFallback>
                          {member.profile?.fullName?.substring(0, 2) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        {member.profile?.fullName || "User"}
                        {member.user_id === currentUserId ? " (You)" : ""}
                      </div>
                      <div className="w-1/3">
                        <div className="flex items-center">
                          <span className="mr-2">{currency}</span>
                          <Input
                            type="number"
                            value={customShares[member.user_id] || "0"}
                            onChange={(e) => updateCustomShare(member.user_id, e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {expenseAmount && (
                  <div className="flex justify-between text-sm mt-2 pt-2 border-t">
                    <span>Total:</span>
                    <span>
                      {currency} {expenseAmount}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddExpenseOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddExpense}>Save Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TravelGroupExpenses;
