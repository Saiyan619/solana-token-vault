import { useState } from 'react'
import {  Handshake, } from 'lucide-react';
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
const SettleTokens = () => {
    const { connection } = useConnection();
      const wallet = useAnchorWallet();
      const [depositAmount, setDepositAmount] = useState(0);
            const [selectedToken, setSelectedToken] = useState('USDC');
            const [loading, setLoading] = useState(false);
            const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string>('');
    
    const handleSettleToken = async (mintAddress:string) => {
        if (!wallet) {
            console.error("wallet not connected!!!")
        }
        console.log("settle boys.....")
        try {
                    console.log("stil...settle boys.....")

            console.log("IDL initialize method:", idl.instructions.find((i: any) => i.name === "settlement"));
            const provider = new AnchorProvider(connection, wallet, {
                commitment: "confirmed"
            });

            const program = new Program(idl as any, provider);
            const settler = wallet.publicKey;
            const mintPubKey = new PublicKey(mintAddress);
            const [vaultInfoPDA] = await PublicKey.findProgramAddressSync([
                Buffer.from("vault_info"),
                settler.toBuffer(),
                mintPubKey.toBuffer()
            ], PROGRAM_ID);
            const [vaultTokenPDA] = await PublicKey.findProgramAddressSync([
                Buffer.from("vault"),
                settler.toBuffer(),
                 mintPubKey.toBuffer()
            ], PROGRAM_ID
          )

            const merchantTokenAccount = await getAssociatedTokenAddress(
                mintPubKey,
                settler
          )

             const platformTokenAccount = await getAssociatedTokenAddress(
                mintPubKey,
                PROGRAM_ID
          )

            const tx = await program.methods.settlement().accounts({
                vaultInfo: vaultInfoPDA,
                vaultTokenAcc: vaultTokenPDA,
                merchantTokenAccount: merchantTokenAccount,
                platformTokenAccount:platformTokenAccount,
                mint: mintPubKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
                systemProgram: SystemProgram.programId
            }).rpc();
            console.log("setlement transaction signature:", tx);

        } catch (error) {
            console.error("Error settling token:", error);
            throw error;
        }
    }
  return (
    <div>
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
                      onClick={()=>handleSettleToken("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr")}
                >
                  Settle
                </Button>
              </CardContent>
            </Card>
    </div>
  )
}

export default SettleTokens
