package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ASCIIPrefixer;
import net.nanopay.iso8583.ISOStringFieldPackager;

public class ISOLLLNumeric
  extends ISOStringFieldPackager
  {
public ISOLLLNumeric(int len, String description) {
  super(ASCIIPrefixer.LLL, len, description);
  }
  }
