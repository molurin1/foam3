foam.ENUM({
  package: 'net.nanopay.tx',
  name: 'AccountRelationship',
  documentation: 'Account relationship to sender in a Kotak transaction.',

  values: [
    {
      name: 'EMPLOYEE',
      label: 'Employee'
    },
    {
      name: 'CONTRACTOR',
      label: 'Contractor'
    },
    {
      name: 'CLIENT',
      label: 'Client'
    },
    {
      name: 'OTHER',
      label: 'Other'
    }
  ]
});
