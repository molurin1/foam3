package net.nanopay.fx;

import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.nanos.NanoService;

import java.util.Date;

public class FXService
  extends ContextAwareSupport
  implements FXServiceInterface, NanoService {

  private final FXServiceAdapter fxAdapter;
  protected DAO fxQuoteDAO_;
  protected DAO fxDealDAO_;

  public FXService(final FXServiceAdapter fxAdapter) {
    this.fxAdapter = fxAdapter;
  }

  public ExchangeRateQuote getFXRate(String sourceCurrency, String targetCurrency, double sourceAmount, String direction, String valueDate) throws RuntimeException {
    ExchangeRateQuote quote = this.fxAdapter.getFXRate(sourceCurrency, targetCurrency, sourceAmount, direction, valueDate);
    if ( null != quote ) {
      DeliveryTimeFields timeFields = quote.getDeliveryTime();
      Date processTime = null == timeFields ? new Date() : timeFields.getProcessDate();
      fxQuoteDAO_.put(new FXQuote.Builder(getX())
        .setExpiryTime(null)
        .setQuoteDateTime(processTime)
        .setId(quote.getId())
        .setStatus(ExchangeRateStatus.QUOTED.getName())
        .build());
    }

    return quote;
  }

  public FXAccepted acceptFXRate(AcceptFXRate request) throws RuntimeException {
    FXAccepted fxAccepted = this.fxAdapter.acceptFXRate(request);
    if ( null != fxAccepted ) {
      // Get FXQuote by ID and update status
      FXQuote quote = (FXQuote) fxQuoteDAO_.find(request.getId());
      quote.setStatus(ExchangeRateStatus.ACCEPTED.getName());

      fxQuoteDAO_.put_(x_, quote);
    }

    return fxAccepted;
  }

  public FXDeal submitFXDeal(SubmitFXDeal request) {
    FXDeal submittedDeal = this.fxAdapter.submitFXDeal(request);
    if ( null != submittedDeal ) {
      fxDealDAO_.put(new FXDeal.Builder(getX())
        .setFXAmount(submittedDeal.getFXAmount())
        .setFXCurrencyID(submittedDeal.getFXCurrencyID())
        .setFXDirection(submittedDeal.getFXDirection())
        .setFee(submittedDeal.getFee())
        .setId(submittedDeal.getId())
        .setInternalNotes(submittedDeal.getInternalNotes())
        .setNotesToPayee(submittedDeal.getNotesToPayee())
        .setPaymentMethod(submittedDeal.getPaymentMethod())
        .setQuoteId(submittedDeal.getQuoteId())
        .setRate(submittedDeal.getRate())
        .setSettlementAmount(submittedDeal.getSettlementAmount())
        .setSettlementCurrencyID(submittedDeal.getSettlementCurrencyID())
        .setTotalSettlementAmount(submittedDeal.getTotalSettlementAmount())
        .setPayee(submittedDeal.getPayee())
        .build());
    }

    return submittedDeal;
  }

  public FXHoldingAccountBalance getFXAccountBalance(String fxAccountId) {
    return this.fxAdapter.getFXAccountBalance(fxAccountId);
  }

  public FXDeal confirmFXDeal(ConfirmFXDeal request) {
    return this.fxAdapter.confirmFXDeal(request);
  }

  public FXDeal checkIncomingFundsStatus(GetIncomingFundStatus request) {
    return this.fxAdapter.checkIncomingFundsStatus(request);
  }

  public FXPayee addFXPayee(FXPayee request) {
    return this.fxAdapter.addFXPayee(request);
  }

  public FXPayee updateFXPayee(FXPayee request) {
    return this.fxAdapter.updateFXPayee(request);
  }

  public FXPayee deleteFXPayee(FXPayee request) {
    return this.fxAdapter.deleteFXPayee(request);
  }

  public FXPayee getPayeeInfo(FXPayee request) {
    return this.fxAdapter.getPayeeInfo(request);
  }

  public void start() {
    fxQuoteDAO_ = (DAO) getX().get("fxQuoteDAO");
    fxDealDAO_ = (DAO) getX().get("fxDealDAO");
  }
}
