foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaCITransaction',
  extends: 'net.nanopay.tx.cico.CITransaction',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer',
    'java.util.Arrays',
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'String',
      name: 'confirmationLineNumber',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnCode',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnDate',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnType',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'padType'
    },
    {
      class: 'String',
      name: 'txnCode'
    },
    {
      class: 'String',
      name: 'description',
      visibility: foam.u2.Visibility.RO
    },
  ],

  methods: [
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          type: 'net.nanopay.tx.model.Transaction'
        },
      ],
      javaCode: `
        super.limitedCopyFrom(other);
        setConfirmationLineNumber(((AlternaCITransaction)other).getConfirmationLineNumber());
        setReturnCode(((AlternaCITransaction)other).getReturnCode());
        setReturnDate(((AlternaCITransaction)other).getReturnDate());
        setReturnType(((AlternaCITransaction)other).getReturnType());
        setPadType(((AlternaCITransaction)other).getPadType());
        setTxnCode(((AlternaCITransaction)other).getTxnCode());
        setDescription(((AlternaCITransaction)other).getDescription());
      `
    },
    {
      name: 'isActive',
      type: 'Boolean',
      javaCode: `
         return
           getStatus().equals(TransactionStatus.COMPLETED);
      `
    },

    {
      documentation: `Method to execute additional logic for each transaction before it was written to journals`,
      name: 'executeBeforePut',
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
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        Transaction ret = limitedClone(x, oldTxn);
        ret.validate(x);

        if ( canReverse(x, oldTxn) ) {
          this.createReverseTransaction(x);
        }
        return ret;
      `
    },
    {
     name: 'createReverseTransaction',
     args: [
       {
         name: 'x',
         type: 'Context'
       }
     ],
     javaCode: `
       DigitalTransaction revTxn = new DigitalTransaction.Builder(x)
        .setDestinationAccount(TrustAccount.find(x, findSourceAccount(x)).getId())
        .setSourceAccount(this.getDestinationAccount())
        .setAmount(this.getAmount())
        .setName("Reversal of: "+this.getId())
        .setIsQuoted(true)
        .build();

       revTxn.setOriginalTransaction(this.getId());
       try {
        revTxn = (DigitalTransaction) ((DAO) x.get("localTransactionDAO")).put_(x, revTxn);
        this.setReverseTransaction(revTxn.getId());
       }
       catch (Exception e) {
         Notification notification = new Notification();
         notification.setEmailIsEnabled(true);
         notification.setBody("Cash in transaction id: " + getId() + " was declined but failed to revert the balance.");
         notification.setNotificationType("Cashin transaction declined");
         notification.setGroupId("support");
         ((DAO) x.get("notificationDAO")).put(notification);
         this.setReverseTransaction(null);
       }

     `
    }
  ]
});
