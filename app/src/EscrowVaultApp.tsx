import React, { useState } from 'react';
import { 
  Wallet, 
  Database, 
  Coins, 
  Handshake, 
  PlusCircle, 
  ArrowDown, 
  Info, 
  History, 
  Rocket, 
  Check, 
  ExternalLink, 
  Twitter, 
  Github,
  ArrowUp,
  ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './components/ui/button';

export const EscrowVaultApp = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [merchantAddress, setMerchantAddress] = useState('');
  const [merchantFee, setMerchantFee] = useState('');
  const [platformFee, setPlatformFee] = useState('');
  const [selectedToken, setSelectedToken] = useState('SOL');
  const [loading, setLoading] = useState('');

  const handleConnect = () => {
    setIsConnected(!isConnected);
  };

  const handleAction = async (action: string) => {
    setLoading(action);
    // Simulate API call
    setTimeout(() => setLoading(''), 2000);
  };

  const transactions = [
    { 
      type: 'Deposit', 
      amount: '100.0 SOL', 
      status: 'Completed', 
      time: '2 mins ago', 
      hash: '8xF2...9pLm',
      typeColor: 'green',
      icon: ArrowDown
    },
    { 
      type: 'Settlement', 
      amount: '95.0 SOL', 
      status: 'Pending', 
      time: '1 hour ago', 
      hash: '7kR8...4nQw',
      typeColor: 'purple',
      icon: Handshake
    },
    { 
      type: 'Initialize', 
      amount: '0.1 SOL', 
      status: 'Completed', 
      time: '2 days ago', 
      hash: '9xF2...4pLm',
      typeColor: 'blue',
      icon: Rocket
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-vault text-foreground">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-vault-purple to-vault-purple-light bg-clip-text text-transparent">
                SolVault
              </h1>
            </div>
            <Button 
              variant={isConnected ? "default" : "link"}
              onClick={handleConnect}
              className="flex items-center gap-2"
            >
              <Wallet size={18} />
              {isConnected ? 'Connected' : 'Connect Wallet'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Create Vault */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <PlusCircle className="w-5 h-5 text-vault-purple" />
                Create Escrow Vault
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="merchant-address" className="text-foreground">Merchant Address</Label>
                <Input
                  id="merchant-address"
                  placeholder="Enter merchant wallet address"
                  value={merchantAddress}
                  onChange={(e) => setMerchantAddress(e.target.value)}
                  className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-vault-purple"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="merchant-fee" className="text-foreground">Merchant Fee (%)</Label>
                  <Input
                    id="merchant-fee"
                    placeholder="5.0"
                    value={merchantFee}
                    onChange={(e) => setMerchantFee(e.target.value)}
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-vault-purple"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-fee" className="text-foreground">Platform Fee (%)</Label>
                  <Input
                    id="platform-fee"
                    placeholder="1.0"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(e.target.value)}
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-vault-purple"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Token Mint</Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger className="bg-background/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOL">SOL</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="default" 
                className="w-full"
                onClick={() => handleAction('create')}
                disabled={loading === 'create'}
              >
                {loading === 'create' ? 'Creating...' : 'Create Vault'}
              </Button>
            </CardContent>
          </Card>

          {/* Deposit/Settlement */}
          <div className="space-y-6">
            {/* Deposit Section */}
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <ArrowDown className="w-5 h-5 text-vault-green" />
                  Deposit Funds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount" className="text-foreground">Amount</Label>
                  <div className="relative">
                    <Input
                      id="deposit-amount"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-vault-green pr-16"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                      SOL
                    </div>
                  </div>
                </div>
                <Button 
                  variant="link" 
                  className="w-full"
                  onClick={() => handleAction('deposit')}
                  disabled={loading === 'deposit'}
                >
                  {loading === 'deposit' ? 'Depositing...' : 'Deposit'}
                </Button>
              </CardContent>
            </Card>

            {/* Settlement Section */}
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Handshake className="w-5 h-5 text-vault-purple" />
                  Settlement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vault Balance:</span>
                    <span className="font-mono text-foreground">125.5 SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Merchant Fee (5%):</span>
                    <span className="font-mono text-foreground">6.275 SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee (1%):</span>
                    <span className="font-mono text-foreground">1.255 SOL</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span className="text-foreground">Settlement Amount:</span>
                    <span className="font-mono text-vault-green">117.97 SOL</span>
                  </div>
                </div>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => handleAction('settle')}
                  disabled={loading === 'settle'}
                >
                  {loading === 'settle' ? 'Settling...' : 'Execute Settlement'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Vault History */}
        {/* <Card className="mb-8 bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <History className="w-5 h-5 text-vault-blue" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Transaction
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <TransactionRow key={index} {...tx} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card> */}

        {/* Vault Details */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Info className="w-5 h-5 text-vault-orange" />
              Current Vault Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-muted-foreground text-sm">Vault Address:</span>
                  <p className="font-mono text-foreground">9xF2...4pLm</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Merchant:</span>
                  <p className="font-mono text-foreground">5kR8...9nQw</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Token Mint:</span>
                  <p className="text-foreground">SOL</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Current Balance:</span>
                  <p className="font-mono text-vault-green font-semibold">125.5 SOL</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-muted-foreground text-sm">Merchant Fee:</span>
                  <p className="text-foreground">5.00%</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Platform Fee:</span>
                  <p className="text-foreground">1.00%</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Status:</span>
                  <Badge variant="default" className="ml-2">Active</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Created:</span>
                  <p className="text-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <span className="text-muted-foreground">SolVault - Secure Escrow on Solana</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};