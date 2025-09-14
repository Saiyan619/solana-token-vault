import { useState } from 'react'
import { ArrowDown, Loader2Icon, } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useDepositToVault } from '@/program-calls-hooks/programHooks';


const DepositToken = () => {
  const { deposit, isPending } = useDepositToVault()
  const [depositAmount, setDepositAmount] = useState(0);
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [merchantAddress, setMerchantAddress] = useState('');
  console.log(isPending)
  const handleTestDeposit = () => {
    console.log(selectedToken)
    deposit({
      amount: depositAmount,
      mintAddress: selectedToken,
      merchantAddress: merchantAddress
    })
  }

  return (
    <div>
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ArrowDown className="w-5 h-5 text-vault-green" />
            Deposit Funds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount" className="text-foreground">Merchant Address</Label>
            <div className="relative">
              <Input
                id="deposit-amount"
                placeholder="0xfgn4j5g398onbwtlkioklr..."
                value={merchantAddress}
                type='text'
                onChange={(e) => setMerchantAddress(e.target.value)}
                className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-vault-green pr-16"
              />

            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Token Type</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="bg-background/50 border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr">USDC (Devnet)</SelectItem>
                <SelectItem value="EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS">USDT (Devnet)</SelectItem>
                <SelectItem value="So11111111111111111111111111111111111111112">Wrapped SOL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deposit-amount" className="text-foreground">Amount</Label>
            <div className="relative">
              <Input
                id="deposit-amount"
                placeholder="0.00"
                value={depositAmount}
                type='number'
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-vault-green "
              />

            </div>
          </div>


          {isPending ?
            <Button variant="outline"
              className="w-full" disabled>
              <Loader2Icon className="animate-spin" />
              Please wait
            </Button> :
            <Button
              variant="outline"
              className="w-full"
              onClick={handleTestDeposit}
            >
              Deposit
            </Button>
          }
        </CardContent>
      </Card>
    </div>
  )
}

export default DepositToken
