use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, CloseAccount};
use anchor_lang::solana_program::pubkey;
// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("G331TXB6zv8bj2y9jnHpmdbokfKJgBZshb21ZNbdmCGt");

const PLATFORM_WALLET: Pubkey = pubkey!("65rSM9vVip4U8TS4gZD2ovzWqrMr95kbdBg5Niv6GCWq");
const PLATFORM_FEE: u64 = 10;

#[program]
mod solana_escrow_vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault_info = &mut ctx.accounts.vault_info;
        vault_info.merchant = ctx.accounts.signer.key();
        vault_info.amount = 0;
        vault_info.mint = ctx.accounts.mint.key();
        vault_info.vault_token_account = ctx.accounts.vault_token_acc.key();
        vault_info.info_bump = ctx.bumps.vault_info;
        vault_info.vault_bump = ctx.bumps.vault_token_acc;
        vault_info.target_acc = ctx.accounts.target_acc.key();

        msg!("==========================================");
        msg!(" ESCROW VAULT INITIALIZED");
        msg!("==========================================");
        msg!("Merchant: {}", ctx.accounts.signer.key());
        msg!("Target User:{}", ctx.accounts.target_acc.key());
        msg!("Mint: {}", ctx.accounts.mint.key());
        msg!("Vault Token Account: {}", ctx.accounts.vault_token_acc.key());
        msg!("Initial Amount: {}", vault_info.amount);
        msg!("Platform Fee: {} basis points", PLATFORM_FEE);
        msg!("Vault Bump: {}", ctx.bumps.vault_token_acc);
        msg!("Info Bump: {}", ctx.bumps.vault_info);
        msg!(
            "Vault Token Balance: {} (should be 0 initially)",
            ctx.accounts.vault_token_acc.amount
        );
        msg!("==========================================");

        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.user_token_account.amount >= amount,
            ErrorCode::Insufficientbalance
        );

        let cpi_account = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_acc.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };

        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_account),
            amount,
        )?;

        let vault_info = &mut ctx.accounts.vault_info;
        vault_info.amount = vault_info.amount.checked_add(amount).unwrap();
        msg!("Deposited succesfully to {} vault", vault_info.merchant);
        msg!("Vault now holds {} tokens", vault_info.amount);
        Ok(())
    }

    pub fn settlement(ctx: Context<Settlement>) -> Result<()> {
        let vault_info = &ctx.accounts.vault_info;

        require!(
            ctx.accounts.vault_token_acc.amount >= vault_info.amount,
            ErrorCode::InsufficientVaultBalance
        );

        let total_amount = vault_info.amount;
        let platform_amount = total_amount * PLATFORM_FEE / 100;
        let merchant_amount = total_amount - platform_amount;

        let signer_key = ctx.accounts.signer.key();
        let mint_key = ctx.accounts.mint.key();
        let bump = vault_info.vault_bump;
        let target_acc = ctx.accounts.target_acc.key();

        let seeds = &[
            b"vault",
            vault_info.merchant.as_ref(),
            target_acc.as_ref(),
            mint_key.as_ref(),
            &[bump],
        ];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_acc.to_account_info(),
            to: ctx.accounts.merchant_token_account.to_account_info(),
            authority: ctx.accounts.vault_info.to_account_info(),
        };

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                &[seeds],
            ),
            merchant_amount,
        )?;

        if PLATFORM_FEE > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.vault_token_acc.to_account_info(),
                to: ctx.accounts.platform_token_account.to_account_info(),
                authority: ctx.accounts.vault_info.to_account_info(),
            };

            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    cpi_accounts,
                    &[seeds],
                ),
                platform_amount,
            )?;
        }

        let vault_info_mut = &mut ctx.accounts.vault_info;
        vault_info_mut.amount = 0;

        msg!(
            "Settlement completed - Platform: {}, Merchant: {}",
            platform_amount,
            merchant_amount
        );

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let vault_info = &ctx.accounts.vault_info;
        let bump = vault_info.vault_bump;
        let signer = &ctx.accounts.signer;
        let mint = &ctx.accounts.mint.key();
        let target_acc = ctx.accounts.target_acc.key();


        require!(
            ctx.accounts.signer.key() != vault_info.merchant,
            ErrorCode::MerchantUnauthorized
        );
        require!(
            ctx.accounts.target_acc.key() == signer.key(),
            ErrorCode::Unauthorized
        );
        require!(
            ctx.accounts.user_token_account.owner == ctx.accounts.signer.key(),
            ErrorCode::UnauthorizedUser
        );

        let vault_balance = ctx.accounts.vault_token_acc.amount;
        require!(vault_balance > 0, ErrorCode::VaultEmpty);

        // Applied 50% penalty
        let refund_amount = vault_balance.checked_div(2).unwrap(); // 50% refund
        let penalty_amount = vault_balance.checked_sub(refund_amount).unwrap(); // other 50%

        let seeds = &[
            b"vault",
            vault_info.merchant.as_ref(),
            target_acc.as_ref(),
            mint.as_ref(),
            &[bump],
        ];

        let cpi_accounts_refund = Transfer {
            from: ctx.accounts.vault_token_acc.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault_info.to_account_info(),
        };

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts_refund,
                &[seeds],
            ),
            refund_amount,
        )?;

        let cpi_accounts_penalty = Transfer {
            from: ctx.accounts.vault_token_acc.to_account_info(),
            to: ctx.accounts.merchant_token_account.to_account_info(),
            authority: ctx.accounts.vault_info.to_account_info(),
        };

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts_penalty,
                &[seeds],
            ),
            penalty_amount,
        )?;
        let vault_info_mut = &mut ctx.accounts.vault_info;
        vault_info_mut.amount = 0;
        msg!("Funds for {} as been successfully withdrawn with a penalty of 50% deficit", target_acc);
        msg!("funds removed: {}", refund_amount);
        Ok(())
    }

    pub fn closevault(ctx: Context<CloseVault>) -> Result<()> {
        let vault_info = &ctx.accounts.vault_info;
        let target_acc = &ctx.accounts.target_acc.key();

        // Only merchant can close their vault
        require!(
            ctx.accounts.signer.key() == vault_info.merchant,
            ErrorCode::Unauthorized
        );

        // Vault must be empty before closing
        require!(
            ctx.accounts.vault_token_acc.amount == 0,
            ErrorCode::VaultNotEmpty
        );

        let bump = vault_info.info_bump;
        let mint = &ctx.accounts.mint.key();

        let cpi_accounts = CloseAccount {
            account: ctx.accounts.vault_token_acc.to_account_info(),
            destination: ctx.accounts.signer.to_account_info(),
            authority: ctx.accounts.vault_info.to_account_info(),
        };

        let seeds = &[
            b"vault_info",
            vault_info.merchant.as_ref(),
            target_acc.as_ref(),
            mint.as_ref(),
            &[bump],
        ];

        token::close_account(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            &[seeds],
        ))?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = signer,
        seeds = [
            b"vault_info",
            signer.key().as_ref(),
            target_acc.key().as_ref(),
            mint.key().as_ref()
        ],
        bump,
        space = 8 + 32 * 4 + 8 * 3 + 2
    )]
    pub vault_info: Account<'info, VaultInfo>,

    #[account(
        init,
        payer = signer,
        seeds = [
            b"vault",
            signer.key().as_ref(),
            target_acc.key().as_ref(),
            mint.key().as_ref()
        ],
        token::mint = mint,
        token::authority = vault_info,
        bump
    )]
    pub vault_token_acc: Account<'info, TokenAccount>,

      /// CHECK: This is the target user account that will own the vault with the merchant. 
    /// We validate its relationship through PDA derivation constraints.
    pub target_acc: AccountInfo<'info>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [
            b"vault_info",
            vault_info.merchant.as_ref(),
            target_acc.key().as_ref(),
            mint.key().as_ref()
        ],
        bump = vault_info.info_bump,
        constraint = vault_info.target_acc == signer.key() @ ErrorCode::WrongTargetVault
    )]
    vault_info: Account<'info, VaultInfo>,

    #[account(
        mut,
        seeds = [
            b"vault",
            vault_info.merchant.as_ref(),
            target_acc.key().as_ref(),
            mint.key().as_ref()
        ],
        bump = vault_info.vault_bump
    )]
    vault_token_acc: Account<'info, TokenAccount>,

    /// CHECK: Validated by constraint that ensures it matches vault_info.target_acc
    /// and through PDA derivation seeds.
    target_acc: AccountInfo<'info>,

    #[account(
        mut,
        constraint = user_token_account.owner == signer.key() @ ErrorCode::WrongUsertokenAccount,
        constraint = user_token_account.mint == mint.key() @ ErrorCode::IncorrectTokenType,
        constraint = vault_token_acc.mint == mint.key() @ ErrorCode::IncorrectTokenType
    )]
    user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Settlement<'info> {
    #[account(
        mut,
        seeds = [
            b"vault_info",
            vault_info.merchant.as_ref(),
            target_acc.key().as_ref(),
            mint.key().as_ref()
        ],
        bump = vault_info.info_bump,
       constraint = signer.key() == vault_info.merchant @ ErrorCode::WrongTargetVault
    )]
    vault_info: Account<'info, VaultInfo>,

    #[account(
        mut,
        seeds = [
            b"vault",
            vault_info.merchant.as_ref(),
            target_acc.key().as_ref(),
            mint.key().as_ref()
        ],
        bump = vault_info.vault_bump
    )]
    vault_token_acc: Account<'info, TokenAccount>,
 /// CHECK: Validated by constraint that ensures it matches vault_info.target_acc
    /// and through PDA derivation seeds.
    target_acc: AccountInfo<'info>,

    #[account(
        mut,
        constraint = merchant_token_account.owner == vault_info.merchant @ ErrorCode::WrongMerchantAcc,
        constraint = merchant_token_account.mint == mint.key() @ ErrorCode::WrongMerchantToken
    )]
    merchant_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = platform_token_account.owner == PLATFORM_WALLET @ ErrorCode::WrongPlatWallet,
        constraint = platform_token_account.mint == mint.key() @ ErrorCode::WrongPlatWalletToken
    )]
    platform_token_account: Account<'info, TokenAccount>,

    #[account(
        constraint = signer.key() == vault_info.merchant || signer.key() == PLATFORM_WALLET @ ErrorCode::Unauthorized
    )]
    signer: Signer<'info>,

    #[account(mut)]
    mint: Account<'info, Mint>,

    token_program: Program<'info, Token>,

    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [
            b"vault_info",
            vault_info.merchant.as_ref(),
            target_acc.key().as_ref(),
            mint.key().as_ref()
        ],
        bump = vault_info.info_bump,
        constraint = signer.key() == vault_info.target_acc @ ErrorCode::Unauthorized
    )]
    vault_info: Account<'info, VaultInfo>,

    #[account(
        mut,
        seeds = [
            b"vault",
            vault_info.merchant.as_ref(),
            target_acc.key().as_ref(),
            mint.key().as_ref()
        ],
        bump = vault_info.vault_bump
    )]
    vault_token_acc: Account<'info, TokenAccount>,
 /// CHECK: Validated by constraint that ensures it matches vault_info.target_acc
    /// and through PDA derivation seeds.
    target_acc: AccountInfo<'info>,

    #[account(
        mut,
        constraint = signer.key() == user_token_account.owner @ ErrorCode::UnauthorizedUser,
        constraint = user_token_account.mint == mint.key() @ ErrorCode::IncorrectTokenType
    )]
    user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = merchant_token_account.owner == vault_info.merchant @ ErrorCode::WrongMerchantAcc,
        constraint = merchant_token_account.mint == mint.key() @ ErrorCode::WrongMerchantToken
    )]
    merchant_token_account: Account<'info, TokenAccount>,

    signer: Signer<'info>,

    mint: Account<'info, Mint>,

    token_program: Program<'info, Token>,
    
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseVault<'info> {
    #[account(
        mut,
        seeds = [
            b"vault_info",
            vault_info.merchant.as_ref(),
            target_acc.key().as_ref(),
            mint.key().as_ref()
        ],
        bump = vault_info.info_bump,
        constraint = vault_info.merchant == signer.key() @ ErrorCode::WrongTargetVault
    )]
    vault_info: Account<'info, VaultInfo>,

    #[account(
        mut,
        seeds = [
            b"vault",
            vault_info.merchant.as_ref(),
            target_acc.key().as_ref(),
            mint.key().as_ref()
        ],
        bump = vault_info.vault_bump
    )]
    vault_token_acc: Account<'info, TokenAccount>,
 /// CHECK: Validated by constraint that ensures it matches vault_info.target_acc
    /// and through PDA derivation seeds.
    target_acc: AccountInfo<'info>,

    #[account(mut)]
    signer: Signer<'info>,

    mint: Account<'info, Mint>,

    token_program: Program<'info, Token>,

    system_program: Program<'info, System>,
}

#[account]
pub struct VaultInfo {
    merchant: Pubkey,
    target_acc: Pubkey,
    mint: Pubkey,
    amount: u64,
    vault_token_account: Pubkey,
    vault_bump: u8,
    info_bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Wrong user token account!!")]
    WrongUsertokenAccount,
    #[msg("Incorrect token type provided for this vault")]
    IncorrectTokenType,
    #[msg("Insufficient balance!!")]
    Insufficientbalance,
    #[msg("wrong merchant Account!!")]
    WrongMerchantAcc,
    #[msg("wrong platform wallet")]
    WrongPlatWallet,
    #[msg("wrong platform token")]
    WrongPlatWalletToken,
    #[msg("wrong merchant token")]
    WrongMerchantToken,
    #[msg("unauthorized settler")]
    Unauthorized,
    #[msg("Insufficient vault balance")]
    InsufficientVaultBalance,
    #[msg("Unauthorized user")]
    UnauthorizedUser,
    #[msg("merchants are not allowed to withdraw")]
    MerchantUnauthorized,
    #[msg("Vault must be empty before closing")]
    VaultNotEmpty,
    #[msg("Vault is empty")]
    VaultEmpty,
    #[msg("Wrong Vault")]
    WrongTargetVault,
}