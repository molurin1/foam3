/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

foam.CLASS({
  package: 'foam.box.sf',
  name: 'SF',
  extends: 'foam.dao.CompositeJournal',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.dao.NullDAO',
    'foam.core.FObject',
    'foam.dao.Journal',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.fs.Storage',
    'foam.nanos.fs.FileSystemStorage',
    'foam.dao.ReadOnlyF3FileJournal',
    'java.nio.file.Path',
    'java.nio.file.DirectoryStream',
    'java.nio.file.Files',
    'java.nio.file.DirectoryIteratorException',
    'java.io.IOException',
    'java.util.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'fileName'
    },
    {
      class: 'Int',
      name: 'fileSuffix'
    },
    {
      class: 'Object',
      name: 'storeDAO',
      javaFactory: `
        return null;
      `
    },
    {
      class: 'Boolean',
      name: 'isStore',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isHashEntry',
      value: false
    },
    {
      class: 'Int',
      name: 'initialValue',
      value: 1000
    },
    {
      class: 'Object',
      javaType: 'StepFunction',
      name: 'stepFunction',
      javaFactory: `
        return x -> x*2;
      `
    },
    {
      class: 'Int',
      name: 'maxRetryDelayMS',
      value: 20000
    },
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      documentation: 'Set to -1 to infinitely retry.',
      value: 20
    },
    {
      class: 'FObjectArray',
      of: 'foam.dao.Journal',
      name: 'delegates'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.dao.Journal',
      name: 'storeJournal'
    },
    {
      class: 'Long',
      name: 'timeWindow',
      value: 0
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName(),
          this.getFileName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'store',
      args: 'FObject fobject',
      javaType: 'SFEntry',
      javaCode: `
        /* Assign index and persist */
        SFEntry entry = new SFEntry.Builder(getX())
                              .setObject(fobject)
                              .build();
        
        //TODO: assgn index and rolling.
        getStoreJournal().put(getX(), "", new NullDAO.Builder(getX()).setOf(SFEntry.getOwnClassInfo()).build(), entry);
        return entry;
      `
    },
    {
      name: 'updateNextScheduledTime',
      args: 'SFEntry e',
      javaType: 'SFEntry',
      javaCode: `
        e.setCurStep(getStepFunction().next(e.getCurStep()));
        if ( e.getCurStep() > getMaxRetryDelayMS() ) {
          e.setCurStep(getMaxRetryDelayMS());
        }
        e.setScheduledTime(System.currentTimeMillis()+e.getCurStep());
        return e;
      `
    },
    {
      name: 'updateAttempt',
      args: 'SFEntry e',
      javaType: 'SFEntry',
      javaCode: `
        e.setRetryAttempt(e.getRetryAttempt()+1);
        return e;
      `
    },
    {
      name: 'buildReplayJournals',
      args: 'Context x',
      javaCode: `
        //foam.dao.Journal[]
        List<Integer> fileIndexs = getFileIndexs(x);
        ArrayList<Journal> journals = new ArrayList<Journal>();
        for ( int index : fileIndexs ) {
          journals.add(new ReadOnlyF3FileJournal.Builder(x)
            .setFilename(getFileName()+"."+index)
            .setCreateFile(false)
            .build());
        }
        setDelegates(journals.toArray(new Journal[0]));
      `
    },
    {
      name: 'getFileIndexs',
      args: 'Context x',
      javaType: 'ArrayList<Integer>',
      javaCode: `
        ArrayList<Integer> l = new ArrayList<Integer>();
        Path rootPath = ((FileSystemStorage) x.get(Storage.class)).getRootPath();
        try ( DirectoryStream<Path> stream = Files.newDirectoryStream(rootPath) ) {
          for ( Path entry: stream ) {
            if ( entry.toString().contains(getFileName()) ) {
              int suffix = Integer.parseInt(entry.toString().split("\\\\.")[1]);
              l.add(suffix);
            }
          }
          Collections.sort(l);
        } catch ( IOException e ) {
          //throw e.getCause();
        }
        return l;
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            //Make to public because beanshell do not support.
            static public interface StepFunction {
              public int next(int cur);
            }

            static private class FilterDAO extends ProxyDAO {
              @Override
              public FObject put_(X x, FObject obj) {
                SFEntry entry = (SFEntry) obj;
                return obj;
              }

              public FilterDAO(X x, DAO delegate) {
                super(x, delegate);
              }
            }
          `
        }));
      }
    }
  ]
})