import { useState } from 'react'
import { Handshake, Loader2Icon, } from 'lucide-react';
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
import { useSettleTokens } from '@/program-calls-hooks/programHooks';

const PROGRAM_ID = new PublicKey("G331TXB6zv8bj2y9jnHpmdbokfKJgBZshb21ZNbdmCGt");
const PLATFORM = new PublicKey("65rSM9vVip4U8TS4gZD2ovzWqrMr95kbdBg5Niv6GCWq");
const SettleTokens = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { settle, isPending } = useSettleTokens();
  const [depositAmount, setDepositAmount] = useState(0);
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [clientAddress, setClientAddress] = useState('');

  const handleSettleToken = async (mintAddress: string, clientAddress: string) => {
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
      const settlerPubKey = wallet.publicKey;
      const clientPubkey = new PublicKey(clientAddress.trim());
      const mintPubKey = new PublicKey(mintAddress);

      const [vaultInfoPDA] = await PublicKey.findProgramAddressSync([
        Buffer.from("vault_info"),
        settlerPubKey.toBuffer(),
        clientPubkey.toBuffer(),
        mintPubKey.toBuffer()
      ], PROGRAM_ID);
      const [vaultTokenPDA] = await PublicKey.findProgramAddressSync([
        Buffer.from("vault"),
        settlerPubKey.toBuffer(),
        clientPubkey.toBuffer(),
        mintPubKey.toBuffer()
      ], PROGRAM_ID
      )

      const merchantTokenAccount = await getAssociatedTokenAddress(
        mintPubKey,
        settlerPubKey
      )

      const platformTokenAccount = await getAssociatedTokenAddress(
        mintPubKey,
        PLATFORM
      )

      const tx = await program.methods.settlement().accounts({
        vaultInfo: vaultInfoPDA,
        vaultTokenAcc: vaultTokenPDA,
        merchantTokenAccount: merchantTokenAccount,
        platformTokenAccount: platformTokenAccount,
        targetAcc: clientPubkey,
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

  const handleSettlement = () => {
    settle({
      mintAddress: selectedToken,
      clientAddress: clientAddress
    })
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
          {isPending ?
            <Button variant="outline"
              className="w-full" disabled>
              <Loader2Icon className="animate-spin" />
              Please wait
            </Button> :
            <Button
              variant="default"
              className="w-full"
              onClick={handleSettlement}
            >
              Settle
            </Button>
          }

        </CardContent>
      </Card>
    </div>
  )
}

export default SettleTokens
