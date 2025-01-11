{ pkgs, localArchtikaPackage, ... }:
let
  domain = "demo.archtika.com";
in
{
  imports = [
    ./hardware-configuration.nix
    ../shared.nix
    ../../module.nix
  ];

  networking.hostName = "archtika-demo";

  services.archtika = {
    enable = true;
    package = localArchtikaPackage;
    inherit domain;
    settings = {
      disableRegistration = true;
    };
  };

  security.acme = {
    acceptTerms = true;
    defaults.email = "thilo.hohlt@tutanota.com";
    certs."${domain}" = {
      inherit domain;
      extraDomainNames = [ "*.${domain}" ];
      dnsProvider = "porkbun";
      environmentFile = /var/lib/porkbun.env;
      group = "nginx";
    };
  };
}
