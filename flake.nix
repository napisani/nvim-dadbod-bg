
{
  description = "a flake for the dadbod beer goggles shell";
  inputs = {

    # node 20
    node_dep.url = "github:NixOS/nixpkgs/c182df2e68bd97deb32c7e4765adfbbbcaf75b60";

    # golang 1.22
    golang_dep.url = "github:NixOS/nixpkgs/10b813040df67c4039086db0f6eaf65c536886c6";
    

    # goreleaser 1.24.0
    goreleaser_dep.url = "github:NixOS/nixpkgs/10b813040df67c4039086db0f6eaf65c536886c6";


  };

  outputs = { 
    self, 
    nixpkgs,
    flake-utils, 
    node_dep,
    golang_dep,
    goreleaser_dep
  }@inputs :
    flake-utils.lib.eachDefaultSystem (system:
    let
      node_dep = inputs.node_dep.legacyPackages.${system};
      golang_dep = inputs.golang_dep.legacyPackages.${system};
      goreleaser_dep = inputs.goreleaser_dep.legacyPackages.${system};
    in
    {
      devShells.default = node_dep.mkShell {
        packages = [
          node_dep.nodejs_20
# TODO
          #golang_dep.go_1_22
          #golang_dep.gotools
          #goreleaser_dep.goreleaser
        ];

        shellHook = ''
          echo "node version: $(node --version)"
          #echo "go version: $(go version)"

        '';
      };
    });
}
