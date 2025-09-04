use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use anchor_lang::solana_program::pubkey;
// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("G331TXB6zv8bj2y9jnHpmdbokfKJgBZshb21ZNbdmCGt");
// Add at the top of your program
const PLATFORM_WALLET: Pubkey = pubkey!("G331TXB6zv8bj2y9jnHpmdbokfKJgBZshb21ZNbdmCGt");

#[program]
mod solana_escrow_vault  {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, merchant:Pubkey,
    merchant_fee:u64,
    platform_fee:u64,
    ) -> Result<()> {
        let vault_info=&mut ctx.accounts.vault_info;
        vault_info.merchant=merchant;
        vault_info.amount=0;
        vault_info.merchant_fee=merchant_fee;
        vault_info.platform_fee=platform_fee;
        vault_info.mint=ctx.accounts.mint.key();
        vault_info.vault_token_account=ctx.accounts.vault_token_acc.key();
        vault_info.info_bump = ctx.bumps.vault_info;
        vault_info.vault_bump = ctx.bumps.vault_token_acc;
  msg!("==========================================");
    msg!("🚀 ESCROW VAULT INITIALIZED");
    msg!("==========================================");
    msg!("Merchant: {}", merchant);
    msg!("Mint: {}", ctx.accounts.mint.key());
    msg!("Vault Token Account: {}", ctx.accounts.vault_token_acc.key());
    msg!("Initial Amount: {}", vault_info.amount);
    msg!("Merchant Fee: {} basis points", merchant_fee);
    msg!("Platform Fee: {} basis points", platform_fee);
    msg!("Vault Bump: {}", ctx.bumps.vault_token_acc);
    msg!("Info Bump: {}", ctx.bumps.vault_info);
    msg!("Vault Token Balance: {} (should be 0 initially)", ctx.accounts.vault_token_acc.amount);
    msg!("==========================================");      
      Ok(())
    }

    pub fn deposit(ctx:Context<Deposit>, amount:u64)-> Result<()>{
        require!(ctx.accounts.user_token_account.amount >= amount, ErrorCode::Insufficientbalance);
        let cpi_account = Transfer{
            from: ctx.accounts.user_token_account.to_account_info(),
            to:ctx.accounts.vault_token_acc.to_account_info(),
            authority:ctx.accounts.signer.to_account_info()
        };
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_account), amount)?;
       let vault_info = &mut ctx.accounts.vault_info;
       vault_info.amount = vault_info.amount.checked_add(amount).unwrap();
      Ok(())
    }

    pub fn settlement(ctx:Context<Settlement>)->Result<()>{
                let vault_info = &ctx.accounts.vault_info;

         require!(
        ctx.accounts.vault_token_acc.amount >= vault_info.amount,
        ErrorCode::InsufficientVaultBalance
    );
       let total_amount = vault_info.amount;
    let merchant_amount = total_amount * vault_info.merchant_fee / 10000;
    let platform_amount = total_amount * vault_info.platform_fee / 10000;
   let signer_key = ctx.accounts.signer.key();
    let mint_key = ctx.accounts.mint.key();
    let bump = vault_info.vault_bump;
    
    let seeds = &[
        b"vault_info".as_ref(),
        signer_key.as_ref(),
        mint_key.as_ref(),  
        &[bump]             
    ];
      
        let cpi_accounts = Transfer{
            from: ctx.accounts.vault_token_acc.to_account_info(),
            to:ctx.accounts.merchant_token_account.to_account_info(),
            authority:ctx.accounts.vault_token_acc.to_account_info()
        };
        token::transfer (CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), 
        cpi_accounts, 
    &[seeds]), 
        merchant_amount)?;


    if vault_info.platform_fee > 0 {
        let cpi_accounts = Transfer{
        from:ctx.accounts.vault_token_acc.to_account_info(),
        to:ctx.accounts.platform_token_account.to_account_info(),
        authority:ctx.accounts.vault_token_acc.to_account_info()
    };

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
           &[seeds]
        ),
        platform_amount
    )?;}


        Ok(())
    }
}


#[derive(Accounts)]
pub struct Initialize<'info> {
#[account(init, payer = signer, 
seeds=[b"vault_info",signer.key().as_ref(), mint.key().as_ref()],
    bump,
    space = 8 + 32 * 4 + 8 * 3 + 2  )]
    pub vault_info: Account<'info, VaultInfo>,
    #[account(init,
    payer=signer,
    seeds=[b"vault", signer.key().as_ref(), mint.key().as_ref()],
    token::mint=mint,
    token::authority=vault_info,
    bump )]
    pub vault_token_acc:Account<'info,TokenAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    pub token_program:Program<'info, Token>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct Deposit<'info>{
    #[account(mut,
    seeds=[b"vault_info", signer.key().as_ref(),mint.key().as_ref()],
    bump=vault_info.info_bump)]
    vault_info:Account<'info, VaultInfo>,

    #[account(mut,
    seeds=[b"vault", signer.key().as_ref(),mint.key().as_ref()],
    bump=vault_info.vault_bump)]
    vault_token_acc:Account<'info, TokenAccount>,

    #[account(mut,
    constraint = user_token_account.owner == signer.key() @ ErrorCode::WrongUsertokenAccount,
    constraint = user_token_account.mint== mint.key()@ ErrorCode::IncorrectTokenType,
    constraint = vault_token_acc.mint == mint.key()@ ErrorCode::IncorrectTokenType )]
    user_token_account:Account<'info, TokenAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent:Sysvar<'info, Rent>
}

#[derive(Accounts)]
pub struct Settlement<'info>{
    #[account(mut,
        seeds=[b"vault_info", signer.key().as_ref(), mint.key().as_ref()],
        bump=vault_info.info_bump
    )]
    vault_info:Account<'info, VaultInfo>,
    #[account(mut,
        seeds=[b"vault", signer.key().as_ref(), mint.key().as_ref()],
        bump=vault_info.vault_bump 
    )]
    vault_token_acc:Account<'info, TokenAccount>,

    #[account(mut,
        constraint = merchant_token_account.owner==vault_info.merchant @ ErrorCode::WrongMerchantAcc,
        constraint= merchant_token_account.mint==mint.key() @ ErrorCode:: WrongMerchantToken
    )]
    merchant_token_account:Account<'info, TokenAccount>,

    #[account(mut,
        constraint=platform_token_account.owner==PLATFORM_WALLET @ ErrorCode::WrongPlatWallet,
        constraint = platform_token_account.mint == mint.key() @ ErrorCode::WrongPlatWalletToken
    )]
    platform_token_account:Account<'info, TokenAccount>,

    #[account(
        constraint=signer.key()== vault_info.merchant || signer.key()==PLATFORM_WALLET
        @ ErrorCode::Unauthorized
    )]
    signer:Signer<'info>,
    #[account(mut)]
    mint:Account<'info, Mint>,

    token_program:Program<'info, Token>,
    system_program:Program<'info, System>,
    rent: Sysvar<'info, Rent>
}


// #[account]
// pub struct Vault {
//     pub amount: u64
// }

#[account]
pub struct VaultInfo{
    merchant:Pubkey,
    merchant_fee:u64,
    platform_fee:u64,
    mint:Pubkey,
    amount:u64,
    vault_token_account:Pubkey,
    vault_bump: u8,
    info_bump: u8
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
}
