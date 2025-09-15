import { useState } from 'react';
import { Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from '@solana/web3.js';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from '@/solana_escrow_vault.json';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';


const PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROGRAM_ID);


const VaultDetails = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [clientAddress, setClientAddress] = useState('');
  const [merchantAddress, setMerchantAddress] = useState('');
  const [vaultBalance, setvaultBalance] = useState(null)

  const getVaultDetails = async (merchantAddress: string, clientAddress: string, mintAddress: string) => {
    if (!wallet) {
      console.error("Wallet is not connected");
      return;
    }
    if (clientAddress === "" && merchantAddress === "") {
      console.error("client and merchant address are required");
    }

    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed'
    });

    const program = new Program(idl as any, provider);

    const merchantPubKey = new PublicKey(merchantAddress.trim());
    const clientPubkey = new PublicKey(clientAddress.trim());
    const mintPubKey = new PublicKey(mintAddress.trim());

    const [vaultInfoPDA] = await PublicKey.findProgramAddressSync([
      Buffer.from("vault_info"),
      merchantPubKey.toBuffer(),
      clientPubkey.toBuffer(),
      mintPubKey.toBuffer()
    ], PROGRAM_ID);

    try {
      console.log("fetching vault details......");
      const vaultInfoAccount = await(program.account as any).vaultInfo.fetch(vaultInfoPDA);
      console.log("Vault Info Account found:", vaultInfoAccount);
      console.log("Vaukt Address:", vaultInfoPDA.toBase58());
      console.log("Stored amount:", vaultInfoAccount.amount.toString());
      setvaultBalance(vaultInfoAccount.amount.toString());
      console.log("Stored merchant:", vaultInfoAccount.merchant.toString());
      console.log("Stored target:", vaultInfoAccount.targetAcc.toString());
    } catch (error) {
      console.error("Error fetching vault details:", error);
      throw error;
    }
  }
  return (
    <div>
      <div>
        <h2>Get Current Vault Details</h2>
        <div>
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

          <Button className='mt-5' onClick={() => { getVaultDetails( merchantAddress, clientAddress, "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") }}>Get Vault Details</Button>


        </div>
      </div>
      <Card className="bg-gradient-card border-border shadow-card mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Info className="w-5 h-5 text-vault-orange" />
            Current Vault Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* <div>
                <span className="text-muted-foreground text-sm">Vault Address:</span>
                <p className="font-mono text-foreground">9xF2...4pLm</p>
              </div> */}
              <div>
                <span className="text-muted-foreground text-sm">Merchant:</span>
                <p className="font-mono text-foreground">5kR8...9nQw</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Token Mint:</span>
                <p className="text-foreground">USDC</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Current Balance:</span>
                <p className="font-mono text-vault-green font-semibold text-2xl">{vaultBalance} USDC</p>
              </div>
            </div>
            <div className="space-y-4">

              {/* <div>
                <span className="text-muted-foreground text-sm">Status:</span>
                <Badge variant="default" className="ml-2">Active</Badge>
              </div> */}
              {/* <div>
                <span className="text-muted-foreground text-sm">Created:</span>
                <p className="text-foreground">2 days ago</p>
              </div> */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VaultDetails
