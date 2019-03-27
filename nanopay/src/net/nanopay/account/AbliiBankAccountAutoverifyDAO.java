package net.nanopay.account;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.bank.USBankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.bank.BankAccountStatus;

// we only need a put_ override in this decorator, since it only deals with the CREATION of contact bank accounts
public class AbliiBankAccountAutoverifyDAO
   extends ProxyDAO
{
 public AbliiBankAccountAutoverifyDAO(DAO delegate) {
   setDelegate(delegate);
 }

 public AbliiBankAccountAutoverifyDAO(X x, DAO delegate) {
   setX(x);
   setDelegate(delegate);
 }

 @Override
 public FObject put_(X x, FObject obj) {
    /**
     * 1. CONTACT BANK ACCOUNTS
     * In order to check if obj entails a Contact's bank account being added
     * We will first check if the userId is different from the bankAccountOwnerId
     * If it is then we can proceed to check if the bankAccountOwner is of type Contact
     * If the above mentioned checks pass, then we can set the "status" property of obj to VERIFIED
     * We do this because, we want ablii users to be able to send money to whomever they want so long
     * as they have their bank account information and email address
     * NOTE: If someone who has been added as a contact decides to create an ablii account,
     * this autoverified bank account WILL NOT CARRY OVER to their ablii account, as they will have to still set up an
     * account and verify it using the micro-deposit even if they are using the same bank information
     * Contact Bank Accounts are exlusively meant to just RECEIVE money from ablii users
     * 
     * FOR US BANK ACCOUNTS
     * Just need to check if the bank account obj is an instance of USBankAccount
     * If it is, then we can automatically verify it
     * This is to account when the user is adding a US Bank Account for themselves
     * As the requirement is to automatically verify US Bank Accounts
     */

   User user = (User) x.get("user");
   long userId = user.getId();
   
   // since the bank account details are included in obj, we can grab the ownerId of the bank account
   // in the case of a contact bank account, the contact should be the OWNER of the bank account
   Account bankAccountObj = (Account) obj; 
   long bankAccountOwnerId = bankAccountObj.getOwner();

   // 1. CONTACT BANK ACCOUNTS
   if ( userId != bankAccountOwnerId ) {

    // grabbing the bankAccountOwner object directly from the userDAO by looking up the bankAccountOwnerId
    // no need to typecast the bankAccountOwner to User since we just need to check if it is an instanceof Contact
    DAO userDAO = (DAO) x.get("userDAO");
    Object bankAccountOwner = userDAO.find(bankAccountOwnerId);

    if ( bankAccountOwner instanceof Contact ) {
      obj.setProperty("status", BankAccountStatus.VERIFIED);
    }
   }

   // 2. US BANK ACCOUNTS
   if ( bankAccountObj instanceof USBankAccount ) {
     obj.setProperty("status", BankAccountStatus.VERIFIED);
   }

   return super.put_(x, obj);
 }
}
