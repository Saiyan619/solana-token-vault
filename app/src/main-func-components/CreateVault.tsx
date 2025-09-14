import { useState } from 'react'
import { PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Updated import to use @coral-xyz/anchor instead of @project-serum/anchor
import { useCreateVault } from '@/program-calls-hooks/programHooks';

// Token addresses for different networks
// const DEVNET_TOKENS = {
//   USDC: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
//   USDT: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS',
//   SOL: 'So11111111111111111111111111111111111111112', // Wrapped SOL
// };

const CreateVault = () => {
    const { initializeNewVault, data, isPending, isSuccess, isError, wallet } = useCreateVault();
    const [clientAddress, setClientAddress] = useState('');
    const [selectedToken, setSelectedToken] = useState('USDC');


    const handleCreateVaultHook = () => {
        console.log(selectedToken)
        initializeNewVault({
            mintAddress: selectedToken,
            targetUserAddress: clientAddress
        })
    }

    return (
        <div>
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
                        <Label htmlFor="merchant-address" className="text-foreground">
                            Client Address (Compulsory)
                        </Label>
                        <Input
                            id="client-address"
                            placeholder="0x563746478438hjnfvnuf8e8e7e...."
                            value={clientAddress}
                            onChange={(e) => setClientAddress(e.target.value)}
                            className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-vault-purple"
                        />
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

                    <Button
                        variant="default"
                        className="w-full"
                        onClick={handleCreateVaultHook}
                        disabled={isPending || !wallet}
                    >
                        {isPending ? 'Creating Vault...' : 'Create Vault'}
                    </Button>

                    {/* Success Message */}
                    {data && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <h3 className="text-green-400 font-medium mb-2">✅ Vault Created Successfully!</h3>
                            <div className="space-y-1 text-sm text-green-300">
                                <p><strong>Transaction:</strong> {data.signature}</p>
                                <p><strong>Vault Info:</strong> {data.vaultInfoAddress}</p>
                                <p><strong>Vault Token Account:</strong> {data.vaultTokenAddress}</p>
                            </div>
                        </div>
                    )}



                    {/* Connection Warning */}
                    {!wallet && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-yellow-400 text-sm">⚠️ Please connect your wallet first</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default CreateVault