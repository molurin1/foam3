#!/usr/bin/perl -w

# Replace transaction payerId and payeeId with either
# bank account or default digital account.
# Bank Account becomes source for Cash-In destination for Cash-Out.

# DEV NOTE: my (Joel) perl is really really rusty. This is very brute force, but it's a one off for migration.

#use strict;
use File::Copy 'move';
my $TMP = "/opt/nanopay/journals/transactions.tmp";
my $TRANS = "/opt/nanopay/journals/transactions";

# See upgrade/accounts for hand crafted default digital accounts existing nanopay customers.
my %data = (
        1357=>200,
        1358=>201,
        1360=>203,
        1361=>204,
        1364=>207,
        1365=>208,
        1367=>210,
        1376=>219,
        1377=>220,
        1378=>221,
        1379=>222,
        1402=>255,
        1409=>262,
        1410=>263,
        1411=>264,
        1413=>266,
        1417=>270,
        1419=>272,
        1420=>273,
        1421=>274,
        1423=>276,
        1428=>281,
        1441=>294,
        1442=>295,
        1443=>295,
        1446=>298
    );
open(FILE, "<$TRANS") || die "File not found: $TRANS";
my @lines = <FILE>;
close(FILE);

my @newlines;
foreach $line ( @lines ) {

    print "in: $line\n";
    if ($line =~ /payerId\":(\d+)/) {
        $key = $1;
        $value = $data{$key};
        if ($value) {
            print "payer: key=$key, value=$value\n";
            $line =~ s/^(.*?)payerId\":(\d+),(.*?)$/$1sourceAccount\":$value,$3/;
            print "out: $line\n";
        } else {
            print "key=$key not found\n";
            next;
        }
    }
    if ($line =~ /payeeId\":(\d+)/) {
        $key = $1;
        $value = $data{$key};
        if ($value) {
            print "payee: key=$key, value=$value\n";
            $line =~ s/^(.*?)payeeId\":(\d+),(.*?)$/$1destinationAccount\":$value,$3/;
            print "out: $line\n";
        } else {
            print "key=$key not found\n";
            next;
        }
    }

    if ($line =~ /BankAccount\":(\d+)/) {
        $key = $1;
        $value = $key + 300;
        $line =~ s/BankAccount\":(\d+)/Account\":$value/;
    }
    push(@newlines,$line);
}

open(FILE, ">$TMP") || die "File not found";
print FILE @newlines;
close(FILE);

move $TMP, $TRANS || die "move $TMP, $TRANS failed: $!";
