foam.CLASS({
  package: 'net.nanopay.security.PII',
  name: 'ViewPIIRequests',

  documentation: `Modelled PII Request`,

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    // 'foam.nanos.auth.LastModifiedByAware'
  ],

  searchColumns: [
    'severity'
   ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the request'
    },
    {
      name: 'created',
      class: 'DateTime',
    },
    {
      name: 'viewRequestStatus',
      class: 'Enum',
      of: 'net.nanopay.security.PII.PIIRequestStatus',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'reviewedBy',
      documentation: 'Person at nanopay who reviewed this request'
    },
    {
      name: 'reviewedAt',
      class: 'DateTime',
    },
  ]
});
