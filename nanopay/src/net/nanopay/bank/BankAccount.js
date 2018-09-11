
foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'BankAccount',
  extends: 'net.nanopay.account.Account',
  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.model.Currency',

    'foam.core.X',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.logger.Logger',
    'java.util.List'
  ],

  documentation: 'Base class/model of all BankAccounts',

  tableColumns: [
    'actionsMenu',
    'name',
    'status',
  ],

  // relationships: branch (Branch)
  constants: [
    {
      name: 'ACCOUNT_NAME_MAX_LENGTH',
      type: 'int',
      value: 70
    }
  ],
  properties: [
    {
      class: 'String',
      name: 'accountNumber',
      label: 'Account No.',
      tableCellFormatter: function(str) {
        this.start()
          .add('***' + str.substring(str.length - 4, str.length));
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{1,30}$/;

        if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Invalid account number.';
        }
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.bank.BankAccountStatus',
      name: 'status',
      tableCellFormatter: function(a) {
        var colour = ( a === net.nanopay.bank.BankAccountStatus.VERIFIED )
            ? '#2cab70'
            : '#f33d3d';
        this.start()
          .add(a.label)
          .style({
            'color': colour,
            'text-transform': 'capitalize'
          })
        .end();
      }
    },
    {
      class: 'String',
      name: 'denomination',
      aliases: ['currencyCode', 'currency'],
      value: 'CAD'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.payment.Institution',
      name: 'institution',
      label: 'Institution',
      tableCellFormatter: function(inst, X) {
        if ( inst ) {
          X.__context__.institutionDAO.find(inst).then((response) => {
            this.add(response != null ? response.institutionNumber : '');
          });
        }
      }
    },
    {
      documentation: 'Provides backward compatibilty for mobile call flow.  BankAccountInstitutionDAO will lookup the institutionNumber and set the institution property.',
      class: 'String',
      name: 'institutionNumber',
      storageTransient: true,
      hidden: true,
    },
    {
      class: 'String',
      name: 'branchId',
      label: 'Branch Id.',
      storageTransient: true
    },
    {
      class: 'Long',
      name: 'randomDepositAmount',
      networkTransient: true
    },
    {
      class: 'Int',
      name: 'verificationAttempts',
      value: 0,
      visibility: foam.u2.Visibility.RO
    }
  ],
  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        String name = this.getName();
        if ( SafetyUtil.isEmpty(name) ) {
          throw new IllegalStateException("Please enter an account name.");
        }
        // length
        if ( name.length() > ACCOUNT_NAME_MAX_LENGTH ) {
          throw new IllegalStateException("Account name must be less than or equal to 70 characters.");
        }

        // already exists
        User user = (User) x.get("user");
        ArraySink accountSink = (ArraySink) user.getAccounts(x)
          .where(INSTANCE_OF(BankAccount.class))
          .select(new ArraySink());
        List<BankAccount> userAccounts = accountSink.getArray();
        for ( BankAccount account : userAccounts ) {
          if ( account.getName().toLowerCase().equals(this.getName().toLowerCase()) ) {
            throw new IllegalStateException("Bank account with same name already registered.");
          }
        }
      `
    }
  ],
  actions: [
    {
      name: 'run',
      icon: 'images/ic-options-hover.svg',
      code: function() {
        foam.nanos.menu.SubMenuView.create({
          menu: foam.nanos.menu.Menu.create({ id: 'accountSettings' })
        });
      }
    }
  ],
  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public BankAccount findDefault(X x, User user, String currency) {
            BankAccount bankAccount = null;
            Logger logger = (Logger) x.get("logger");

            synchronized (String.valueOf(user.getId()).intern()) {
              logger.info(BankAccount.class.getSimpleName(), "findDefault", "user", user.getId(), "currency", currency);

              // Select currency of user's country
              String denomination = currency;
              if ( denomination == null ) {
                denomination = "CAD";
                String country = "CA";
                Address address = user.getAddress();
                if ( address != null && address.getCountryId() != null ) {
                  country = address.getCountryId();
                }
                DAO currencyDAO = (DAO) x.get("currencyDAO");
                List currencies = ((ArraySink) currencyDAO
                    .where(
                        EQ(Currency.COUNTRY, country)
                    )
                    .select(new ArraySink())).getArray();
                if ( currencies.size() == 1 ) {
                  denomination = ((Currency) currencies.get(0)).getAlphabeticCode();
                } else if ( currencies.size() > 1 ) {
                  logger.warning(BankAccount.class.getClass().getSimpleName(), "multiple currencies found for country ", address.getCountryId(), ". Defaulting to ", denomination);
                }
              }

              DAO accountDAO = ((DAO) x.get("localAccountDAO")).where(EQ(Account.OWNER, user.getId()));

              List accounts = ((ArraySink) accountDAO
                  .where(
                      AND(
                          INSTANCE_OF(BankAccount.class),
                          EQ(Account.DENOMINATION, denomination),
                          EQ(Account.IS_DEFAULT, true)
                      )
                  )
                  .select(new ArraySink())).getArray();
              if ( accounts.size() > 0 ) {
                bankAccount = (BankAccount) accounts.get(0);
              }

              if ( accounts.size() > 1 ) {
                logger.warning(BankAccount.class.getClass().getSimpleName(), "user", user.getId(), "multiple accounts found for denomination", denomination, "Using first found.");

              }

            }

            return bankAccount;
          }
        `);
      }
    }
  ]
});
