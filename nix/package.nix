{
  lib,
  stdenv,
  buildNpmPackage,
  importNpmLock,
  symlinkJoin,
}:

let
  web = buildNpmPackage {
    name = "web-app";
    src = ../web-app;
    npmDeps = importNpmLock { npmRoot = ../web-app; };
    npmConfigHook = importNpmLock.npmConfigHook;
    npmFlags = [ "--legacy-peer-deps" ];
    installPhase = ''
      mkdir -p $out/web-app
      cp package.json $out/web-app
      cp -r node_modules $out/web-app
      cp -r build/* $out/web-app
      cp -r template-styles $out/web-app
    '';
  };

  api = stdenv.mkDerivation {
    name = "api";
    src = ../rest-api;
    installPhase = ''
      mkdir -p $out/rest-api/db/migrations
      cp -r db/migrations/* $out/rest-api/db/migrations
    '';
  };
in
symlinkJoin {
  name = "archtika";
  pname = "archtika";
  version = "1.0.0";

  paths = [
    web
    api
  ];

  meta = with lib; {
    description = "A modern, performant and lightweight CMS";
    homepage = "https://archtika.com";
    license = licenses.mit;
    maintainers = with maintainers; [ thiloho ];
    platforms = platforms.unix;
  };
}
