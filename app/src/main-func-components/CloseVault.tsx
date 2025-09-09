import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {  ClosedCaptionIcon, Handshake, ShieldClose } from 'lucide-react';
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from '@/solana_escrow_vault.json';
import { useState } from 'react';

const PROGRAM_ID = new PublicKey("G331TXB6zv8bj2y9jnHpmdbokfKJgBZshb21ZNbdmCGt");

const CloseVault = () => {
    const { connection } = useConnection();
          const wallet = useAnchorWallet();
          const [depositAmount, setDepositAmount] = useState(0);
          const [selectedToken, setSelectedToken] = useState('USDC');
              const [clientAddress, setClientAddress] = useState('');
          
                const [loading, setLoading] = useState(false);
                const [result, setResult] = useState<any>(null);
        const [error, setError] = useState<string>('');

    const closeVault = async (mintAddress:string, clientAddress:string) => {
        if(!wallet){
            console.error("Wallet is not connected");
        }
        if (clientAddress === "") {
            console.error("Merchant address is required");
        }

        console.log("Closing vault...");
        console.log("IDL initialize method:", idl.instructions.find((i: any) => i.name === "closevault"));
        try {
            const provider = new AnchorProvider(connection, wallet, {
                commitment: 'confirmed'
            });
            const program = new Program(idl as any, provider);
            const closerPubKey = wallet.publicKey;
            const clientPubkey = new PublicKey(clientAddress.trim());
            const mintPubKey = new PublicKey(mintAddress);

            const [vaultInfoPDA] = await PublicKey.findProgramAddressSync([
                Buffer.from("vault_info"),
                closerPubKey.toBuffer(),
                clientPubkey.toBuffer(),
                mintPubKey.toBuffer()
            ], PROGRAM_ID);

           
            
            const tx = await program.methods.closevault()
            .accounts({
                vaultInfo: vaultInfoPDA,
                                merchantTokenAccount: closerPubKey,
                                targetAcc: clientPubkey,
                                mint: mintPubKey,
                                tokenProgram: TOKEN_PROGRAM_ID,
                                rent: SYSVAR_RENT_PUBKEY,
                                systemProgram: SystemProgram.programId
            })
            .rpc();
            console.log("Vault closed successfully", tx);
            setResult("Vault closed successfully"); 
            
        } catch (error) {
            console.error("Error closing vaults:", error)
        }
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
                     
                      <Button 
                        variant="destructive" 
                            className="w-full"
                            onClick={()=>closeVault("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr", clientAddress)}
                      >
                        Close Vault
                      </Button>
                    </CardContent>
                  </Card>
    </div>
  )
}

export default CloseVault
