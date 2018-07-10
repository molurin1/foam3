package net.nanopay.cico.service;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.nanos.auth.User;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.mlang.MLang;
import java.util.Date;
import java.util.List;
import net.nanopay.bank.BankAccount;
import net.nanopay.tx.model.Transaction;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;

public class CICOTransactionDAO
  extends ProxyDAO
{

  public CICOTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public CICOTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction transaction = (Transaction) obj;

    if ( transaction.getType() != TransactionType.CASHOUT && transaction.getType() != TransactionType.CASHIN && transaction.getType() != TransactionType.VERIFICATION ) {
      return super.put_(x, obj);
    }

    if ( transaction.getPaymentAccountInfo() != null ) {
      return getDelegate().put_(x, obj);
    }

    if ( transaction.getBankAccountId() == null ) {
      throw new RuntimeException("Invalid bank account");
    }

    //For cico, there is a transaction between the same acccount
    if ( transaction.getDestinationAccount() == 0 &&  transaction.getSourceAccount() != 0 ) {
      transaction.setDestinationAccount(transaction.getSourceAccount());
    } else if ( transaction.getSourceAccount() == 0 &&  transaction.getDestinationAccount() != 0 ) {
      transaction.setSourceAccount(transaction.getDestinationAccount());
    }

    try {
      if ( getDelegate().find_(x, transaction) == null ) transaction.setStatus(TransactionStatus.PENDING);
      // Change later to check whether payeeId or payerId are ACTIVE brokers to set CASHIN OR CASHOUT...
      if ( transaction.getType() == null ) {
        transaction.setType(TransactionType.CASHOUT);
      }

      return getDelegate().put_(x, transaction);
    } catch (RuntimeException e) {
      throw e;
    }
  }

  public FObject addInvoiceCashout(FObject obj) {

    Transaction transaction = (Transaction) obj;
    //DAO standardCICOTransactionDAO = (DAO) getX().get("standardCICOTransactionDAO");
    DAO bankAccountDAO = (DAO) getX().get("localAccountDAO");
    DAO userDAO = (DAO) getX().get("localUserDAO");

    long payeeId = transaction.getSourceAccount();
    long payerId = transaction.getSourceAccount();
    User payee = (User) userDAO.find(transaction.getDestinationAccount());
    long total = transaction.getTotal();
    payee.setX(getX());

    Sink sinkBank = new ArraySink();
    sinkBank = bankAccountDAO.inX(getX()).where(MLang.EQ(BankAccount.OWNER, payee.getId())).limit(1).select(sinkBank);

    List dataBank = ((ArraySink) sinkBank).getArray();
    BankAccount bankAccountPayee = (BankAccount) dataBank.get(0);

    // Cashout invoice payee
    Transaction t = new Transaction();
    t.setDestinationAccount(payeeId);
    t.setSourceAccount(payeeId);
    t.setBankAccountId(bankAccountPayee.getId());
    t.setInvoiceId(0);
    t.setAmount(total);
    t.setDate(new Date());

    return getDelegate().put_(getX(), t);

  }


}
