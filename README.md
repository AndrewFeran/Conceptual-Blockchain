# Conceptual Blockchain

Conceptual blockchain implemented using Node.js - this project aims to provide a better understanding of blockchain through example.

Currently this blockchain features some form of immutability however currently lacks decentralization and some other key features of a blockchain

### Notes
- Block data needs to be separated into a header and a body for purposes of hashing.
- Each running instance or "peer" should keep track of their own blockchain in memory and compare it to an "accepted" blockchain.
- There should be a queue for pending blocks so that blocks can be added while waiting for others to be accepted.
- Blocks should be signed using some sort of cryptography method for trust purposes.