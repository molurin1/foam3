package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ListSink;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.mlang.sink.Sum;
import foam.nanos.auth.User;
import net.nanopay.model.Account;
import net.nanopay.model.AccountLimit;
import net.nanopay.tx.model.Transaction;

import java.util.Calendar;
import java.util.Date;
import java.util.List;


public class TransactionLimitCheckDAO
        extends ProxyDAO
{
  public TransactionLimitCheckDAO(DAO delegate) {
    setDelegate(delegate);
  }

  private static final String DEFAULT_USER_NAME = "default_user";

  @Override
  public FObject put_(X x, FObject fObject) throws RuntimeException {
    Transaction transaction = (Transaction) fObject;


    if ( transaction.getBankAccountId() == null ) {
      throw new RuntimeException("Invalid bank account");
    }

    Long firstLock  = transaction.getPayerId() < transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = transaction.getPayerId() > transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {
          DAO transactionDAO = (DAO) x.get("transactionDAO");
          DAO accountDAO = (DAO) x.get("accountDAO");
          DAO branchDAO = (DAO) x.get("branchDAO");
          DAO bankAccountDAO = (DAO) x.get("bankAccountDAO");
          DAO transactionLimitDAO = (DAO) x.get("transactionLimitDAO");
          DAO userDAO = (DAO) x.get("localUserDAO");
          User payee = (User) userDAO.find(transaction.getPayeeId());
          User payer = (User) userDAO.find(transaction.getPayerId());

          //Holds total amount from transactions
          long transactionTotal = 0;


          //Makes a shortcut for accessing default limits for payer to set all values to the default
          AccountLimit defaultpayerLimit = ((Account)accountDAO.find(payer.getId())).getLimit();
          long[] payerLimit = {defaultpayerLimit.getYearlyLimit(),defaultpayerLimit.getMonthlyLimit(),defaultpayerLimit.getWeeklyLimit(),defaultpayerLimit.getDailyLimit()};

          //Makes a shortcut for accessing default limits for payee to set all values to the default
          AccountLimit defaultpayeeLimit = ((Account)accountDAO.find(payee.getId())).getLimit();
          long[] payeeLimit = {defaultpayeeLimit.getYearlyLimit(),defaultpayeeLimit.getMonthlyLimit(),defaultpayeeLimit.getWeeklyLimit(),defaultpayeeLimit.getDailyLimit()};

          //Checks for special limits of User and overrides the default
          if (payer.getTransactionLimits().length>0) payerLimit = setSpecialLimits(payer, payerLimit);
          if (payee.getTransactionLimits().length>0) payeeLimit = setSpecialLimits(payee, payeeLimit);

          //Query all transactions within the year
          DAO payerTransaction = transactionDAO.where(MLang.AND(MLang.EQ(payer.getId(),transaction.getPayerId()),MLang.EQ(getTime(transaction.getDate()).get(Calendar.YEAR),getTime(new Date()).get(Calendar.YEAR))));
          DAO payeeTransaction = transactionDAO.where(MLang.AND(MLang.EQ(payee.getId(),transaction.getPayeeId()),MLang.EQ(getTime(transaction.getDate()).get(Calendar.YEAR),getTime(new Date()).get(Calendar.YEAR))));

          transactionTotal = getTransactionAmounts(payerTransaction);
          if (transaction.getTotal()+transactionTotal>payerLimit[0]) throw new RuntimeException("Transaction amount is over Payers yearly limit");
          transactionTotal = getTransactionAmounts(payeeTransaction);
          if (transaction.getTotal()+transactionTotal>payeeLimit[0]) throw new RuntimeException("Transaction amount is over Payees yearly limit");

          //Query all transactions within the month
          payerTransaction = transactionDAO.where(MLang.EQ(getTime(transaction.getDate()).get(Calendar.MONTH),getTime(new Date()).get(Calendar.MONTH)));
          payeeTransaction = transactionDAO.where(MLang.EQ(getTime(transaction.getDate()).get(Calendar.MONTH),getTime(new Date()).get(Calendar.MONTH)));

          transactionTotal = getTransactionAmounts(payerTransaction);
          if (transaction.getTotal()+transactionTotal>payerLimit[1]) throw new RuntimeException("Transaction amount is over Payers monthly limit");
          transactionTotal = getTransactionAmounts(payeeTransaction);
          if (transaction.getTotal()+transactionTotal>payeeLimit[1]) throw new RuntimeException("Transaction amount is over Payees monthly limit");

          //Query all transactions within the week
          payerTransaction = transactionDAO.where(MLang.EQ(getTime(transaction.getDate()).get(Calendar.WEEK_OF_MONTH),getTime(new Date()).get(Calendar.WEEK_OF_MONTH)));
          payeeTransaction = transactionDAO.where(MLang.EQ(getTime(transaction.getDate()).get(Calendar.WEEK_OF_MONTH),getTime(new Date()).get(Calendar.WEEK_OF_MONTH)));

          transactionTotal = getTransactionAmounts(payerTransaction);
          if (transaction.getTotal()+transactionTotal>payerLimit[2]) throw new RuntimeException("Transaction amount is over Payers weekly limit");
          transactionTotal = getTransactionAmounts(payeeTransaction);
          if (transaction.getTotal()+transactionTotal>payeeLimit[2]) throw new RuntimeException("Transaction amount is over Payees weekly limit");


          //Query all transactions within the day
          payerTransaction = transactionDAO.where(MLang.EQ(getTime(transaction.getDate()).get(Calendar.DAY_OF_MONTH),getTime(new Date()).get(Calendar.DAY_OF_MONTH)));
          payeeTransaction = transactionDAO.where(MLang.EQ(getTime(transaction.getDate()).get(Calendar.DAY_OF_MONTH),getTime(new Date()).get(Calendar.DAY_OF_MONTH)));

          transactionTotal = getTransactionAmounts(payerTransaction);
          if (transaction.getTotal()+transactionTotal>payerLimit[3]) throw new RuntimeException("Transaction amount is over Payers daily limit");
          transactionTotal = getTransactionAmounts(payeeTransaction);
          if (transaction.getTotal()+transactionTotal>payeeLimit[3]) throw new RuntimeException("Transaction amount is over Payees daily limit");


          throw new RuntimeException("I WANNA SEE YOU WORK");
         // return getDelegate().put(transaction);

        } catch (RuntimeException e) {
          throw e;
        }
      }
    }
  }
  Calendar getTime(Date date) {
    Calendar calendar = Calendar.getInstance();
    calendar.setTime(date);
    return calendar;
  }
  long[] setSpecialLimits(User user, long[] limits) {
    for (int i=0; i<user.getTransactionLimits().length;i++) {
      switch(user.getTransactionLimits()[i].getTimeFrame().name()) {
        case "DAY":
          limits[3] = user.getTransactionLimits()[i].getAmount();
          break;
        case "WEEKLY":
          limits[2]= user.getTransactionLimits()[i].getAmount();
          break;
        case "MONTHLY":
          limits[1]= user.getTransactionLimits()[i].getAmount();
          break;
        case "YEARLY":
          limits[0] = user.getTransactionLimits()[i].getAmount();
          break;
      }
    }
    return limits;
  }
  long getTransactionAmounts(DAO list)
  {
    long total=0;
    for (Transaction trans: (List<Transaction>) list.select(new ListSink())) {
      total = trans.getTotal();
    }
    return total;
  }
}
