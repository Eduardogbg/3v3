{
  description = "3v3 dos Cria Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.default = pkgs.mkShell {
        nativeBuildInputs = [
          pkgs.bun
          pkgs.sqlite

          # TODO: to lazy for this rn (https://nixos.wiki/wiki/Rust)
          # pkgs.rustc
          # pkgs.cargo
          # pkgs.rustfmt
          # pkgs.clippy
          # pkgs.rust-analyzer

          # # README: https://nixos.wiki/wiki/Rust#Using_LLD_instead_of_LD
          # pkgs.llvmPackages.bintools
        ];
      };
   });
}
