import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ZakatCalculation {
  totalWealth: number;
  nisab: number;
  zakatDue: number;
  zakatPercentage: number;
}

export default function ZakatCalculator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    cash: "",
    savings: "",
    gold: "",
    silver: "",
    investments: "",
    business: "",
    debts: "",
    expenses: ""
  });
  
  const [result, setResult] = useState<ZakatCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Nisab values (approximate, should be updated based on current gold/silver prices)
  const NISAB_GOLD = 87.48; // grams of gold
  const NISAB_SILVER = 612.36; // grams of silver
  const GOLD_PRICE_PER_GRAM = 65; // USD (approximate)
  const SILVER_PRICE_PER_GRAM = 0.8; // USD (approximate)
  const ZAKAT_RATE = 0.025; // 2.5%

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateZakat = () => {
    setIsCalculating(true);
    
    // Convert string inputs to numbers
    const cash = parseFloat(formData.cash) || 0;
    const savings = parseFloat(formData.savings) || 0;
    const gold = parseFloat(formData.gold) || 0;
    const silver = parseFloat(formData.silver) || 0;
    const investments = parseFloat(formData.investments) || 0;
    const business = parseFloat(formData.business) || 0;
    const debts = parseFloat(formData.debts) || 0;
    const expenses = parseFloat(formData.expenses) || 0;

    // Calculate total wealth
    const totalAssets = cash + savings + gold + silver + investments + business;
    const totalLiabilities = debts + expenses;
    const netWealth = totalAssets - totalLiabilities;

    // Calculate Nisab (using gold standard)
    const nisabValue = NISAB_GOLD * GOLD_PRICE_PER_GRAM;

    // Calculate Zakat
    const zakatDue = netWealth >= nisabValue ? netWealth * ZAKAT_RATE : 0;

    setResult({
      totalWealth: netWealth,
      nisab: nisabValue,
      zakatDue: zakatDue,
      zakatPercentage: ZAKAT_RATE * 100
    });

    setIsCalculating(false);

    toast({
      title: "Zakat Calculated",
      description: zakatDue > 0 
        ? `Your Zakat obligation is $${zakatDue.toFixed(2)}` 
        : "You are below the Nisab threshold",
    });
  };

  const resetCalculator = () => {
    setFormData({
      cash: "",
      savings: "",
      gold: "",
      silver: "",
      investments: "",
      business: "",
      debts: "",
      expenses: ""
    });
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-secondary/20 to-islamic-primary/10">
      {/* Header */}
      <header className="bg-islamic-gradient text-white px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/more">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold">Zakat Calculator</h1>
            <p className="text-sm text-islamic-secondary/80">Calculate your Zakat obligation</p>
          </div>
          
          <div className="w-20"></div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">About Zakat</p>
                <p>Zakat is 2.5% of your wealth above the Nisab threshold. The current Nisab is approximately ${(NISAB_GOLD * GOLD_PRICE_PER_GRAM).toFixed(2)} USD based on gold prices.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assets Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-islamic-primary" />
              Assets & Wealth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cash">Cash ($)</Label>
                <Input
                  id="cash"
                  type="number"
                  placeholder="0"
                  value={formData.cash}
                  onChange={(e) => handleInputChange("cash", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="savings">Savings ($)</Label>
                <Input
                  id="savings"
                  type="number"
                  placeholder="0"
                  value={formData.savings}
                  onChange={(e) => handleInputChange("savings", e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gold">Gold Value ($)</Label>
                <Input
                  id="gold"
                  type="number"
                  placeholder="0"
                  value={formData.gold}
                  onChange={(e) => handleInputChange("gold", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="silver">Silver Value ($)</Label>
                <Input
                  id="silver"
                  type="number"
                  placeholder="0"
                  value={formData.silver}
                  onChange={(e) => handleInputChange("silver", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="investments">Investments ($)</Label>
                <Input
                  id="investments"
                  type="number"
                  placeholder="0"
                  value={formData.investments}
                  onChange={(e) => handleInputChange("investments", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="business">Business Assets ($)</Label>
                <Input
                  id="business"
                  type="number"
                  placeholder="0"
                  value={formData.business}
                  onChange={(e) => handleInputChange("business", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Deductible Debts & Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="debts">Outstanding Debts ($)</Label>
                <Input
                  id="debts"
                  type="number"
                  placeholder="0"
                  value={formData.debts}
                  onChange={(e) => handleInputChange("debts", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="expenses">Monthly Expenses ($)</Label>
                <Input
                  id="expenses"
                  type="number"
                  placeholder="0"
                  value={formData.expenses}
                  onChange={(e) => handleInputChange("expenses", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculate Button */}
        <div className="flex gap-3">
          <Button 
            onClick={calculateZakat} 
            disabled={isCalculating}
            className="flex-1 bg-islamic-gradient text-white py-6 text-lg font-semibold"
          >
            {isCalculating ? "Calculating..." : "Calculate Zakat"}
          </Button>
          <Button 
            onClick={resetCalculator} 
            variant="outline"
            className="px-6"
          >
            Reset
          </Button>
        </div>

        {/* Result */}
        {result && (
          <Card className={`${result.zakatDue > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${result.zakatDue > 0 ? 'text-green-700' : 'text-gray-700'}`}>
                Zakat Calculation Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Zakatable Wealth</p>
                  <p className="text-xl font-semibold text-gray-900">
                    ${result.totalWealth.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nisab Threshold</p>
                  <p className="text-xl font-semibold text-gray-900">
                    ${result.nisab.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-white border">
                <p className="text-sm text-gray-600 mb-1">Your Zakat Obligation</p>
                <p className={`text-3xl font-bold ${result.zakatDue > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                  ${result.zakatDue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {result.zakatDue > 0 ? `(${result.zakatPercentage}% of zakatable wealth)` : 'Below Nisab threshold'}
                </p>
              </div>

              {result.zakatDue > 0 && (
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Reminder:</strong> Zakat should be paid to eligible recipients as specified in the Quran. 
                    Consider donating to local mosques, Islamic charities, or directly to those in need.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}