import { BigNumber, ethers } from "ethers";
//import { expandLeaves, computeRootHash, computeMerkleProof } from './merkle';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
export default class AirDrop {
  tree: any;
  allocations: any;

  constructor(allocations: any) {
    if (!(this instanceof AirDrop)) {
      throw new Error('missing new');
    }

    this.allocations = allocations;
    this.tree = new MerkleTree(this.leaves, keccak256, { sort: true });
    console.log(this.tree.toString());
  }

  get leaves() {
    return this.allocations.map(({ key, value }: any) => ethers.utils.solidityKeccak256(['address', 'uint256'], [key, value]));
  }

  get rootHash() {
    return this.tree.getHexRoot()
  }

  getIndex(tokenId: string) {
    tokenId = `${tokenId}`.toLowerCase();
    for (var i = 0; i < this.allocations.length; i++) {
      if (this.allocations[i].key.toLowerCase() === tokenId.toLowerCase()) {
        return i;
      }
    }
    throw new Error('token id not found');
  }

  getAddress(index: any) {
    return this.allocations[parseInt(index)].key;
  }

  getAmount(index: any) {
    return this.allocations[parseInt(index)].value;
  }

  getMerkleProof(index: any) {
    return this.tree.getHexProof(
      this.leaves[parseInt(index)]
    );
  }

  getRootHash() {
    return this.rootHash;
  };

}



