package net.nanopay.cico.paymentCard;

import com.realexpayments.remote.sdk.RealexClient;
import com.realexpayments.remote.sdk.RealexException;
import com.realexpayments.remote.sdk.RealexServerException;
import com.realexpayments.remote.sdk.domain.Card;
import com.realexpayments.remote.sdk.domain.Card.CardType;
import com.realexpayments.remote.sdk.domain.Payer;
import com.realexpayments.remote.sdk.domain.payment.PaymentRequest;
import com.realexpayments.remote.sdk.domain.payment.PaymentRequest.PaymentType;
import com.realexpayments.remote.sdk.domain.payment.PaymentResponse;
import com.realexpayments.remote.sdk.http.HttpConfiguration;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.RelationshipDAO;
import foam.nanos.auth.User;
import net.nanopay.cico.model.PaymentPlatformUserReference;
import net.nanopay.cico.paymentCard.model.PaymentCard;
import net.nanopay.cico.paymentCard.model.PaymentCardNetwork;
import net.nanopay.cico.paymentCard.model.PaymentCardPaymentPlatform;

import java.util.List;
import java.util.UUID;

import static foam.mlang.MLang.EQ;

public class RealexPaymentCardStoreDAO
  extends ProxyDAO
{
  public RealexPaymentCardStoreDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    PaymentCard card = (PaymentCard) obj;
    if ( card.getPaymentPlatform() != PaymentCardPaymentPlatform.REALEX ) 
      return getDelegate().put_(x, obj);
    User user = (User)x.get("user");
    RelationshipDAO paymentPlateformDAO = (RelationshipDAO) user.getPaymentPlatformUserReferences();
    ArraySink sink = (ArraySink) paymentPlateformDAO.where(EQ(PaymentPlatformUserReference.OWNER, user)).select(new ArraySink());
    List list = sink.getArray();
    PaymentPlatformUserReference platformReference = null;
    if ( list.size() == 0 ) 
      platformReference = new PaymentPlatformUserReference();
    else
      platformReference = (PaymentPlatformUserReference) list.get(0);
    String payerReference = platformReference.getRealexUserReference();
    if ( payerReference == null || "".equals(payerReference) ) {
      //create payer reference in Realex if do not exist
      payerReference = UUID.randomUUID().toString();
      Payer myPayer = new Payer()
        .addRef(payerReference)
        .addType("Retail");
      PaymentRequest request = new PaymentRequest()
        .addType(PaymentType.PAYER_NEW)
        .addMerchantId(card.getExternalParameters().get("merchantid").toString())
        .addPayer(myPayer);
      try {
        PaymentResponse response = call(request);
        if ( ! "00".equals(response.getResult()) ) {
          throw new RuntimeException("fail to create Payer by Realex, error message: " + response.getMessage());
        }
        platformReference.setRealexUserReference(payerReference);
        paymentPlateformDAO.put(platformReference.fclone());
      } catch ( Throwable e ) {
        throw new RuntimeException("Error to connect to Realex with PayerNew request");
      }
    }
    String cardReference = UUID.randomUUID().toString();
    Card myCard = new Card()
      .addNumber(card.getExpiryMonth() + card.getExpiryYear())
      .addExpiryDate(card.getNumber())
      .addCardHolderName(card.getCardholderName())
      .addReference(cardReference)
      .addPayerReference(payerReference);
    if ( card.getNetwork() == PaymentCardNetwork.VISA ) {
      myCard.addType(CardType.VISA);
    } else if ( card.getNetwork() == PaymentCardNetwork.MASTERCARD ) {
      myCard.addType(CardType.MASTERCARD);
    } else if ( card.getNetwork() == PaymentCardNetwork.AMERICANEXPRESS ) {
      myCard.addType(CardType.AMEX);
    } else if ( card.getNetwork() == PaymentCardNetwork.DISCOVER ) {
      //miss discover cardType in SDK
    }
    PaymentRequest request = new PaymentRequest()
      .addType(PaymentType.CARD_NEW)
      .addMerchantId(card.getExternalParameters().get("merchantid").toString())
      .addCard(myCard);
    try {
      PaymentResponse response = call(request);
      if ( ! "00".equals(response.getResult()) ) {
        throw new RuntimeException("fail to store Card by Realex, error message: " + response.getMessage());
      }
      card.setRealexCardReference(cardReference);
    } catch ( Throwable e ) {
      throw new RuntimeException("Error to connect to Realex with CardNew request");
    }
    return getDelegate().put_(x, card);
  }

  protected PaymentResponse call(PaymentRequest request) throws RealexServerException, RealexException {
    HttpConfiguration HttpConfiguration = new HttpConfiguration();
    HttpConfiguration.setEndpoint("https://api.sandbox.realexpayments.com/epage-remote.cgi");
    //TODO: do not hard code secret
    RealexClient client = new RealexClient("secret", HttpConfiguration);
    return client.send(request);
  }
}