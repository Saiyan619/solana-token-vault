     const transactions = [
    { 
      type: 'Deposit', 
      amount: '100.0 SOL', 
      status: 'Completed', 
      time: '2 mins ago', 
      hash: '8xF2...9pLm',
      typeColor: 'green',
      icon: ArrowDown
    },
    { 
      type: 'Settlement', 
      amount: '95.0 SOL', 
      status: 'Pending', 
      time: '1 hour ago', 
      hash: '7kR8...4nQw',
      typeColor: 'purple',
      icon: Handshake
    },
    { 
      type: 'Initialize', 
      amount: '0.1 SOL', 
      status: 'Completed', 
      time: '2 days ago', 
      hash: '9xF2...4pLm',
      typeColor: 'blue',
      icon: Rocket
    }
  ];
  
   {/* Vault History */}
        {/* <Card className="mb-8 bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <History className="w-5 h-5 text-vault-blue" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Transaction
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <TransactionRow key={index} {...tx} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card> */}