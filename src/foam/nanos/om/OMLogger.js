/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.om',
  name: 'OMLogger',

  extends: 'foam.nanos.logger.AbstractLogger',

  javaImports: [
    'foam.nanos.analytics.FoldManager',
    'java.util.Date'
  ],

  properties: [
    {
      name: 'foldManagerContextKey',
      class: 'String',
      value: 'omFoldManager'
    }
  ],

  methods: [
    {
      name: 'log',
      javaCode: `
        ((FoldManager) getX().get(getFoldManagerContextKey())).foldForState(combine(args), new Date(), 1);
      `
    },
    {
      name: 'info',
      javaCode: `
        log(args);
      `
    },
    {
      name: 'warning',
      javaCode: `
        log(args);
      `
    },
    {
      name: 'error',
      javaCode: `
        log(args);
      `
    },
    {
      name: 'debug',
      javaCode: `
        log(args);
      `
    },
    {
      name: 'combine',
      javaCode:
      `
        StringBuilder str = sb.get();

        if ( args.length >= 1 ) {
          str.append(formatArg(args[0]));
        }

        for ( int i = 1 ; i < args.length ; ++i ) {
          Object n = args[i];
          str.append('.');
          str.append(formatArg(n));
        }

        return str.toString();`
    }
  ]
});
