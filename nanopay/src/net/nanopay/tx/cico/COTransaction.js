foam.CLASS({
  package: 'net.nanopay.tx.cico',
  name: 'COTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.TransactionLineItem',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'java.util.List',
    'java.util.ArrayList',
    'net.nanopay.liquidity.LiquidityService',
    'net.nanopay.account.Account'
  ],

  properties: [
    {
      name: 'name',
      factory: function() {
        return 'Cash Out';
      },
      javaFactory: `
        return "Cash Out";
      `
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'initialStatus',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      name: 'statusChoices',
      hidden: true,
      documentation: 'Returns available statuses for each transaction depending on current status',
      factory: function() {
        if ( this.status == this.TransactionStatus.COMPLETED ) {
          return [
            'choose status',
            ['DECLINED', 'DECLINED']
          ];
        }
        if ( this.status == this.TransactionStatus.SENT ) {
          return [
            'choose status',
            ['DECLINED', 'DECLINED'],
            ['COMPLETED', 'COMPLETED']
          ];
        }
        if ( this.status == this.TransactionStatus.PENDING ) {
          return [
            'choose status',
            ['PAUSED', 'PAUSED'],
            ['SENT', 'SENT'],
            ['COMPLETED', 'COMPLETED'],
            ['CANCELLED', 'CANCELLED']
          ];
        }
        if ( this.status == this.TransactionStatus.PAUSED ) {
          return [
            'choose status',
            ['PENDING', 'PENDING'],
            ['CANCELLED', 'CANCELLED']
         ];
        }
       return ['No status to choose'];
      }
    }
  ],

  methods: [
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          javaType: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
      super.limitedCopyFrom(other);
      setCompletionDate(other.getCompletionDate());
      setProcessDate(other.getProcessDate());
      `
    },
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaCode: `
      super.validate(x);

      if ( BankAccountStatus.UNVERIFIED.equals(((BankAccount)findDestinationAccount(x)).getStatus())) {
        throw new RuntimeException("Bank account must be verified");
      }
      Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
      if ( oldTxn != null && ( oldTxn.getStatus().equals(TransactionStatus.DECLINED) ||
            oldTxn.getStatus().equals(TransactionStatus.COMPLETED) ) &&
            ! getStatus().equals(TransactionStatus.DECLINED) ) {
        throw new RuntimeException("Unable to update COTransaction, if transaction status is accepted or declined. Transaction id: " + getId());
      }
      `
    },
    {
      documentation: `return true when status change is such that normal Transfers should be executed (applied)`,
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
      if ( getStatus() == TransactionStatus.COMPLETED && oldTxn == null ||
      getStatus() == TransactionStatus.PENDING &&
       ( oldTxn == null || oldTxn.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED || 
       oldTxn.getStatus() == TransactionStatus.PAUSED || oldTxn.getStatus() == TransactionStatus.SCHEDULED ) ) {
        return true;
      }
      return false;
      `
    },
    {
      documentation: `return true when status change is such that reversal Transfers should be executed (applied)`,
      name: 'canReverseTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
      if ( getStatus() == TransactionStatus.REVERSE && oldTxn != null && oldTxn.getStatus() != TransactionStatus.REVERSE ||
        getStatus() == TransactionStatus.DECLINED &&
        ( oldTxn != null &&
           ( oldTxn.getStatus() == TransactionStatus.SENT ||
             oldTxn.getStatus() == TransactionStatus.COMPLETED ||
             oldTxn.getStatus() == TransactionStatus.PENDING )
        ) ||
        getStatus() == TransactionStatus.PAUSED && oldTxn != null && oldTxn.getStatus() == TransactionStatus.PENDING ||
        getStatus() == TransactionStatus.CANCELLED && oldTxn != null && oldTxn.getStatus() == TransactionStatus.PENDING )  {
        return true;
      }
      return false;
      `
    },
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
      List all = new ArrayList();
      TransactionLineItem[] lineItems = getLineItems();

        if ( canTransfer(x, oldTxn) ) {
          for ( int i = 0; i < lineItems.length; i++ ) {
            TransactionLineItem lineItem = lineItems[i];
            Transfer[] transfers = lineItem.createTransfers(x, oldTxn, this, false);
            for ( int j = 0; j < transfers.length; j++ ) {
              all.add(transfers[j]);
            }
          }
          all.add(new Transfer.Builder(x)
            .setDescription(TrustAccount.find(x, findSourceAccount(x)).getName()+" Cash-Out")
            .setAccount(TrustAccount.find(x, findSourceAccount(x)).getId())
            .setAmount(getTotal())
            .build());
          all.add(new Transfer.Builder(x)
            .setDescription("Cash-Out")
            .setAccount(getSourceAccount())
            .setAmount(-getTotal())
            .build());
          Transfer[] transfers = getTransfers();
          for ( int i = 0; i < transfers.length; i++ ) {
            all.add(transfers[i]);
          }
        }
        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    },
    {
      documentation: `LiquidityService checks whether digital account has any min or/and max balance if so, does appropriate actions(cashin/cashout)`,
      name: 'checkLiquidity',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      LiquidityService ls = (LiquidityService) x.get("liquidityService");
      Account source = findSourceAccount(x);
      Account destination = findDestinationAccount(x);
      if ( ! SafetyUtil.equals(source.getOwner(), destination.getOwner()) && getStatus() == TransactionStatus.COMPLETED ) {
        ls.liquifyAccount(source.getId(), net.nanopay.liquidity.Frequency.PER_TRANSACTION, -getAmount());
      }
      `
    },
    {
      documentation: 'Checks if a Transaction needs to be reversed',
      name: 'canReverse',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'boolean',
      javaCode: `
        return ( this.getStatus() == TransactionStatus.DECLINED && oldTxn != null &&
          ( oldTxn.getStatus() == TransactionStatus.SENT || oldTxn.getStatus() == TransactionStatus.COMPLETED) ) ||
          ( this.getStatus() == TransactionStatus.CANCELLED && oldTxn != null &&
          ( oldTxn.getStatus() == TransactionStatus.PENDING || oldTxn.getStatus() == TransactionStatus.PAUSED ) );
      `
    }
  ]
});
