// Privacy Tax Calculator - Complete Web3 Application Implementation
// Real blockchain interactions with MetaMask on Sepolia testnet

// Browser polyfills for compatibility
(function() {
    'use strict';
    
    // Promise polyfill for older browsers
    if (typeof Promise === 'undefined') {
        window.Promise = require('es6-promise').Promise;
    }
    
    // Object.assign polyfill
    if (typeof Object.assign !== 'function') {
        Object.assign = function(target, varArgs) {
            if (target == null) throw new TypeError('Cannot convert undefined or null to object');
            var to = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                if (nextSource != null) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }
    
    // Array.from polyfill
    if (!Array.from) {
        Array.from = function(arrayLike, mapFn, thisArg) {
            var C = this;
            var items = Object(arrayLike);
            if (arrayLike == null) throw new TypeError('Array.from requires an array-like object - not null or undefined');
            var mapFunction = mapFn === undefined ? undefined : mapFn;
            if (typeof mapFunction !== 'undefined' && typeof mapFunction !== 'function') {
                throw new TypeError('Array.from: when provided, the second argument must be a function');
            }
            var len = parseInt(items.length);
            var A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
            var k = 0;
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFunction) {
                    A[k] = typeof thisArg === 'undefined' ? mapFunction(kValue, k) : mapFunction.call(thisArg, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            A.length = len;
            return A;
        };
    }
    
    // Console polyfill for debugging
    if (typeof console === 'undefined') {
        window.console = {
            log: function() {},
            error: function() {},
            warn: function() {},
            info: function() {}
        };
    }
    
    // Performance.now polyfill
    if (!window.performance) {
        window.performance = {};
    }
    if (!window.performance.now) {
        window.performance.now = function() {
            return Date.now();
        };
    }
})();

// Privacy Tax Calculator - Complete Web3 Application Implementation
// Real blockchain interactions with MetaMask on Sepolia testnet

class PrivacyTaxCalculatorApp {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.account = null;
        this.chainId = null;
        this.selectedScenario = null;
        this.isConnecting = false;
        this.pendingTransactions = new Map();
        
        // Real deployed contract configuration - UPDATE AFTER DEPLOYMENT
        this.contractAddress = "0x2d6A5EA57197E1cf21C641456f573d086349087d"; // Deploy and update this
        this.contractABI = [
            "constructor()",
            "function VERSION() external view returns (uint256)",
            "function owner() external view returns (address)",
            "function totalTaxpayers() external view returns (uint256)",
            "function hasSubmitted(address) external view returns (bool)",
            "function submitTaxInfo(bytes32[2] calldata encryptedIncome, bytes calldata incomeProof, bytes32[2] calldata encryptedDeductions, bytes calldata deductionsProof) external payable",
            "function calculateTax() external",
            "function getTaxOwed() external view returns (bytes32[2] memory)",
            "function isCalculated(address taxpayer) external view returns (bool)",
            "function getSubmissionTime(address taxpayer) external view returns (uint256)",
            "function getCalculationTime(address taxpayer) external view returns (uint256)",
            "function getContractStats() external view returns (uint256, uint256, address, uint256)",
            "function clearTaxRecord() external",
            "function hasValidTaxRecord(address taxpayer) external view returns (bool)",
            "event TaxSubmitted(address indexed taxpayer, uint256 timestamp, bytes32 indexed txHash)",
            "event TaxCalculated(address indexed taxpayer, uint256 timestamp, bytes32 indexed txHash)",
            "event TaxRecordCleared(address indexed taxpayer, uint256 timestamp)"
        ];
        
        // Sepolia network configuration
        this.sepoliaConfig = {
            chainId: '0xaa36a7', // 11155111 in hex
            chainName: 'Sepolia Test Network',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
            },
            rpcUrls: ['https://sepolia.infura.io/v3/', 'https://rpc.sepolia.org/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io/'],
        };
        
        // Tax scenarios with real USD values
        this.scenarios = {
            low: {
                income: 30000,
                deductions: 5000,
                description: "Low Income Scenario",
                expectedTax: 2500, // Approximately 10% effective
                gasEstimate: "150000"
            },
            medium: {
                income: 75000,
                deductions: 12000,
                description: "Medium Income Scenario", 
                expectedTax: 10800, // Mixed bracket calculation
                gasEstimate: "180000"
            },
            high: {
                income: 150000,
                deductions: 25000,
                description: "High Income Scenario",
                expectedTax: 29000, // Progressive calculation
                gasEstimate: "200000"
            },
            custom: {
                income: 0,
                deductions: 0,
                description: "Custom Amount",
                expectedTax: 0,
                gasEstimate: "200000"
            }
        };
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.checkWalletConnection();
        this.updateUI();
    }
    
    setupEventListeners() {
        // MetaMask account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else if (accounts[0] !== this.account) {
                    this.handleAccountChange(accounts[0]);
                }
            });
            
            window.ethereum.on('chainChanged', (chainId) => {
                if (chainId !== this.sepoliaConfig.chainId) {
                    this.showMessage('Please switch to Sepolia testnet', 'warning');
                    this.requestNetworkSwitch();
                } else {
                    window.location.reload();
                }
            });
            
            window.ethereum.on('disconnect', () => {
                this.disconnect();
            });
        }
    }
    
    async checkWalletConnection() {
        if (!window.ethereum) {
            this.showMessage('MetaMask not detected. Please install MetaMask to use this application.', 'error');
            return;
        }
        
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await this.connectWallet();
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
        }
    }
    
    async handleAccountChange(newAccount) {
        this.account = newAccount;
        document.getElementById('connectBtn').textContent = `${newAccount.slice(0, 6)}...${newAccount.slice(-4)}`;
        await this.updateTaxStatus();
    }
    
    disconnect() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.account = null;
        this.chainId = null;
        
        document.getElementById('connectBtn').textContent = 'Connect Wallet';
        document.getElementById('connectBtn').classList.remove('connected');
        document.getElementById('taxStatus').style.display = 'none';
        document.getElementById('scenarioSection').style.display = 'none';
        
        this.showMessage('Wallet disconnected', 'info');
    }
    
    async connectWallet() {
        if (this.isConnecting) return;
        
        try {
            this.isConnecting = true;
            this.showMessage('Connecting to MetaMask...', 'info');
            
            if (!window.ethereum) {
                throw new Error('MetaMask not installed');
            }
            
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length === 0) {
                throw new Error('No accounts available');
            }
            
            // Check network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== this.sepoliaConfig.chainId) {
                await this.requestNetworkSwitch();
            }
            
            // Setup ethers provider and signer
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.account = await this.signer.getAddress();
            this.chainId = chainId;
            
            // Create contract instance
            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);
            
            // Update UI
            document.getElementById('connectBtn').textContent = `${this.account.slice(0, 6)}...${this.account.slice(-4)}`;
            document.getElementById('connectBtn').classList.add('connected');
            document.getElementById('taxpayerAddress').textContent = this.account;
            document.getElementById('accountAddress').textContent = `${this.account.slice(0, 10)}...${this.account.slice(-8)}`;
            
            // Update balance
            await this.updateAccountBalance();
            
            // Verify contract connection
            await this.verifyContractConnection();
            
            // Show tax interface
            document.getElementById('taxStatus').style.display = 'block';
            document.getElementById('scenarioSection').style.display = 'block';
            
            // Load current tax status
            await this.updateTaxStatus();
            await this.loadContractStats();
            
            this.showMessage('✅ Connected to Sepolia testnet!', 'success');
            
        } catch (error) {
            console.error('Wallet connection failed:', error);
            
            // Comprehensive error handling for wallet connection
            if (error.code === 4001) {
                this.showMessage('❌ Connection rejected by user', 'warning');
            } else if (error.code === -32002) {
                this.showMessage('⏳ Connection request already pending in MetaMask', 'warning');
            } else if (error.code === 4900) {
                this.showMessage('❌ MetaMask is disconnected', 'error');
            } else if (error.code === 4901) {
                this.showMessage('❌ MetaMask does not support Sepolia network', 'error');
            } else if (error.message?.includes('No accounts')) {
                this.showMessage('❌ No accounts available in MetaMask', 'error');
            } else if (error.message?.includes('MetaMask not installed')) {
                this.showMessage('❌ MetaMask not detected. Please install MetaMask browser extension.', 'error');
            } else if (error.message?.includes('network')) {
                this.showMessage('❌ Network connection failed. Please check your internet.', 'error');
            } else {
                this.showMessage(`❌ Connection failed: ${error.message || 'Unknown error'}`, 'error');
            }
        } finally {
            this.isConnecting = false;
        }
    }
    
    async requestNetworkSwitch() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.sepoliaConfig.chainId }],
            });
        } catch (switchError) {
            // If network doesn't exist, add it
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [this.sepoliaConfig]
                    });
                    this.showMessage('✅ Sepolia network added to MetaMask', 'success');
                } catch (addError) {
                    console.error('Failed to add network:', addError);
                    if (addError.code === 4001) {
                        this.showMessage('❌ Network addition rejected by user', 'warning');
                    } else {
                        this.showMessage('❌ Failed to add Sepolia network to MetaMask', 'error');
                    }
                    throw addError;
                }
            } else if (switchError.code === 4001) {
                this.showMessage('❌ Network switch rejected by user', 'warning');
                throw switchError;
            } else {
                this.showMessage('❌ Failed to switch to Sepolia network', 'error');
                throw switchError;
            }
        }
    }
    
    async verifyContractConnection() {
        try {
            const version = await this.contract.VERSION();
            const owner = await this.contract.owner();
            console.log(`Contract Version: ${version}, Owner: ${owner}`);
            
            this.updateNetworkStatus(`Sepolia (Contract v${version})`);
        } catch (error) {
            console.error('Contract verification failed:', error);
            this.showMessage('⚠️ Contract verification failed. Please check deployment.', 'warning');
        }
    }
    
    async loadContractStats() {
        try {
            const [totalTaxpayers, deploymentTime, owner, version] = await this.contract.getContractStats();
            
            document.getElementById('totalTaxpayers').textContent = totalTaxpayers.toString();
            document.getElementById('contractOwner').textContent = `${owner.slice(0, 10)}...${owner.slice(-8)}`;
            document.getElementById('deploymentTime').textContent = new Date(Number(deploymentTime) * 1000).toLocaleDateString();
            document.getElementById('contractVersion').textContent = version.toString();
            
            // Show contract stats section
            document.getElementById('contractStats').style.display = 'block';
            document.getElementById('refreshBtn').style.display = 'inline-block';
            
        } catch (error) {
            console.error('Failed to load contract stats:', error);
        }
    }
    
    updateNetworkStatus(status) {
        document.getElementById('networkStatus').textContent = status;
    }
    
    async updateAccountBalance() {
        try {
            if (this.provider && this.account) {
                const balance = await this.provider.getBalance(this.account);
                const balanceInEth = ethers.formatEther(balance);
                const formattedBalance = parseFloat(balanceInEth).toFixed(4);
                
                const balanceElement = document.getElementById('accountBalance');
                if (balanceElement) {
                    balanceElement.textContent = `${formattedBalance} ETH`;
                }
            }
        } catch (error) {
            console.error('Failed to update account balance:', error);
        }
    }
    
    async updateTaxStatus() {
        if (!this.contract || !this.account) return;
        
        try {
            const hasSubmitted = await this.contract.hasSubmitted(this.account);
            const isCalculated = hasSubmitted ? await this.contract.isCalculated(this.account) : false;
            
            let statusMessage = '';
            let showSubmitBtn = false;
            let showCalculateBtn = false;
            let showViewBtn = false;
            
            if (!hasSubmitted) {
                statusMessage = '📝 Ready to submit tax information';
                showSubmitBtn = true;
            } else if (!isCalculated) {
                statusMessage = '🔄 Ready to calculate tax privately';
                showCalculateBtn = true;
                
                const submissionTime = await this.contract.getSubmissionTime(this.account);
                document.getElementById('submissionTime').textContent = new Date(Number(submissionTime) * 1000).toLocaleString();
            } else {
                statusMessage = '✅ Tax calculated - Ready to view encrypted result';
                showViewBtn = true;
                
                const submissionTime = await this.contract.getSubmissionTime(this.account);
                const calculationTime = await this.contract.getCalculationTime(this.account);
                
                document.getElementById('submissionTime').textContent = new Date(Number(submissionTime) * 1000).toLocaleString();
                document.getElementById('calculationTime').textContent = new Date(Number(calculationTime) * 1000).toLocaleString();
            }
            
            document.getElementById('statusMessage').textContent = statusMessage;
            document.getElementById('submitBtn').style.display = showSubmitBtn ? 'inline-block' : 'none';
            document.getElementById('calculateBtn').style.display = showCalculateBtn ? 'inline-block' : 'none';
            document.getElementById('viewBtn').style.display = showViewBtn ? 'inline-block' : 'none';
            document.getElementById('clearBtn').style.display = hasSubmitted ? 'inline-block' : 'none';
            
        } catch (error) {
            console.error('Error updating tax status:', error);
            this.showMessage('Failed to load tax status', 'error');
        }
    }
    
    calculateEstimatedTax(income, deductions) {
        const taxableIncome = Math.max(0, income - deductions);
        let tax = 0;
        
        if (taxableIncome <= 50000) {
            tax = taxableIncome * 0.10;
        } else if (taxableIncome <= 100000) {
            tax = 5000 + (taxableIncome - 50000) * 0.20;
        } else {
            tax = 15000 + (taxableIncome - 100000) * 0.30;
        }
        
        return Math.round(tax);
    }
    
    showMessage(message, type = 'info') {
        const messageBox = document.getElementById('messageBox');
        const statusText = document.getElementById('statusText');
        
        statusText.textContent = `> ${message}`;
        messageBox.style.display = 'block';
        
        // Color coding
        messageBox.className = `message-box ${type}`;
        
        // Auto hide success and info messages
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 5000);
        }
    }
    
    handleBlockchainError(error, operation = 'operation') {
        console.error(`${operation} failed:`, error);
        
        // Standardized error handling for all blockchain operations
        if (error.code === 4001) {
            return `❌ ${operation} cancelled by user`;
        } else if (error.code === -32000) {
            return '❌ Insufficient funds for gas fees. Please add more Sepolia ETH.';
        } else if (error.code === -32002) {
            return `⏳ ${operation} request already pending in MetaMask`;
        } else if (error.code === -32003) {
            return '❌ Transaction rejected due to invalid parameters';
        } else if (error.code === 4100) {
            return '❌ Unauthorized account. Please connect your wallet.';
        } else if (error.code === 4200) {
            return '❌ Unsupported method by wallet';
        } else if (error.code === 4900) {
            return '❌ Wallet disconnected. Please reconnect.';
        } else if (error.code === 4901) {
            return '❌ Wallet does not support the requested chain';
        } else if (error.message?.includes('insufficient funds')) {
            return '❌ Insufficient ETH balance for transaction';
        } else if (error.message?.includes('gas')) {
            return '❌ Gas estimation failed. Transaction may fail.';
        } else if (error.message?.includes('nonce')) {
            return '❌ Transaction nonce error. Please reset MetaMask account.';
        } else if (error.message?.includes('network')) {
            return '❌ Network error. Please check your connection.';
        } else if (error.message?.includes('reverted')) {
            return '❌ Contract execution reverted. Check transaction requirements.';
        } else {
            return `❌ ${operation} failed: ${error.message || 'Unknown error'}`;
        }
    }
    
    async estimateGasForSubmission(income, deductions) {
        try {
            // Create mock encrypted data for gas estimation
            const mockEncryptedIncome = [ethers.keccak256(ethers.toUtf8Bytes(income.toString())), ethers.ZeroHash];
            const mockEncryptedDeductions = [ethers.keccak256(ethers.toUtf8Bytes(deductions.toString())), ethers.ZeroHash];
            
            const gasEstimate = await this.contract.submitTaxInfo.estimateGas(
                mockEncryptedIncome,
                "0x00", // Mock proof
                mockEncryptedDeductions,
                "0x00"  // Mock proof
            );
            
            return gasEstimate * 120n / 100n; // Add 20% buffer
        } catch (error) {
            console.error('Gas estimation failed:', error);
            return 200000n; // Fallback gas limit
        }
    }
    
    async submitTaxInfo() {
        // ===========================================
        // MetaMask 弹窗真实交易核心实现原理
        // ===========================================
        
        // 1. 合约交互流程：
        // - 用户点击按钮 → 调用合约方法 → ethers.js 发送交易 → MetaMask 弹窗确认 → 区块链执行
        
        if (!this.contract || !this.selectedScenario) {
            this.showMessage('Please select a tax scenario first!', 'error');
            return;
        }
        
        let income, deductions;
        
        if (this.selectedScenario === 'custom') {
            income = parseInt(document.getElementById('incomeInput').value) || 0;
            deductions = parseInt(document.getElementById('deductionsInput').value) || 0;
            
            if (income <= 0) {
                this.showMessage('Please enter valid income amount!', 'error');
                return;
            }
            
            if (deductions > income) {
                this.showMessage('Deductions cannot exceed income!', 'error');
                return;
            }
        } else {
            const scenario = this.scenarios[this.selectedScenario];
            income = scenario.income;
            deductions = scenario.deductions;
        }
        
        try {
            // 触发原理：
            // 1. 当调用时，ethers.js 会构造交易
            // 2. 由于合约实例使用了 signer，ethers.js 知道需要用户签名
            // 3. 这会自动触发 MetaMask 的交易确认弹窗
            // 4. 用户确认后，交易被发送到 Sepolia 测试网
            // 5. tx.wait() 等待交易被挖矿确认
            
            this.showMessage('Preparing encrypted tax submission...', 'info');
            
            // Check balance
            const balance = await this.provider.getBalance(this.account);
            const balanceInEth = ethers.formatEther(balance);
            
            if (parseFloat(balanceInEth) < 0.01) {
                this.showMessage('Insufficient Sepolia ETH for gas fees. Please get testnet ETH from faucet.', 'error');
                return;
            }
            
            // Estimate gas
            const gasLimit = await this.estimateGasForSubmission(income, deductions);
            const feeData = await this.provider.getFeeData();
            const estimatedCost = gasLimit * (feeData.gasPrice || 0n);
            
            this.showMessage(`Gas estimate: ${gasLimit.toString()} units (~${ethers.formatEther(estimatedCost)} ETH)`, 'info');
            
            // Create encrypted data (simplified for demo - in production use proper FHE encryption)
            const timestamp = Date.now();
            const encryptedIncome = [
                ethers.keccak256(ethers.toUtf8Bytes(income.toString() + timestamp)), 
                ethers.ZeroHash
            ];
            const encryptedDeductions = [
                ethers.keccak256(ethers.toUtf8Bytes(deductions.toString() + timestamp)), 
                ethers.ZeroHash
            ];
            
            // Create proof data (mock implementation)
            const incomeProof = ethers.toUtf8Bytes(`proof_income_${income}_${timestamp}`);
            const deductionsProof = ethers.toUtf8Bytes(`proof_deductions_${deductions}_${timestamp}`);
            
            // 显示加载状态
            this.showMessage('🔐 Submitting encrypted tax information to blockchain...', 'info');
            
            // 通过 ethers.js 与智能合约交互，MetaMask 作为钱包提供商自动处理交易签名和发送
            // Submit transaction - MetaMask will show confirmation dialog
            const tx = await this.contract.submitTaxInfo(
                encryptedIncome,
                incomeProof,
                encryptedDeductions,
                deductionsProof,
                {
                    gasLimit: gasLimit,
                    gasPrice: feeData.gasPrice
                }
            );
            
            // 更新用户界面提示
            this.showMessage(`Transaction submitted! Hash: ${tx.hash}`, 'info');
            this.addPendingTransaction(tx.hash, 'Tax Submission');
            
            // 等待区块链确认
            // Wait for confirmation
            this.showMessage('⏳ Waiting for blockchain confirmation...', 'info');
            const receipt = await tx.wait();
            
            this.removePendingTransaction(tx.hash);
            
            if (receipt.status === 1) {
                const gasUsed = receipt.gasUsed;
                const actualCost = gasUsed * receipt.gasPrice;
                
                this.showMessage(
                    `✅ Tax information submitted successfully!\n` +
                    `Gas used: ${gasUsed.toString()}\n` +
                    `Cost: ${ethers.formatEther(actualCost)} ETH\n` +
                    `Block: ${receipt.blockNumber}`,
                    'success'
                );
                
                // Clear form
                if (this.selectedScenario === 'custom') {
                    document.getElementById('incomeInput').value = '';
                    document.getElementById('deductionsInput').value = '';
                }
                
                // 刷新页面状态
                await this.updateTaxStatus();
            } else {
                this.showMessage('❌ Transaction failed', 'error');
            }
            
        } catch (error) {
            console.error('Submit tax info failed:', error);
            
            // Comprehensive error handling for different scenarios
            if (error.code === 4001) {
                this.showMessage('❌ Transaction cancelled by user', 'warning');
            } else if (error.code === -32000) {
                this.showMessage('❌ Insufficient funds for gas fees. Please add more Sepolia ETH.', 'error');
            } else if (error.code === -32002) {
                this.showMessage('⏳ Transaction request already pending in MetaMask', 'warning');
            } else if (error.code === -32003) {
                this.showMessage('❌ Transaction rejected due to invalid parameters', 'error');
            } else if (error.code === 4100) {
                this.showMessage('❌ Unauthorized account. Please connect your wallet.', 'error');
            } else if (error.code === 4200) {
                this.showMessage('❌ Unsupported method by wallet', 'error');
            } else if (error.code === 4900) {
                this.showMessage('❌ Wallet disconnected. Please reconnect.', 'error');
            } else if (error.code === 4901) {
                this.showMessage('❌ Wallet does not support the requested chain', 'error');
            } else if (error.message?.includes('insufficient funds')) {
                this.showMessage('❌ Insufficient ETH balance for transaction', 'error');
            } else if (error.message?.includes('gas')) {
                this.showMessage('❌ Gas estimation failed. Transaction may fail.', 'error');
            } else if (error.message?.includes('nonce')) {
                this.showMessage('❌ Transaction nonce error. Please reset MetaMask account.', 'error');
            } else if (error.message?.includes('network')) {
                this.showMessage('❌ Network error. Please check your connection.', 'error');
            } else if (error.message?.includes('reverted')) {
                this.showMessage('❌ Contract execution reverted. Check transaction requirements.', 'error');
            } else {
                this.showMessage(`❌ Transaction failed: ${error.message || 'Unknown error'}`, 'error');
            }
        }
    }
    
    async calculateTax() {
        // ===========================================
        // MetaMask 弹窗真实交易核心实现原理
        // ===========================================
        
        // 1. 合约交互流程：
        // - 用户点击计算按钮 → 调用合约方法 → ethers.js 发送交易 → MetaMask 弹窗确认 → 区块链执行
        // - calculateTax() 是一个改变状态的写操作，需要交易确认和 gas 费
        
        // 触发原理：
        // 1. 当调用时，ethers.js 会构造交易
        // 2. 由于合约实例使用了 signer，ethers.js 知道需要用户签名
        // 3. 这会自动触发 MetaMask 的交易确认弹窗
        // 4. 用户确认后，交易被发送到 Sepolia 测试网
        // 5. tx.wait() 等待交易被挖矿确认
        
        // 状态管理：
        // 显示加载状态
        // 更新用户界面提示
        // 等待区块链确认
        // 刷新页面状态
        
        if (!this.contract) {
            this.showMessage('Please connect your wallet first!', 'error');
            return;
        }
        
        try {
            // 显示加载状态
            this.showMessage('🧮 Preparing tax calculation transaction...', 'info');
            
            // Estimate gas for calculation
            const gasEstimate = await this.contract.calculateTax.estimateGas();
            const gasLimit = gasEstimate * 120n / 100n; // Add 20% buffer
            const feeData = await this.provider.getFeeData();
            const estimatedCost = gasLimit * (feeData.gasPrice || 0n);
            
            // 更新用户界面提示
            this.showMessage(`Gas estimate: ${gasLimit.toString()} units (~${ethers.formatEther(estimatedCost)} ETH)`, 'info');
            
            // Submit calculation transaction - MetaMask will show confirmation
            // 通过 ethers.js 与智能合约交互，MetaMask 作为钱包提供商自动处理交易签名和发送
            const tx = await this.contract.calculateTax({
                gasLimit: gasLimit,
                gasPrice: feeData.gasPrice
            });
            
            // 更新用户界面提示
            this.showMessage(`Calculation transaction submitted! Hash: ${tx.hash}`, 'info');
            this.addPendingTransaction(tx.hash, 'Tax Calculation');
            
            // 等待区块链确认
            // Wait for confirmation
            this.showMessage('⏳ Performing private tax calculation on blockchain...', 'info');
            const receipt = await tx.wait();
            
            this.removePendingTransaction(tx.hash);
            
            if (receipt.status === 1) {
                const gasUsed = receipt.gasUsed;
                const actualCost = gasUsed * receipt.gasPrice;
                
                this.showMessage(
                    `✅ Tax calculated successfully using FHE!\n` +
                    `Gas used: ${gasUsed.toString()}\n` +
                    `Cost: ${ethers.formatEther(actualCost)} ETH\n` +
                    `Block: ${receipt.blockNumber}`,
                    'success'
                );
                
                // 刷新页面状态
                await this.updateTaxStatus();
            } else {
                this.showMessage('❌ Calculation failed', 'error');
            }
            
        } catch (error) {
            console.error('Calculate tax failed:', error);
            
            // Comprehensive error handling
            if (error.code === 4001) {
                this.showMessage('❌ Calculation cancelled by user', 'warning');
            } else if (error.code === -32000) {
                this.showMessage('❌ Insufficient funds for gas fees', 'error');
            } else if (error.code === -32002) {
                this.showMessage('⏳ Calculation request already pending in MetaMask', 'warning');
            } else if (error.message?.includes('insufficient funds')) {
                this.showMessage('❌ Insufficient ETH balance for calculation', 'error');
            } else if (error.message?.includes('reverted')) {
                this.showMessage('❌ Calculation reverted. Ensure you have submitted tax info first.', 'error');
            } else if (error.message?.includes('network')) {
                this.showMessage('❌ Network error during calculation', 'error');
            } else {
                this.showMessage(`❌ Calculation failed: ${error.message || 'Unknown error'}`, 'error');
            }
        }
    }
    
    async viewTaxResult() {
        if (!this.contract) {
            this.showMessage('Please connect your wallet first!', 'error');
            return;
        }
        
        try {
            this.showMessage('🔍 Retrieving your encrypted tax result...', 'info');
            
            // Get encrypted tax result
            const encryptedTaxOwed = await this.contract.getTaxOwed();
            
            this.showMessage(
                `✅ Your tax has been calculated privately!\n\n` +
                `🔐 Encrypted Result Retrieved:\n` +
                `The tax calculation is complete and stored encrypted on the blockchain.\n\n` +
                `📊 In a production system with full FHE integration:\n` +
                `• You would use your private key to decrypt the result\n` +
                `• The decryption would happen locally in your browser\n` +
                `• No one else can see your actual tax amount\n\n` +
                `🔗 View transaction on Sepolia Etherscan for verification`,
                'success'
            );
            
        } catch (error) {
            console.error('View result failed:', error);
            this.showMessage(`Failed to retrieve tax result: ${error.message}`, 'error');
        }
    }
    
    async clearTaxRecord() {
        if (!this.contract) return;
        
        if (!confirm('Are you sure you want to clear your tax record? This action cannot be undone.')) {
            return;
        }
        
        try {
            this.showMessage('🗑️ Clearing tax record...', 'info');
            
            const gasEstimate = await this.contract.clearTaxRecord.estimateGas();
            const gasLimit = gasEstimate * 120n / 100n;
            const feeData = await this.provider.getFeeData();
            
            const tx = await this.contract.clearTaxRecord({
                gasLimit: gasLimit,
                gasPrice: feeData.gasPrice
            });
            
            this.showMessage(`Clear transaction submitted! Hash: ${tx.hash}`, 'info');
            this.addPendingTransaction(tx.hash, 'Clear Record');
            
            const receipt = await tx.wait();
            this.removePendingTransaction(tx.hash);
            
            if (receipt.status === 1) {
                this.showMessage('✅ Tax record cleared successfully!', 'success');
                await this.updateTaxStatus();
                
                // Reset form
                this.selectedScenario = null;
                document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('selected'));
                document.getElementById('selectedScenario').style.display = 'none';
                document.getElementById('taxInputs').style.display = 'none';
            }
            
        } catch (error) {
            console.error('Clear record failed:', error);
            
            // Comprehensive error handling
            if (error.code === 4001) {
                this.showMessage('❌ Clear operation cancelled by user', 'warning');
            } else if (error.code === -32000) {
                this.showMessage('❌ Insufficient funds for gas fees', 'error');
            } else if (error.code === -32002) {
                this.showMessage('⏳ Clear request already pending in MetaMask', 'warning');
            } else if (error.message?.includes('insufficient funds')) {
                this.showMessage('❌ Insufficient ETH balance for clear operation', 'error');
            } else if (error.message?.includes('reverted')) {
                this.showMessage('❌ Clear operation reverted. You may not have a tax record to clear.', 'error');
            } else if (error.message?.includes('network')) {
                this.showMessage('❌ Network error during clear operation', 'error');
            } else {
                this.showMessage(`❌ Failed to clear record: ${error.message || 'Unknown error'}`, 'error');
            }
        }
    }
    
    addPendingTransaction(hash, description) {
        this.pendingTransactions.set(hash, {
            description,
            timestamp: Date.now()
        });
        this.updatePendingTransactionsDisplay();
        this.showTransactionMonitor(hash, description);
    }
    
    removePendingTransaction(hash) {
        this.pendingTransactions.delete(hash);
        this.updatePendingTransactionsDisplay();
        this.hideTransactionMonitor();
    }
    
    updatePendingTransactionsDisplay() {
        const count = this.pendingTransactions.size;
        if (count > 0) {
            this.showMessage(`⏳ ${count} transaction${count > 1 ? 's' : ''} pending confirmation...`, 'info');
        }
    }
    
    showTransactionMonitor(hash, description) {
        const monitor = document.getElementById('transactionMonitor');
        const txHashElement = document.getElementById('txHash');
        const txStatusElement = document.getElementById('txStatus');
        const gasUsedElement = document.getElementById('gasUsed');
        const blockNumberElement = document.getElementById('blockNumber');
        
        if (monitor && txHashElement && txStatusElement && gasUsedElement && blockNumberElement) {
            txHashElement.textContent = `${hash.slice(0, 10)}...${hash.slice(-8)}`;
            txStatusElement.textContent = 'Confirming...';
            gasUsedElement.textContent = 'Calculating...';
            blockNumberElement.textContent = 'Pending...';
            
            monitor.style.display = 'block';
            
            // Monitor transaction progress
            this.monitorTransaction(hash);
        }
    }
    
    async monitorTransaction(hash) {
        try {
            const tx = await this.provider.getTransaction(hash);
            if (tx) {
                const gasUsedElement = document.getElementById('gasUsed');
                const blockNumberElement = document.getElementById('blockNumber');
                const txStatusElement = document.getElementById('txStatus');
                
                if (gasUsedElement) {
                    gasUsedElement.textContent = `Limit: ${tx.gasLimit.toString()}`;
                }
                
                // Wait for receipt
                const receipt = await tx.wait();
                if (receipt) {
                    if (gasUsedElement) gasUsedElement.textContent = receipt.gasUsed.toString();
                    if (blockNumberElement) blockNumberElement.textContent = receipt.blockNumber.toString();
                    if (txStatusElement) txStatusElement.textContent = receipt.status === 1 ? 'Confirmed ✅' : 'Failed ❌';
                    
                    // Update last transaction hash in tax status
                    const lastTxElement = document.getElementById('lastTxHash');
                    if (lastTxElement) {
                        lastTxElement.textContent = `${hash.slice(0, 10)}...${hash.slice(-8)}`;
                    }
                }
            }
        } catch (error) {
            console.error('Transaction monitoring failed:', error);
        }
    }
    
    hideTransactionMonitor() {
        const monitor = document.getElementById('transactionMonitor');
        if (monitor) {
            setTimeout(() => {
                monitor.style.display = 'none';
            }, 3000); // Keep visible for 3 seconds after completion
        }
    }
    
    updateUI() {
        const submitBtn = document.getElementById('submitBtn');
        const calculateBtn = document.getElementById('calculateBtn');
        const viewBtn = document.getElementById('viewBtn');
        const clearBtn = document.getElementById('clearBtn');
        
        if (submitBtn) submitBtn.style.display = 'none';
        if (calculateBtn) calculateBtn.style.display = 'none';
        if (viewBtn) viewBtn.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'none';
    }
}

// Scenario selection function
function selectScenario(scenarioKey) {
    // Remove previous selection
    document.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Select current scenario
    event.target.classList.add('selected');
    taxCalculator.selectedScenario = scenarioKey;
    
    if (scenarioKey === 'custom') {
        document.getElementById('taxInputs').style.display = 'block';
        document.getElementById('selectedScenario').style.display = 'none';
    } else {
        const scenario = taxCalculator.scenarios[scenarioKey];
        const estimatedTax = taxCalculator.calculateEstimatedTax(scenario.income, scenario.deductions);
        
        document.getElementById('displayIncome').textContent = `$${scenario.income.toLocaleString()}`;
        document.getElementById('displayDeductions').textContent = `$${scenario.deductions.toLocaleString()}`;
        document.getElementById('estimatedTax').textContent = `$${estimatedTax.toLocaleString()}`;
        
        document.getElementById('selectedScenario').style.display = 'block';
        document.getElementById('taxInputs').style.display = 'none';
    }
}

// Global functions for HTML button interactions
async function connectWallet() {
    await taxCalculator.connectWallet();
}

async function submitTaxInfo() {
    await taxCalculator.submitTaxInfo();
}

async function calculateTax() {
    await taxCalculator.calculateTax();
}

async function viewTaxResult() {
    await taxCalculator.viewTaxResult();
}

async function clearTaxRecord() {
    await taxCalculator.clearTaxRecord();
}

async function refreshContractStats() {
    await taxCalculator.loadContractStats();
    taxCalculator.showMessage('✅ Contract statistics refreshed!', 'success');
}

// Initialize the application when page loads
const taxCalculator = new PrivacyTaxCalculatorApp();