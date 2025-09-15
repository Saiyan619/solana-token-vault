import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {  ClosedCaptionIcon, Handshake, Loader2Icon, ShieldClose } from 'lucide-react';
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from '@/solana_escrow_vault.json';
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

const PROGRAM_ID = new PublicKey("G331TXB6zv8bj2y9jnHpmdbokfKJgBZshb21ZNbdmCGt");

const CloseVault = () => {
    const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { close, isPending } = useCLoseVault();
          const [depositAmount, setDepositAmount] = useState(0);
          const [selectedToken, setSelectedToken] = useState('USDC');
              const [clientAddress, setClientAddress] = useState('');
          
                const [loading, setLoading] = useState(false);
                const [result, setResult] = useState<any>(null);
        const [error, setError] = useState<string>('');

    const closeVault = async (mintAddress: string, clientAddress: string) => {
    if (!wallet) {
        console.error("Wallet is not connected");
        return;
    }
    if (clientAddress === "") {
        console.error("Client address is required");
        return;
    }
    
    console.log("Closing vault...");
    console.log("Mint Address:", mintAddress);
    console.log("Client Address:", clientAddress);
    console.log("Wallet (Merchant) Address:", wallet.publicKey.toString());
    
    try {
        const provider = new AnchorProvider(connection, wallet, {
            commitment: 'confirmed'
        });
        const program = new Program(idl as any, provider);
        
        const merchantPubKey = wallet.publicKey;
        const clientPubkey = new PublicKey(clientAddress.trim());
        const mintPubKey = new PublicKey(mintAddress.trim());

        // Generate PDAs
        const [vaultInfoPDA] = await PublicKey.findProgramAddressSync([
            Buffer.from("vault_info"),
            merchantPubKey.toBuffer(),
            clientPubkey.toBuffer(),
            mintPubKey.toBuffer()
        ], PROGRAM_ID);

        const [vaultTokenPDA] = await PublicKey.findProgramAddressSync([
            Buffer.from("vault"),
            merchantPubKey.toBuffer(),
            clientPubkey.toBuffer(),
            mintPubKey.toBuffer()
        ], PROGRAM_ID);

        console.log("Vault Info PDA:", vaultInfoPDA.toString());
        console.log("Vault Token PDA:", vaultTokenPDA.toString());

        // Check if accounts exist before trying to close
        try {
            const vaultInfoAccount = await program.account.vaultInfo.fetch(vaultInfoPDA);
            console.log("Vault Info Account found:", vaultInfoAccount);
            console.log("Stored amount:", vaultInfoAccount.amount.toString());
            console.log("Stored merchant:", vaultInfoAccount.merchant.toString());
            console.log("Stored target:", vaultInfoAccount.targetAcc.toString());
        } catch (error) {
            console.error("Vault Info Account not found:", error);
            setResult("Error: Vault Info account not found. Make sure the vault exists.");
            return;
        }

        try {
            const vaultTokenAccount = await connection.getAccountInfo(vaultTokenPDA);
            if (!vaultTokenAccount) {
                console.error("Vault Token Account not found at PDA:", vaultTokenPDA.toString());
                setResult("Error: Vault Token account not found. Make sure the vault was properly initialized.");
                return;
            }
            console.log("Vault Token Account found");
            
            // Get token account info
            const tokenAccountInfo = await connection.getTokenAccountBalance(vaultTokenPDA);
            console.log("Token account balance:", tokenAccountInfo.value.amount);
            
            if (tokenAccountInfo.value.amount !== "0") {
                console.error("Vault is not empty. Balance:", tokenAccountInfo.value.amount);
                setResult("Error: Vault must be empty before closing. Current balance: " + tokenAccountInfo.value.amount);
                return;
            }
        } catch (error) {
            console.error("Error checking vault token account:", error);
            setResult("Error: Could not verify vault token account");
            return;
        }

        // If we get here, both accounts exist and vault is empty
        console.log("All checks passed. Attempting to close vault...");

        const tx = await program.methods.closevault()
            .accounts({
                vaultInfo: vaultInfoPDA,
                vaultTokenAcc: vaultTokenPDA,
                targetAcc: clientPubkey,
                signer: merchantPubKey,
                mint: mintPubKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .rpc();
            
        console.log("Vault closed successfully", tx);
        setResult("Vault closed successfully. Transaction: " + tx);
        
    } catch (error) {
        console.error("Error closing vault:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        setResult("Error closing vault: " + (error as Error).message);
    }
}

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
