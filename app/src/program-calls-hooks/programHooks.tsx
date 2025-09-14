// Updated import to use @coral-xyz/anchor instead of @project-serum/anchor
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from '@/solana_escrow_vault.json';
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const PROGRAM_ID = new PublicKey("G331TXB6zv8bj2y9jnHpmdbokfKJgBZshb21ZNbdmCGt");


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

interface DepositParams {
    amount: number;
    mintAddress: string;
    merchantAddress: string
}
export const useDepositToVault = () => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const depositToVault = async ({ amount, mintAddress, merchantAddress }: DepositParams) => {
        if (!wallet) {
            console.error("Wallet not connected");
        }
        if (merchantAddress === "") {
            console.error("Merchant address is required");
        }
        console.log("IDL initialize method:", idl.instructions.find((i: any) => i.name === "deposit"));
        try {
            console.log("Starting deposit of amount:", amount);

            const provider = new AnchorProvider(connection, wallet, {
                commitment: "confirmed"
            });

            const program = new Program(idl as any, provider);
            const depositorPubKey = wallet.publicKey;
            const merchantPubKey = new PublicKey(merchantAddress.trim());
            const mintPubKey = new PublicKey(mintAddress);

            const [vaultInfoPDA] = await PublicKey.findProgramAddressSync([
                Buffer.from("vault_info"),
                merchantPubKey.toBuffer(),
                depositorPubKey.toBuffer(),
                mintPubKey.toBuffer()
            ], PROGRAM_ID
            )

            const [vaultTokenPDA] = await PublicKey.findProgramAddressSync([
                Buffer.from("vault"),
                merchantPubKey.toBuffer(),
                depositorPubKey.toBuffer(),
                mintPubKey.toBuffer()
            ], PROGRAM_ID
            )

            const userTokenAccount = await getAssociatedTokenAddress(
                mintPubKey,
                depositorPubKey
            );

            //      const accountInfo = await connection.getTokenAccountsByOwner(depositor, {
            //   mint: mintPubKey
            // });

            // if (accountInfo.value.length === 0) {
            //   throw new Error(`No token account found for mint ${mintAddress}. Please create a token account and get some test tokens first.`);
            // }

            // Use the first token account found (there should typically be only one ATA)
            // const actualUserTokenAccount = accountInfo.value[0].pubkey;

            // Get account details to check balance
            // const tokenAccountInfo = await connection.getTokenAccountBalance(actualUserTokenAccount);
            // const balance = parseInt(tokenAccountInfo.value.amount);

            // console.log(`Token account balance: ${balance}, trying to deposit: ${amount}`);

            // if (balance < amount) {
            //   throw new Error(`Insufficient balance. You have ${balance} tokens, trying to deposit ${amount}. Please get more test tokens.`);
            // }

            const tx = await program.methods.deposit(new BN(amount))
                .accounts({
                    vaultInfo: vaultInfoPDA,          // vault_info account
                    vaultTokenAcc: vaultTokenPDA,     // vault token account
                    userTokenAccount: userTokenAccount, // user's token account
                    mint: mintPubKey,
                    targetAcc: depositorPubKey,
                    tokenProgram: TOKEN_PROGRAM_ID, // matches token_program in Rust
                    signer: wallet.publicKey,
                    rent: SYSVAR_RENT_PUBKEY,
                    systemProgram: SystemProgram.programId // matches system_program in Rust
                }).rpc();

            await connection.confirmTransaction(tx, 'confirmed');
            console.log('Deposit transaction signature:', tx);

            return tx;
        } catch (error) {
            console.error("Error during deposit:", error)
            throw error;
        }
    }

    const { mutateAsync: deposit, data, isPending, isSuccess, isError } = useMutation({
        mutationFn: depositToVault,
        onSuccess: (data: any) => {
            // 'data' contains what you returned from InitializeVault function
            toast.success("Deposited Funds Successfully!", {
                description: `Transaction: ${data}`,
                // Or use a Solana explorer link:
                action: {
                    label: "View on Explorer",
                    onClick: () => window.open(`https://explorer.solana.com/tx/${data}?cluster=devnet`, '_blank')
                }
            });
        },
        onError: (error) => {
            console.error("Vault creation failed:", error.message);
            toast.error(`Failed to create vault. Please try again.: ${error.message}`);
        }
    });

    return { deposit, data, isPending, isSuccess, isError, wallet, connection };
}

interface WithDrawParams{
    mintAddress: string;
    merchantAddress: string;
}
export const useWithDrawTokens = () => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const withdrawTokens = async ({mintAddress, merchantAddress}:WithDrawParams) => {
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
                    Buffer.from("vault"),
                    merchantPubKey.toBuffer(),
                    withdrawerPubKey.toBuffer(),
                    mintPubKey.toBuffer()
                ], PROGRAM_ID);
        
              ///////im not done yet
              let userTokenAccount = await getAssociatedTokenAddress(
                mintPubKey,
                withdrawerPubKey
              )
              let merchantTokenAccount = await getAssociatedTokenAddress(
                mintPubKey,
                merchantPubKey
              )
              
              const tx = await program.methods.withdraw()
                .accounts({
                  vaultInfo: vaultInfoPDA,
                  vaultTokenAcc: vaultTokenPDA,
                  mint: mintPubKey,
                  targetAcc: withdrawerPubKey,
                  userTokenAccount: userTokenAccount,
                  merchantTokenAccount: merchantTokenAccount,
                  tokenProgram: TOKEN_PROGRAM_ID,
                  systemProgram: SystemProgram.programId,
                }).rpc();
              
                console.log("withdrw transaction signature", tx);
                return tx;
        
            } catch (error) {
                console.error("Error during withdrawal:", error);
                throw error;
                
            }
    }

    const { mutateAsync: withdraw, data, isPending, isSuccess, isError } = useMutation({
        mutationFn: withdrawTokens,
        onSuccess: (data: any) => {
            // 'data' contains what you returned from InitializeVault function
            toast.success("Deposited Funds Successfully!", {
                description: `Transaction: ${data}`,
                // Or use a Solana explorer link:
                action: {
                    label: "View on Explorer",
                    onClick: () => window.open(`https://explorer.solana.com/tx/${data}?cluster=devnet`, '_blank')
                }
            });
        },
        onError: (error) => {
            console.error("Vault creation failed:", error.message);
            toast.error(`Failed to create vault. Please try again.: ${error.message}`);
        }
    });

    return { withdraw, data, isPending, isSuccess, isError, wallet, connection };
}