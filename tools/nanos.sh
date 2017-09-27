#!/bin/sh
# run from parent directory of foam2

# exit on first failure
set -e

find foam2/src NANOPAY/**/src -type f -name accounts -exec cat {} \; > accounts
find foam2/src NANOPAY/**/src -type f -name banks -exec cat {} \; > banks
find foam2/src NANOPAY/**/src -type f -name bankAccounts -exec cat {} \; > bankAccounts
find foam2/src NANOPAY/**/src -type f -name businesses -exec cat {} \; > businesses
find foam2/src NANOPAY/**/src -type f -name businessTypes -exec cat {} \; > businessTypes
find foam2/src NANOPAY/**/src -type f -name businessSectors -exec cat {} \; > businessSectors
find foam2/src NANOPAY/**/src -type f -name countries -exec cat {} \; > countries
find foam2/src NANOPAY/**/src -type f -name countryAgents -exec cat {} \; > countryAgents
find foam2/src NANOPAY/**/src -type f -name cronjobs -exec cat {} \; > cronjobs
find foam2/src NANOPAY/**/src -type f -name currency -exec cat {} \; > currency
find foam2/src NANOPAY/**/src -type f -name devices -exec cat {} \; > devices
find foam2/src NANOPAY/**/src -type f -name dateofbirth -exec cat {} \; > dateofbirth
find foam2/src NANOPAY/**/src -type f -name exchangeRates -exec cat {} \; > exchangeRates
find foam2/src NANOPAY/**/src -type f -name exportDriverRegistrys -exec cat {} \; > exportDriverRegistrys
find foam2/src NANOPAY/**/src -type f -name groups -exec cat {} \; > groups
find foam2/src NANOPAY/**/src -type f -name historys -exec cat {} \; > historys
find foam2/src NANOPAY/**/src -type f -name invoices -exec cat {} \; > invoices
find foam2/src NANOPAY/**/src -type f -name identification -exec cat {} \; > identification
find foam2/src NANOPAY/**/src -type f -name languages -exec cat {} \; > languages
find foam2/src NANOPAY/**/src -type f -name menus -exec cat {} \; > menus
find foam2/src NANOPAY/**/src -type f -name pacs8india -exec cat {} \; > pacs8india
find foam2/src NANOPAY/**/src -type f -name pacs8iso -exec cat {} \; > pacs8iso
find foam2/src NANOPAY/**/src -type f -name payees -exec cat {} \; > payees
find foam2/src NANOPAY/**/src -type f -name permissions -exec cat {} \; > permissions
find foam2/src NANOPAY/**/src -type f -name regions -exec cat {} \; > regions
find foam2/src NANOPAY/**/src -type f -name script -exec cat {} \; > script
find foam2/src NANOPAY/**/src -type f -name services -exec cat {} \; > services
find foam2/src NANOPAY/**/src -type f -name tests -exec cat {} \; > tests
find foam2/src NANOPAY/**/src -type f -name transactions -exec cat {} \; > transactions
find foam2/src NANOPAY/**/src -type f -name users -exec cat {} \; > users

cd NANOPAY/
mvn dependency:build-classpath -Dmdep.outputFile=cp.txt;

cd ../
java -cp `cat foam2/build/cp.txt`:`cat NANOPAY/**/cp.txt`:`realpath NANOPAY/**/target/*.jar | paste -sd ":" -` foam.nanos.boot.Boot
