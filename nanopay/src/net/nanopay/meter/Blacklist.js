foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'Blacklist',
  extends: 'foam.nanos.auth.Group',

  documentation: 'Blacklist entity associated to a users group',

  tableColumns: [
    'id',
    'description',
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      tableWidth: 400
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of the Blacklist'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.BlacklistEntityType',
      name: 'entityType',
      documentation: 'Entity type to distinguish Object'
    }
  ]
});
