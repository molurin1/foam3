foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AccountData', 
  
  documentation: `
  A model for the data stored in the value of the map of AccountTemplate. 
  `,

properties: [  
    {
      name: 'isCascading',
      class: 'Boolean',
      value: true
    },
    {
      name: 'isIncluded',
      class: 'Boolean',
      value: true
    }
  ],
});

foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityAccountData', 
  extends: 'net.nanopay.liquidity.crunch.AccountData',
  
  documentation: `
  A model for the data stored in the value of the map of CapabilityAccountTemplate. 
  `,

properties: [  
    {
      name: 'approverLevel',
      class: 'FObjectProperty',
      of: 'net.nanopay.liquidity.crunch.ApproverLevel',
      javaType: 'net.nanopay.liquidity.crunch.ApproverLevel',
    }
  ],
});
  
    