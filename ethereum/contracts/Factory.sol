pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import "./HomeTransaction.sol";

contract Factory {
    //Address of government account
    address constant govAddress = 0xE9D5500Ca1748f21CCdA50f04D2096145aD40838;

    HomeTransaction[] public contracts;

    //Proprty id (counter)
    uint256 public propId = 0;

    //structure proprety
    struct Property {
        uint256 propertyId;
        string addr;
        string zip;
        string city;
        address currentOwner;
    }

    //structure profile (user)
    struct Profile {
        string profileId;
        string name;
        bool isNotary;
    }

    //A sort of lists of properties mapped by their id + profiles mapped by addresse of users
    mapping(uint256 => Property) public properties;
    mapping(address => Profile) public profiles;

    //Used to give permission to notary only
    modifier onlyNotary() {
        require(
            profiles[msg.sender].isNotary == true,
            "Only Notary can create a contract"
        );
        _;
    }

    //Used to give permission to government only
    modifier onlyGov() {
        require(
            msg.sender == govAddress,
            "Only Government can register a property"
        );
        _;
    }

    function createContract(
        uint256 _propertyId,
        uint256 _realtorFee,
        uint256 _price,
        address payable _seller,
        address payable _buyer
    ) public returns (HomeTransaction homeTransaction) {
        homeTransaction = new HomeTransaction(
            address(this),
            _propertyId,
            _realtorFee,
            _price,
            msg.sender,
            _seller,
            _buyer
        );
        contracts.push(homeTransaction);
    }

    function createProfile(
        address _userAddr,
        string memory _profileId,
        string memory _name,
        bool _isNotary
    ) public {
        profiles[_userAddr] = Profile(_profileId, _name, _isNotary);
    }

    function registerProperty(
        string memory _addr,
        string memory _zip,
        string memory _city,
        address _currentOwner
    ) public {
        propId++;
        properties[propId] = Property(
            propId,
            _addr,
            _zip,
            _city,
            _currentOwner
        );
    }

    function getProperty(uint256 _idProp)
        public
        view
        returns (Property memory property)
    {
        property = properties[_idProp];
    }

    function getProperties(address _ownerAddress) public view returns(Property[] memory){
        uint count;
        for(uint i=1; i <= propId; i++){
            if (properties[i].currentOwner == _ownerAddress){
                count++;
            }
        }

        uint j;
        Property[] memory propertiesOfOwner = new Property[](count);
        for(uint i=1; i <= propId; i++){
            if (properties[i].currentOwner == _ownerAddress){
                propertiesOfOwner[j] = properties[i];
                j++;
            }
        }

        return propertiesOfOwner;
    }

    function setOwner(uint256 _index, address _newOwner) public {
        require(_index <= propId, "Index out of range !");
        properties[_index].currentOwner = _newOwner;
    }

    function getInstance(uint256 index)
        public
        view
        returns (HomeTransaction instance)
    {
        require(index < contracts.length, "index out of range");

        instance = contracts[index];
    }

    function getInstances()
        public
        view
        returns (HomeTransaction[] memory instances)
    {
        instances = contracts;
    }

    function getInstanceCount() public view returns (uint256 count) {
        count = contracts.length;
    }
}
