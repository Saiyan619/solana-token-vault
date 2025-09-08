import { useState } from 'react'
import {  ArrowDown, } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from '@/solana_escrow_vault.json';

const PROGRAM_ID = new PublicKey("G331TXB6zv8bj2y9jnHpmdbokfKJgBZshb21ZNbdmCGt");

const DepositToken = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [depositAmount, setDepositAmount] = useState(0);
        const [selectedToken, setSelectedToken] = useState('USDC');
        const [loading, setLoading] = useState(false);
        const [result, setResult] = useState<any>(null);
        const [error, setError] = useState<string>('');

    const handleDeposit = async (amount: number, mintAddress:string) => {
        if (!wallet) {
            console.error("Wallet not connected");
        }
        console.log("IDL initialize method:", idl.instructions.find((i: any) => i.name === "deposit"));
        try {
            console.log("Starting deposit of amount:", amount);
            const provider = new AnchorProvider(connection, wallet, {
                            commitment: "confirmed"
            });
            const program = new Program(idl as any, provider);
            const depositor = wallet.publicKey;
            const mintPubKey = new PublicKey(mintAddress);
            const [vaultInfoPDA] = await PublicKey.findProgramAddressSync([
                Buffer.from("vault_info"),
                depositor.toBuffer(),
                mintPubKey.toBuffer()
            ], PROGRAM_ID
            )

            const [vaultTokenPDA] = await PublicKey.findProgramAddressSync([
                Buffer.from("vault"),
                depositor.toBuffer(),
                 mintPubKey.toBuffer()
            ], PROGRAM_ID
          )
          
          const userTokenAccount = await getAssociatedTokenAddress(
            mintPubKey,
            depositor
          );

           const accountInfo = await connection.getTokenAccountsByOwner(depositor, {
        mint: mintPubKey
      });

      if (accountInfo.value.length === 0) {
        throw new Error(`No token account found for mint ${mintAddress}. Please create a token account and get some test tokens first.`);
      }

      // Use the first token account found (there should typically be only one ATA)
      const actualUserTokenAccount = accountInfo.value[0].pubkey;
      
      // Get account details to check balance
      const tokenAccountInfo = await connection.getTokenAccountBalance(actualUserTokenAccount);
      const balance = parseInt(tokenAccountInfo.value.amount);
      
      console.log(`Token account balance: ${balance}, trying to deposit: ${amount}`);
      
      if (balance < amount) {
        throw new Error(`Insufficient balance. You have ${balance} tokens, trying to deposit ${amount}. Please get more test tokens.`);
      }

          const tx = await program.methods.deposit(new BN(amount))
            .accounts({
              vaultInfo: vaultInfoPDA,          // vault_info account
              vaultTokenAcc: vaultTokenPDA,     // vault token account
              userTokenAccount: userTokenAccount, // user's token account
               mint: mintPubKey,
                              tokenProgram: TOKEN_PROGRAM_ID, // matches token_program in Rust
                              signer: wallet.publicKey,
                              rent: SYSVAR_RENT_PUBKEY,
                              systemProgram: SystemProgram.programId // matches system_program in Rust
            }).rpc();

    console.log('Deposit transaction signature:', tx);
    await connection.confirmTransaction(tx, 'confirmed');
        } catch (error) {
          console.error("Error during deposit:", error)
          throw error;
        }
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
                        variant="link" 
            className="w-full"
            onClick={()=>handleDeposit(depositAmount, "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr")}
                      >
                        deposit
                      </Button>
                    </CardContent>
                  </Card>
    </div>
  )
}

export default DepositToken
