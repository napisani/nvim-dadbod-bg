
{
  description = "a flake for the dadbod external viewer shell";

  inputs = {

    # node 20
    node_dep.url = "github:NixOS/nixpkgs/c182df2e68bd97deb32c7e4765adfbbbcaf75b60";

  };

  outputs = { 
    self, 
    nixpkgs,
    flake-utils, 
    node_dep
  }@inputs :
    flake-utils.lib.eachDefaultSystem (system:
    let
      node_dep = inputs.node_dep.legacyPackages.${system};

    in
    {
      devShells.default = node_dep.mkShell {
        packages = [
          node_dep.nodejs_20
        ];

        shellHook = ''
          echo "node version: $(node --version)"

        '';
      };
    });
}
