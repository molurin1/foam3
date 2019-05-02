foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'DowJonesPersonOnboarding',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, INSTANCE_OF(User.getOwnClassInfo())), true),
          EQ(DOT(NEW_OBJ, INSTANCE_OF(Business.getOwnClassInfo())), false),
          EQ(DOT(NEW_OBJ, User.COMPLIANCE), ComplianceStatus.REQUESTED),
          NEQ(DOT(OLD_OBJ, User.COMPLIANCE), ComplianceStatus.REQUESTED)
        ).f(obj);
      `
    }
  ]
});
