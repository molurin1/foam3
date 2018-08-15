foam.CLASS({
  package: 'net.nanopay.security',
  name: 'AbstractKeyStoreManager',
  abstract: true,

  documentation: 'AbstractKeyStoreManager which only implements loadKey.',

  implements: [
    'net.nanopay.security.KeyStoreManager',
  ],

  javaImports: [
    'java.security.KeyStore'
  ],

  methods: [
    {
      name: 'loadKey',
      javaCode: `
        try {
          return getKeyStore().getEntry(alias, new KeyStore.PasswordProtection(getPassphrase()));
        } catch (Throwable t) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'storeKey',
      javaCode: `
        // store key using keystore passphrase because keystore doesn't
        // allow you to store secret key entry without a passphrase
        getKeyStore().setEntry(alias, entry, new KeyStore.PasswordProtection(getPassphrase()));
      `
    }
  ]
});
