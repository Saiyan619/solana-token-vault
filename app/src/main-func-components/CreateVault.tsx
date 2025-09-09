import { useState } from 'react'
import {PlusCircle} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Updated import to use @coral-xyz/anchor instead of @project-serum/anchor
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from '@/solana_escrow_vault.json';

const PROGRAM_ID = new PublicKey("G331TXB6zv8bj2y9jnHpmdbokfKJgBZshb21ZNbdmCGt");

// Token addresses for different networks
const DEVNET_TOKENS = {
  USDC: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
  USDT: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS',
  SOL: 'So11111111111111111111111111111111111111112', // Wrapped SOL
};

const CreateVault = () => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [clientAddress, setClientAddress] = useState('');
    const [selectedToken, setSelectedToken] = useState('USDC');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string>('');

    const InitializeVault = async (
        mintAddress: string,
        targetUserAddress: string,
        // merchantAddress:string
    ) => {
        if (!wallet) {
            throw new Error("Wallet not connected");
        }

        setLoading(true);
        setError('');
        setResult(null);

        console.log("Initializing vault with coral-xyz/anchor...");
        console.log("IDL initialize method:", idl.instructions.find((i: any) => i.name === "initialize"));

        try {
            console.log("Wallet public key:", wallet.publicKey.toBase58());
            console.log("Mint address:", mintAddress);
            console.log("Client address:", targetUserAddress);
            console.log("Merchant address:", wallet.publicKey.toBase58());

            // Create provider with coral-xyz/anchor
            const provider = new AnchorProvider(connection, wallet, {
                commitment: "confirmed"
            });

            //Create program instance
          const program = new Program(idl as any, provider);
          
            const mintPubkey = new PublicKey(mintAddress);
            // const merchantPubkey = merchantAddress 
            //     ? new PublicKey(merchantAddress)
            //     : wallet.publicKey;
            const userPubkey = new PublicKey(targetUserAddress.trim());

            // Derive PDAs using sync method (more efficient in newer versions)
            const [vaultInfoPDA] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("vault_info"),
                    wallet.publicKey.toBuffer(),
                    userPubkey.toBuffer(),
                    mintPubkey.toBuffer()
                ],
                PROGRAM_ID
            );

            const [vaultTokenPDA] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("vault"),
                    wallet.publicKey.toBuffer(),
                    userPubkey.toBuffer(),
                    mintPubkey.toBuffer()
                ],
                PROGRAM_ID
            );

            console.log('Derived addresses:');
            console.log('Vault Info PDA:', vaultInfoPDA.toBase58());
            console.log('Vault Token PDA:', vaultTokenPDA.toBase58());

            
            // Important reminder to myself!!: Rust struct uses snake_case, but the client expects camelCase
            const tx = await program.methods.initialize().accounts({
                // These account names must match your Rust Initialize struct
                vaultInfo: vaultInfoPDA,        // matches vault_info in Rust
                vaultTokenAcc: vaultTokenPDA,   // matches vault_token_acc in Rust
                mint: mintPubkey,
                targetAcc: userPubkey,
                tokenProgram: TOKEN_PROGRAM_ID, // matches token_program in Rust
                signer: wallet.publicKey,
                systemProgram: SystemProgram.programId // matches system_program in Rust
            }).rpc();

            console.log('Transaction signature:', tx);
            
            // Wait for confirmation
            await connection.confirmTransaction(tx, 'confirmed');

            const resultData = {
                signature: tx,
                vaultInfoAddress: vaultInfoPDA.toBase58(),
                vaultTokenAddress: vaultTokenPDA.toBase58()
            };

            setResult(resultData);
            console.log('Vault created successfully:', resultData);
            
            return resultData;

        } catch (error: any) {
            console.error('Failed to initialize vault:', error);
            setError(error.message || 'Failed to create vault');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleCreateVault = async () => {
        // if (!merchantFee || !platformFee) {
        //     setError('Please enter both merchant fee and platform fee');
        //     return;
        // }

        // Convert percentage to basis points (multiply by 100)
        // const merchantFeeBasisPoints = Math.round(parseFloat(merchantFee) * 100);
        // const platformFeeBasisPoints = Math.round(parseFloat(platformFee) * 100);

        // Get the mint address based on selected token
        const mintAddress = DEVNET_TOKENS[selectedToken as keyof typeof DEVNET_TOKENS];

        try {
            await InitializeVault(
                mintAddress,
                clientAddress,
            );
        } catch (error) {
            // Error is already handled in InitializeVault
        }
    };

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

                    {/* <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="merchant-fee" className="text-foreground">
                                Merchant Fee (%)
                            </Label>
                            <Input
                                id="merchant-fee"
                                placeholder="2.5"
                                value={merchantFee}
                                onChange={(e) => setMerchantFee(e.target.value)}
                                className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-vault-purple"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="platform-fee" className="text-foreground">
                                Platform Fee (%)
                            </Label>
                            <Input
                                id="platform-fee"
                                placeholder="1.0"
                                value={platformFee}
                                onChange={(e) => setPlatformFee(e.target.value)}
                                className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-vault-purple"
                            />
                        </div>
                    </div> */}

                    <div className="space-y-2">
                        <Label className="text-foreground">Token Type</Label>
                        <Select value={selectedToken} onValueChange={setSelectedToken}>
                            <SelectTrigger className="bg-background/50 border-border text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USDC">USDC (Devnet)</SelectItem>
                                <SelectItem value="USDT">USDT (Devnet)</SelectItem>
                                <SelectItem value="SOL">Wrapped SOL</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button 
                        variant="default" 
                        className="w-full"
                        onClick={handleCreateVault}
                        disabled={loading || !wallet}
                    >
                        {loading ? 'Creating Vault...' : 'Create Vault'}
                    </Button>

                    {/* Success Message */}
                    {result && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <h3 className="text-green-400 font-medium mb-2">✅ Vault Created Successfully!</h3>
                            <div className="space-y-1 text-sm text-green-300">
                                <p><strong>Transaction:</strong> {result.signature}</p>
                                <p><strong>Vault Info:</strong> {result.vaultInfoAddress}</p>
                                <p><strong>Vault Token Account:</strong> {result.vaultTokenAddress}</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <h3 className="text-red-400 font-medium mb-2">❌ Error</h3>
                            <p className="text-sm text-red-300">{error}</p>
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