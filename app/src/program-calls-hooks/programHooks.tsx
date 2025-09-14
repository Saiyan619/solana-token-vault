// Updated import to use @coral-xyz/anchor instead of @project-serum/anchor
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from '@/solana_escrow_vault.json';
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const PROGRAM_ID = new PublicKey("G331TXB6zv8bj2y9jnHpmdbokfKJgBZshb21ZNbdmCGt");

// Token addresses for different networks
const DEVNET_TOKENS = {
  USDC: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
  USDT: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS',
  SOL: 'So11111111111111111111111111111111111111112', // Wrapped SOL
};
// Define the parameter type for the mutation
interface InitializeVaultParams {
  mintAddress: string;
  targetUserAddress: string;
}

export const useCreateVault = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  
  const InitializeVault = async ({
    mintAddress,
    targetUserAddress,
  }: InitializeVaultParams) => {
        if (!wallet) {
            throw new Error("Wallet not connected");
        }



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

            console.log('Vault created successfully:', resultData);
            
            return resultData;

        } catch (error: any) {
            console.error('Failed to initialize vault:', error);
            throw error;
        }
    };

    const { mutateAsync: initializeNewVault, data, isPending, isSuccess, isError } = useMutation({
        mutationFn: InitializeVault,
        onSuccess: (data) => {
            // 'data' contains what you returned from InitializeVault function
            toast.success("Vault Created Successfully!", {
                description: `Transaction: ${data.signature}`,
                // Or use a Solana explorer link:
                action: {
                    label: "View on Explorer",
                    onClick: () => window.open(`https://explorer.solana.com/tx/${data.signature}?cluster=devnet`, '_blank')
                }
            });
        },
        onError: (error) => {
            console.error("Vault creation failed:", error.message);
            toast.error(`Failed to create vault. Please try again.: ${error.message}`);
        }
    });
    
    return { initializeNewVault, data, isPending, isSuccess, isError, wallet, connection };
}


