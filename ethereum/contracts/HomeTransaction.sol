pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import "./Factory.sol";

contract HomeTransaction {
    // Constants
    uint256 constant timeBetweenDepositAndFinalization = 5 minutes;
    uint256 constant depositPercentage = 10;

    //States of a contract
    enum ContractState {
        WaitingSellerSignature,
        WaitingBuyerSignature,
        WaitingRealtorReview,
        WaitingFinalization,
        Finalized,
        Rejected
    }
    ContractState public contractState = ContractState.WaitingSellerSignature;

    // Roles acting on contract
    address payable public realtor;
    address payable public seller;
    address payable public buyer;

    // Contract details
    uint256 public realtorFee;
    uint256 public price;

    //Id of property
    uint256 public propertyId;

    //address of deployed Factory contract
    address instanceFactoryAddr;

    // Set when buyer signs and pays deposit
    uint256 public deposit;
    uint256 public finalizeDeadline;

    // Set when realtor reviews closing conditions
    enum ClosingConditionsReview {
        Pending,
        Accepted,
        Rejected
    }
    ClosingConditionsReview closingConditionsReview =
        ClosingConditionsReview.Pending;

    constructor(
        address _instanceFactoryAddr,
        uint256 _propertyId,
        uint256 _realtorFee,
        uint256 _price,
        address payable _realtor,
        address payable _seller,
        address payable _buyer
    ) public {
        require(
            _price >= _realtorFee,
            "Price of property must be superior to Notary fees"
        );
        instanceFactoryAddr = _instanceFactoryAddr;
        realtor = _realtor;
        seller = _seller;
        buyer = _buyer;
        propertyId = _propertyId;
        price = _price;
        realtorFee = _realtorFee;
    }

    function sellerSignContract() public payable {
        require(seller == msg.sender, "Only seller can sign contract");

        require(
            contractState == ContractState.WaitingSellerSignature,
            "Wrong contract state"
        );

        contractState = ContractState.WaitingBuyerSignature;
    }

    function buyerSignContractAndPayDeposit() public payable {
        require(buyer == msg.sender, "Only buyer can sign contract");

        require(
            contractState == ContractState.WaitingBuyerSignature,
            "Wrong contract state"
        );

        require(
            msg.value >= (price * depositPercentage) / 100 &&
                msg.value <= price,
            "Buyer needs to deposit from 10% to 100% in order to sign contract"
        );

        contractState = ContractState.WaitingRealtorReview;

        deposit = msg.value;
        finalizeDeadline = now + timeBetweenDepositAndFinalization;
    }

    function realtorReviewedClosingConditions(bool accepted) public {
        require(
            realtor == msg.sender,
            "Only realtor can review conditions"
        );

        require(
            contractState == ContractState.WaitingRealtorReview,
            "Wrong contract state"
        );

        if (accepted) {
            closingConditionsReview = ClosingConditionsReview.Accepted;
            contractState = ContractState.WaitingFinalization;
        } else {
            closingConditionsReview = ClosingConditionsReview.Rejected;
            contractState = ContractState.Rejected;

            buyer.transfer(deposit);
        }
    }

    function buyerFinalizeTransaction() public payable {
        require(buyer == msg.sender, "Only buyer can finalize transaction");

        require(
            contractState == ContractState.WaitingFinalization,
            "Wrong contract state"
        );

        require(
            msg.value + deposit == price,
            "Buyer must pay the rest of the price to finalize transaction"
        );

        contractState = ContractState.Finalized;

        //Transfer of ownership
        Factory instanceFactory = Factory(instanceFactoryAddr);
        instanceFactory.setOwner(propertyId, buyer);

        //Transfer of money
        seller.transfer(price - realtorFee);
        realtor.transfer(realtorFee);
    }

    function anyWithdrawFromTransaction() public {
        require(
            buyer == msg.sender || finalizeDeadline <= now,
            "Only buyer can abort before deadline"
        );

        require(
            contractState == ContractState.WaitingFinalization,
            "Wrong contract state"
        );

        contractState = ContractState.Rejected;

        seller.transfer(deposit - realtorFee);
        realtor.transfer(realtorFee);
    }
}
