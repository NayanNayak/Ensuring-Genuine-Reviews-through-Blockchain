module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777", // Match any network id
    },
  },
  contracts_directory: "./src/blockchain/contracts/",
  contracts_build_directory: "./src/blockchain/build/contracts/",
  migrations_directory: "./src/blockchain/migrations/",
  compilers: {
    solc: {
      version: "0.8.17",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
}; 