/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
    package: 'foam.dao',
    name: 'CompositeDAO',
    extends: 'foam.dao.ProxyDAO',
    documentation: `
    Wraps several delegate DAOs. 
    `,
    javaImports: [
        'foam.dao.DAO',
        'java.util.Objects'
    ],
    properties: [
        {
            name: 'delegates',
            class: 'FObjectArray',
            of: 'foam.dao.DAO'
        }
    ],
    methods: [
        {
            name: 'put_',
            javaCode: `
                for( foam.dao.DAO dao : getDelegates() ) {
                    dao.put_(x,obj);
                }
                return obj;
            `
        },
        {
            name: 'remove_',
            javaCode: `
                for( foam.dao.DAO dao : getDelegates() ) {
                    dao.remove_(x,obj);
                }
                return obj;
            `
        }
    ],
    javaCode: `
    public CompositeDAO(foam.core.X x, foam.dao.DAO ... delegates) {
        super(x, delegates[0]);
        setDelegates(delegates);
    }
    
    public CompositeDAO(foam.core.X x, foam.core.ClassInfo of, foam.dao.DAO ... delegates) {
        super(x,of,delegates[0]);
        setDelegates(delegates);
    }
    `
 });
