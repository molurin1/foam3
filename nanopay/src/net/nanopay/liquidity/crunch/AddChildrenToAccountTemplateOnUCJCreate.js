/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AddChildrenToAccountTemplateOnUCJCreate',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',


  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'net.nanopay.account.Account',
    'net.nanopay.liquidity.crunch.*',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
    'java.util.ArrayList',
    'java.util.Map',
    'java.util.Set',
    'java.util.HashSet'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {

            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            if ( ! ( ucj.getData() instanceof AccountTemplate ) ) return;

            Map<Long, AccountData> map = ((AccountTemplate) ucj.getData()).getAccounts();
            Set<Long> accountIds = map.keySet();
            // List<Long> accountIds = new ArrayList<Long>((template.getAccounts()).keySet());

            for ( Long accountId : accountIds ) {
              map = addChildrenToTemplate(x, accountId, map);
            }

            AccountTemplate template = ((AccountTemplate) ucj.getData());
            template.setAccounts(map);
            ucj.setData(template);
          }
        }, "Add children to AccountTemplate on ucj create");
      `
    },
    {
      name: 'addChildrenToTemplate',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'accountId', class: 'Long' },
        { name: 'map', javaType: 'Map<Long, AccountData>' }
      ],
      javaType: 'Map<Long, AccountData>',
      javaCode: `
        AccountData data = map.get(accountId);
        if ( data == null ) throw new RuntimeException("Null AccountData provided in AccountTemplate map");

        DAO accountDAO = (DAO) x.get("accountDAO");
        Account tempAccount = (Account) accountDAO.find(accountId);
        List<Account> children = ((ArraySink) ((DAO) tempAccount.getChildren(x)).select(new ArraySink())).getArray();

        Set<Account> accountsSet = new HashSet<Account>(children); 
        accountsSet.addAll(children); 

        while ( children.size() > 0 ) {
          tempAccount = children.get(0);
          List<Account> tempChildren = ((ArraySink) ((DAO) tempAccount.getChildren(x)).select(new ArraySink())).getArray();
          for ( Account tempChild : tempChildren ) {
            if ( ! children.contains(tempChild) ) children.add(tempChild);
            accountsSet.add(tempChild);
          }
          children.remove(0);
        }

        for ( Account account : accountsSet ) {
          if ( ! map.containsKey(account.getId())) map.put(account.getId(), data);
        }
        return map;
      `
    }
  ]
})
    