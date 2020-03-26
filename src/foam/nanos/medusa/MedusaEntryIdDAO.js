/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryIdDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Explicitly set ID, so all copies from nodes are unique.  The original entry was distributed, and when broadcast back from the Nodes set ID so all copies are unique and can be tallied for consensus.`,

  javaImports: [
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.Random',
    'java.util.UUID'
  ],

  properties: [
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      getLogger().debug("put", "in", entry);
      getLogger().debug("put", new Exception("stacktrace"));
      if ( entry.isFrozen() ) {
        entry = (MedusaEntry) entry.fclone();
      }

      java.util.Random r = ThreadLocalRandom.current();
      entry.setId(new UUID(r.nextLong(), r.nextLong()).toString());

      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      entry.setNode(service.getConfigId());

      getLogger().debug("put", "out", entry);
      return (MedusaEntry) getDelegate().put_(x, entry);
      `
    }
  ]
});
