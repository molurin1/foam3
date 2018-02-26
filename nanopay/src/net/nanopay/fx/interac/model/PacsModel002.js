foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'PacsModel002',

  documentation: 'Pacs Message for Interac',

  javaImports: [
    'java.util.Date',
    'net.nanopay.iso20022.GroupHeader53',
    //'net.nanopay.iso20022.OriginalGroupHeader3',
    'net.nanopay.iso20022.SettlementInstruction4',
    'net.nanopay.iso20022.PaymentTypeInformation21',
    'net.nanopay.iso20022.PostalAddress6',
    'net.nanopay.iso20022.PaymentTransaction91'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'GrpHdr',
      of: 'net.nanopay.iso20022.GroupHeader53'
    },
    // {
		// 	class: 'FObjectProperty',
		// 	name: 'OrgnlGrpInfAndSts',
		// 	of: 'net.nanopay.iso20022.OriginalGroupHeader3'
		// },
    {
			class: 'String',
			name: 'GrpSts'
		},
    {
			class: 'FObjectProperty',
			name: 'SttlmInf',
			of: 'net.nanopay.iso20022.SettlementInstruction4'
		},
    {
			class: 'FObjectProperty',
			name: 'PmtId',
			of: 'net.nanopay.iso20022.PaymentTypeInformation21'
		},
    {
			class: 'FObjectProperty',
			name: 'PstlAdr',
			of: 'net.nanopay.iso20022.PostalAddress6'
		},
    {
			class:  'FObjectProperty',
			name:  'TxInfAndSts',
			of:  'net.nanopay.iso20022.PaymentTransaction91'
		}
  ]
});
