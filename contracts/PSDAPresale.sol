// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IERC20Cap {
    function cap() external view returns (uint256);
}

contract PSDAPresale is Ownable, Initializable {

    using SafeERC20 for IERC20;

    event TokenPurchase(address indexed beneficiary, uint256 amount);
    event TokenClaim(address indexed beneficiary, uint256 tokenAmount);

    struct UserInfo {
        uint256 daiAmount;
        uint256 depositAmount;
        uint256 claimedAmount;
        uint256 claimableAmount;        
    }

    uint256 public constant DECIMAL = 4;

    uint256[5] public priceAry = [
        25 * 10 ** 18,
        50 * 10 ** 18,
        100 * 10 ** 18,
        200 * 10 ** 18,
        400 * 10 ** 18
    ];

    uint256[5] public stepLimitAry = [
        2000000 * 10 ** DECIMAL,
        4000000 * 10 ** DECIMAL,
        6000000 * 10 ** DECIMAL,
        8000000 * 10 ** DECIMAL,
        10000000 * 10 ** DECIMAL
    ];

    address public dai;
    address public pSDA;

    mapping(address => UserInfo) public userInfos;

    uint256 public maxContribution = 1000000 * 10 ** DECIMAL;
    uint256 public minContribution;
    uint256 public totalDepositAmount;
    uint256 public presaleStartDate;
    uint256 public presaleEndDate;

    uint8 public presaleStep;

    mapping(address => bool) public approvedBuyers;

    function initialize(
        address _pSDA, 
        address _dai
    ) public initializer {
        pSDA = _pSDA;
        dai = _dai;
        presaleStartDate = block.timestamp;
    }

    function setTokens(address _pSDA, address _dai) external onlyOwner {
        pSDA = _pSDA;
        dai = _dai;
    }

    function setPresaleStartDate(uint256 _date) external onlyOwner {
        presaleStartDate = _date;
    }

    function setPresaleEndDate(uint256 _date) external onlyOwner {
        presaleEndDate = _date;
    }

    function setMinContribution(uint256 _minContribution) external onlyOwner() {
        minContribution = _minContribution;
    }

    function setMaxContribution(uint256 _maxContribution) external onlyOwner() {
        maxContribution = _maxContribution;
    }

    function setPriceAry(uint256[5] memory _ary) external onlyOwner() {
        require(_ary.length == 5, "Price array length has to be 5");
        priceAry = _ary;
    }

    function _getCalculatePrice(uint256 _amount, uint256 _step) internal view returns (uint256) {
        return _amount * priceAry[_step] / 1000;
    }

    function _getCalculateAmountFromPrice(uint256 _amount, uint256 _step) internal view returns (uint256) {
        return _amount * 1000 / priceAry[_step];
    }

    function _getCalculateAmount(address _user, uint256 _daiAmount) internal returns (uint256) {
        uint256 purchaseAmount = 0;
        uint256 buyableAmount = _getCalculatePrice(stepLimitAry[presaleStep] - totalDepositAmount, presaleStep);
        if (buyableAmount >= _daiAmount) {
            purchaseAmount = _getCalculateAmountFromPrice(_daiAmount, presaleStep);
            totalDepositAmount = totalDepositAmount + purchaseAmount;
            if(presaleStep == 4 && _daiAmount - buyableAmount > 0) {
                IERC20(dai).safeTransfer(_user, _daiAmount - buyableAmount);
            }
            return purchaseAmount;
        }
        purchaseAmount = _getCalculateAmountFromPrice(buyableAmount, presaleStep) + _getCalculateAmountFromPrice(_daiAmount - buyableAmount, presaleStep + 1);
        totalDepositAmount = totalDepositAmount + purchaseAmount;
        presaleStep = presaleStep + 1;
        return purchaseAmount;
    }

    function buypSDA(uint256 _daiAmount) external {
        uint256 purchaseAmount = _getCalculateAmount(msg.sender, _daiAmount);
        
        _validatePurchase(msg.sender, purchaseAmount);
        IERC20(dai).safeTransferFrom(msg.sender, address(this), _daiAmount);
        
        UserInfo storage user = userInfos[msg.sender];
        user.depositAmount = user.depositAmount + purchaseAmount;
        user.daiAmount = user.daiAmount + _daiAmount;
        
        emit TokenPurchase(msg.sender, purchaseAmount);
    }

    function _validatePurchase(address _buyer, uint256 _amount) internal view {
        require(_amount >= minContribution, "Presale: min contribution criteria not met");
        require(userInfos[_buyer].depositAmount + _amount <= maxContribution, "Presale: max contribution criteria not met");
        this; // ?
    }

    function _getClaimableAmount(address _user) internal view {
        require(block.timestamp + presaleStartDate >= 18 * 30 * 1 days, "Presale: Lock time error");
        uint256 percent = 100;
        for(uint256 mul = 4; mul >= 1; mul--) {
            if (IERC20Cap(pSDA).cap() >= mul * 500 * 10 ** 6 * 10 ** DECIMAL) { // 2B
                percent = percent + (225 * mul);
                break;
            }
        }
        UserInfo memory user = userInfos[_user];
        uint256 amount = user.depositAmount * percent / 1000;
        user.claimableAmount = amount;
    }

    function claimTokens() external {
        UserInfo storage user = userInfos[msg.sender];
        require(user.depositAmount - user.claimedAmount > 0, "Presale: nothing to claim");
        _getClaimableAmount(msg.sender);
        uint256 amount = user.claimableAmount - user.claimedAmount;
        user.claimedAmount = user.claimableAmount;
        user.claimedAmount = user.claimedAmount + amount;
        IERC20(pSDA).transfer(msg.sender, amount);
        emit TokenClaim(msg.sender, amount);
    }

    function withdrawTokens(address token) external onlyOwner()  {
        uint256 wBalance = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransfer(msg.sender, wBalance);
    }

    function getUserContribution(address _user) external view returns(uint256) {
        require(_user != address(0), "Zero address");
        return userInfos[_user].daiAmount;
    }

    function getUserStatus(address _user) external view returns(
        uint256 _daiAmount,
        uint256 _depositAmount,
        uint256 _claimedAmount,
        uint256 _claimableAmount) {
        _daiAmount = userInfos[_user].daiAmount;
        _depositAmount = userInfos[_user].depositAmount;
        _claimedAmount = userInfos[_user].claimedAmount;
        _claimableAmount = userInfos[_user].claimableAmount;
    }

    function getCurrentPrice() external view returns(uint256) {
        return priceAry[presaleStep];
    }
}