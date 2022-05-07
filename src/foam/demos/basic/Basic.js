/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.basic',
  name: 'Compiler',
  extends: 'foam.parse.Grammar',

  properties: [
    'currentLine',
    { name: 'vars', factory: function() { return { '_d': true }; } },
    { name: 'defs', factory: function() { return []; } },
    { name: 'data', factory: function() { return []; } },
    { name: 'fors', factory: function() { return {}; } },
    {
      name: 'symbols',
      factory: function() {
        return function(alt, sym, seq1, seq, literalIC, repeat, str, optional, plus, range, anyChar, notChars, literal, until, not) {
          return {
            START: repeat(sym('line'), '\n'),

            line: seq(sym('lineNumber'), sym('ws'), sym('statements')),

            ws: repeat(' ', null, 1),

            lineNumber: sym('number'),

            statements: repeat(sym('statement'), seq(optional(' '), ':', optional(' '))),

            statement: alt(
              sym('data'),
              sym('def'),
              sym('dim'),
              sym('end'),
              sym('forStep'),
              sym('for'),
              sym('gosub'),
              sym('goto'),
              sym('if'),
              sym('input'),
              sym('next'),
              sym('on'),
              sym('print'),
              sym('read'),
              sym('rem'),
              sym('return'),
              sym('let'),
              str(repeat(notChars(':\n')))), // passthrough Javascript code

            data: seq1(1, 'DATA ', repeat(sym('number'), ',')),

            def: seq('DEF ', sym('symbol'), '(', str(repeat(notChars(')'))), ')=', str(repeat(notChars('\n')))),

            dim: seq1(1, 'DIM ', repeat(sym('dimElement'), ',')),

            dimElement: seq(sym('symbol'), '(', repeat(sym('number'),','), ')'),

            end: alt(literal('END', 'return;'), literal('STOP', 'return;')),

            forStep: seq('FOR ', sym('symbol'), '=', str(until(' TO ')), str(until(' ')), 'STEP ', sym('expr')),

            for: seq('FOR ', sym('symbol'), '=', str(until(' TO ')), str(repeat(notChars('\n:')))),

            gosub: seq('GOSUB ', sym('number')),

            goto: seq1(1, 'GOTO ', sym('gotoLine')),

            gotoLine: sym('number'),

            if: seq('IF ', seq1(0, sym('predicate'), ' THEN '), alt(sym('gotoLine'), str(sym('statements')))),

            input: seq('INPUT ', optional(seq1(0, sym('string'), ';', optional(' '))), repeat(sym('symbol'), ',')),

            let: seq(optional('LET '), sym('lhs'), '=', sym('expr')),

            lhs: alt(sym('fn'), sym('symbol')),

            next: seq1(1, 'NEXT ', sym('symbol')),

            on: seq('ON ', until(' GOTO '), str(repeat(notChars('\n')))),

            print: seq('PRINT', optional(' '), repeat(alt(sym('tab'), sym('expr')), ';'), optional(';')),

            printArg: alt(sym('string'), sym('tab')),

            read: seq1(1, 'READ ', repeat(sym('lhs'), ',')),

            rem: seq1(1, 'REM', str(repeat(notChars('\n')))),

            return: literal('RETURN'),

            string: seq1(1, '"', repeat(notChars('"')), '"'),

            tab: str(seq('TAB(', sym('expr'), ')')),

            expr: seq(sym('expr1'), optional(seq(alt('+', '-'), sym('expr')))),

            expr1: seq(sym('expr2'), optional(seq(alt('*', '/'), sym('expr1')))),

            expr2: seq(sym('expr3'), optional(seq('^', sym('expr2')))),

            expr3: alt(
              str(seq('(', sym('expr'), ')')),
              str(seq('-', sym('expr'))),
              sym('number'),
              sym('string'),
              sym('fn'),
              sym('symbol')
            ),

            predicate: str(seq(
              str(alt(
                seq(sym('expr'), alt(literal('=', '=='), literal('<>', '!='),'<=','>=','<','>'), sym('expr')),
                seq('(', sym('predicate'), ')'),
                seq(literal('NOT ', '! '), sym('predicate')))),
              optional(str(seq(
                alt(literal(' AND ','&&'), literal(' OR ', '||')),
                sym('predicate'))
              )))),

            fn: seq(sym('symbol'), '(', repeat(sym('expr'), ','), ')'),

            number: str(seq(
              optional('-'),
              str(alt(
                seq(str(repeat(sym('digit'))), '.', str(plus(sym('digit')))),
                plus(sym('digit')))))),

            digit: range('0', '9'),

            symbol: str(seq(
              alt(range('a', 'z'), range('A', 'Z')),
              str(repeat(alt(range('a', 'z'), range('A', 'Z'), range('0', '9')))),
              optional('$')
            ))
          };
        }
      }
    }
  ],

  methods: [
    function init() {
      var self = this;
      this.addActions({
        lineNumber: function(a) { self.currentLine = a; return a; },
        input: function(a) {
          a[2].forEach(self.addVar);
          return `${a[2][0]} = INPUT(${a[1] || ''});`;
        },
        on: function(a) { return `{ var l = [${a[2]}][${a[1]}]; if ( l ) { _line = l; break; } }`; },
        def: function(a) {
          self.defs.push(`function ${a[1]}(${a[3]}) { return ${a[5]}; }`);
          return '';
        },
        data: function(a) { a.forEach(d => self.data.push(d)); return ''; },
        dim: function(a) {
          return a.map(e => {
            self.addVar(e[0]);
            return `${e[0]} = DIM(${e[0].endsWith('$') ? '""' : 0},${e[2].join()});`;
          }).join('');
        },
        expr: function(a) { return a[1] ? a[0] + a[1].join('') : a[0]; },
        expr1: function(a) { return a[1] ? a[0] + a[1].join('') : a[0]; },
        expr2: function(a) { return a[1] ? `Math.pow(${a[0]}, ${a[1][1]})` : a[0]; },
        rem: function(a) { return '// REM' + a; },
        fn: function(a) {
          // array lookup
          if ( self.vars[a[0]] ) return `${a[0]}[${a[2].join()}]`;
          // function call
          return `${a[0]}(${a[2].join()})`;
        },
        forStep: function(a) {
          self.addVar(a[1]);
          self.fors[a[1]] = [self.currentLine, a[4], a[6]];
          return `${a[1]} = ${a[3]}; case ${self.currentLine}.5:`;
        },
        for: function(a) {
          self.addVar(a[1]);
          self.fors[a[1]] = [self.currentLine, a[4], 1];
          return `${a[1]} = ${a[3]}; case ${self.currentLine}.5:`;
        },
        let: function(a) { return `${a[1]} = ${a[3]};`; },
        lhs: function(v) { self.addVar(v); return v; },
        next: function(a) {
          var f = self.fors[a];
          return `${a} = ${a} + (${f[2]}); if ( ${a} ${ f[2] > 0 ? '<=' : '>=' } ${f[1]} ) { _line = ${f[0]}.5; break; } `;
        },
        if: function(a) { return `if ( ${a[1]}) { ${a[2]} }`; },
        string: function(a) { return `"${a.map(c => (c == '\\') ? '\\\\' : c).join('')}"`; },
        print: function(a) {
          var ret = '';
          function append(s) { ret += ( ret ? ';' : '' ) + s; }
          for ( var i = 0 ; i < a[2].length ; i++ ) {
            var l = a[2][i];
            if ( l.startsWith('TAB') ) {
              append(l);
            } else {
              append('PRINT(' + l + ')');
            }
          }
          if ( ! a[3] ) append('NL()');
          return ret + ';'
        },
        gotoLine: function(l) { return `_line = ${l}; break;`; },
        gosub: function(a) { return `_line = ${a[1]}; _stack.push(${self.currentLine}.5); break; case ${self.currentLine}.5:`; },
        read: function(a) {
          return a.map(s => {
            self.addVar(s);
            return `${s} = _data[_d++];`;
          }).join('');
        },
        return: function() { return '_line = _stack.pop(); break;' }
      });
    },
    function addVar(v) { if ( v.indexOf('[') == -1 ) this.vars[v] = true; }
  ]
});


foam.CLASS({
  package: 'foam.demos.basic',
  name: 'Basic',

  requires: [ 'foam.demos.basic.Compiler' ],

  imports: [ 'setTimeout' ],

  properties: [
    {
      name: 'program',
      view: { class: 'foam.u2.view.ChoiceView', choices: foam.demos.basic.Programs.PROGRAMS },
      postSet: function(o, n) { this.sourceCode = n.trim(); }
    },
    { class: 'Code', name: 'sourceCode' },
    { class: 'Code', name: 'targetCode' },
    {
      class: 'String',
      name: 'output',
      width: 80,
      view: { class: 'foam.u2.tag.TextArea', rows: 24, cols: 80 }
    }
  ],

  methods: [
    function ABS(n) { return Math.abs(n); },
    function CLS() { this.output = ''; },
    function CHR$(c) { return String.fromCharCode(c); },
    function COS(n) { return Math.cos(n); },
    function DIM(v, ...dims) {
      function f(v, i, dims) { return i == dims.length ? v : Array(dims[i]).fill().map(a => f(v, i+1, dims)); }
      return f(v, 0, dims);
    },
    function EXP(n) { return Math.exp(n); },
    function INPUT(m) { this.output += m; var ret = prompt(m); this.output += ret + '\n'; return ret; },
    function INT(n) { return Math.floor(n); },
    function LEFT$(s, n) { return s.substring(0, n); },
    function LEN(s) { return s.length; },
    function MID$(s, b, n) { return s.substring(b-1, b+n-1); },
    function NL() { this.output += '\n'; },
    function PRINT(s) { this.output += s; },
    function RIGHT$(s, n) { return s.substring(s.length-n); },
    function RND(n) { return Math.random() * n; },
    function SIN(n) { return Math.sin(n); },
    function SQR(n) { return Math.sqrt(n); },
    function TAB(n) {
      var pos = this.output.length - Math.max(0, this.output.lastIndexOf('\n'));
      this.output += ' '.repeat(Math.max(0, n-pos));
    },
    function TAN(n) { return Math.tan(n); }
  ],

  templates: [
    {
      name: 'jsGenerator',
      args: [ 'data', 'defs', 'vars', 'lines' ],
      template: `
      // Compiled from BASIC to JS
      async function main() {
        const _stack = [];
        const _data = [ <%= data.join(',') %> ];<!--
        --><%= defs.join(', ') %>
        <!--
        -->var <%= vars.map(v => v + '=' + ( v.endsWith('$') ? '""' : 0)).join(', ') %>;<!--
        -->
        var _line = <%= lines[0][0]%>;
        while ( true ) {
//          await new Promise(r => this.setTimeout(r, 1));
          // console.log(_line);
          switch ( _line ) {
          <% for ( var i = 0 ; i < lines.length ; i++ ) {
            var line = lines[i];
            %><!--
            -->case <%=line[0]%>: <!--
            --><% for ( var j = 0 ; j < line[2].length ; j++ ) {
              var stmt = line[2][j];
            %><!--
              --><%=stmt%><!--
            --><%}%>
          <%}%>
          return;
          }
        }
      }
      `
    }
  ],

  actions: [
    {
      name: 'compile',
      code: function() {
        var compiler = this.Compiler.create();
        var ret = compiler.parseString(this.sourceCode.trim());
        if ( ret )
          this.targetCode = this.jsGenerator(compiler.data, compiler.defs, Object.keys(compiler.vars), ret);
      }
    },
    {
      name: 'run',
      code: function() {
        this.output = '';
        try {
          var fn;
          with ( this ) { fn = eval('(' + this.targetCode + ')'); }
          // for ( var i = 0 ; i < 10 ; i++ ) fn.call(this); this.output = '';
          console.time('run');
          fn.call(this);
        } catch(x) {
          this.output = 'SYNTAX ERROR: ' + x;
        } finally {
          console.timeEnd('run');
        }
      }
    }
  ]
});
