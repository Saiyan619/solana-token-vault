import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {  ArrowDown, } from 'lucide-react';
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from '@/solana_escrow_vault.json';
import { useState } from 'react';

const PROGRAM_ID = new PublicKey("G331TXB6zv8bj2y9jnHpmdbokfKJgBZshb21ZNbdmCGt");

const WithDrawTokens = () => {
     const { connection } = useConnection();
      const wallet = useAnchorWallet();
      const [depositAmount, setDepositAmount] = useState(0);
      const [selectedToken, setSelectedToken] = useState('USDC');
          const [merchantAddress, setMerchantAddress] = useState('');
      
            const [loading, setLoading] = useState(false);
            const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string>('');

    const withDrawToken = async (mintAddress: string, merchantAddress: string)=>{
        if(!wallet){
        console.error("Wallet not connected");
    }
    if (merchantAddress === "") {
        console.error("Merchant address is required");
    }
    console.log("Withdrawing tokens...");
    console.log("IDL initialize method:", idl.instructions.find((i: any) => i.name === "withdraw"));
    try {
        const provider = new AnchorProvider(connection, wallet, {
            commitment: 'confirmed'
        });
        const program = new Program(idl as any, provider);
        const withdrawerPubKey = wallet.publicKey;
        const merchantPubKey = new PublicKey(merchantAddress);
        const mintPubKey = new PublicKey(mintAddress);

        const [vaultInfoPDA] = await PublicKey.findProgramAddressSync([
            Buffer.from("vault_info"),
            merchantPubKey.toBuffer(),
            withdrawerPubKey.toBuffer(),
            mintPubKey.toBuffer()
        ], PROGRAM_ID);

        const [vaultTokenPDA] = await PublicKey.findProgramAddressSync([
            Buffer.from("vault_info"),
            merchantPubKey.toBuffer(),
            withdrawerPubKey.toBuffer(),
            mintPubKey.toBuffer()
        ], PROGRAM_ID);

        ///////im not done yet

    } catch (error) {
        console.error("Error during withdrawal:", error);
        throw error;
        
    }
    }
    
  return (
    <div>
      <Card className="bg-gradient-card border-border shadow-card">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                              <ArrowDown className="w-5 h-5 text-vault-green" />
                              WithDraw Funds
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
                              <Label htmlFor="deposit-amount" className="text-foreground">Amount</Label>
                              <div className="relative">
                                <Input
                                  id="deposit-amount"
                                  placeholder="0.00"
                      value={depositAmount}
                      type='number'
                                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                                  className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-vault-green pr-16"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                                  SOL
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="secondary" 
                  className="w-full"
                  onClick={()=>withDrawToken("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr", merchantAddress)}
                            >
                              Withdraw
                            </Button>
                          </CardContent>
                        </Card>
    </div>
  )
}

export default WithDrawTokens
