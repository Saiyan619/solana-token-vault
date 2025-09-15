import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {  Loader2Icon, ShieldClose } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useCLoseVault } from '@/program-calls-hooks/programHooks';


const CloseVault = () => {

  const { close, isPending } = useCLoseVault();
          const [selectedToken, setSelectedToken] = useState('USDC');
              const [clientAddress, setClientAddress] = useState('');
          
  const handleCloseVault = () => {
    console.log(selectedToken,clientAddress)
    close({
      mintAddress:selectedToken,
      clientAddress:clientAddress
    })
  }
  return (
    <div>
       <Card className="bg-gradient-card border-border shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <ShieldClose className="w-5 h-5 text-vault-purple" />
                        Close Vault
                      </CardTitle>
                    </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                                        <Label htmlFor="deposit-amount" className="text-foreground">Client Address</Label>
                                        <div className="relative">
                                          <Input
                                            id="deposit-amount"
                                            placeholder="0xfgn4j5g398onbwtlkioklr..."
                                value={clientAddress}
                                type='text'
                                            onChange={(e) => setClientAddress(e.target.value)}
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
                     
                      <AlertDialog>
                                  <AlertDialogTrigger asChild>
                      
                                    {isPending ?
                                      <Button variant="outline"
                                        className="w-full" disabled>
                                        <Loader2Icon className="animate-spin" />
                                        Please wait
                                      </Button> :
                                      <Button
                                        variant="destructive"
                                        className="w-full"
                      
                                      >
                                        Withdraw
                                      </Button>
                                    }
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. Please be re-assured you have settled with your client.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction>
                      
                                        <Button variant="default" className='w-full'
                                          onClick={handleCloseVault}>
                                          Close Vault
                                        </Button>
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                    </CardContent>
                  </Card>
    </div>
  )
}

export default CloseVault
