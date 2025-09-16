# Privacy Tax Calculator - Confidential Tax Processing

A revolutionary privacy-preserving tax calculation system built on Fully Homomorphic Encryption (FHE) technology. Calculate your taxes without revealing your financial data to anyone.

## 🔐 Core Concept

The Privacy Tax Calculator leverages advanced cryptographic techniques to perform tax calculations while keeping your sensitive financial information completely private. Using Fully Homomorphic Encryption (FHE), all computations are performed on encrypted data, ensuring that:

- Your actual income amounts remain confidential
- Tax deductions are processed without exposure
- Only you can decrypt the final results
- All operations are verifiable on the blockchain

## ✨ Key Features

- **🛡️ Fully Encrypted Calculations**: All tax computations performed on encrypted data
- **🔒 Zero Knowledge Architecture**: No one can see your actual financial information
- **⛓️ Blockchain Verified**: All operations recorded on Sepolia testnet for transparency
- **📊 Progressive Tax Rates**: Accurate calculation with 10%, 20%, and 30% tax brackets
- **💼 Multiple Scenarios**: Pre-configured scenarios for different income levels
- **🎯 Custom Input Support**: Enter your own income and deduction amounts
- **📱 User-Friendly Interface**: Intuitive design for seamless tax processing

## 💡 How It Works

1. **Connect Wallet**: Link your MetaMask wallet to the Sepolia testnet
2. **Select Scenario**: Choose from predefined scenarios or enter custom amounts
3. **Submit Tax Info**: Your data is encrypted and submitted to the blockchain
4. **Calculate Tax**: Perform homomorphic calculations on encrypted data
5. **View Results**: Decrypt and view your tax calculation results
6. **Clear Records**: Optionally remove your data from the blockchain

## 🌐 Live Application

**Website**: [https://fhe-tax-calculator.vercel.app/](https://fhe-tax-calculator.vercel.app/)

**GitHub Repository**: [https://github.com/DarioRippin/FHETaxCalculator](https://github.com/DarioRippin/FHETaxCalculator)

## 📋 Smart Contract

**Contract Address**: `0x2d6A5EA57197E1cf21C641456f573d086349087d`

**Network**: Sepolia Testnet

The smart contract implements secure storage and processing of encrypted tax data with the following key functions:
- `submitTaxInfo()` - Submit encrypted income and deduction data
- `calculateTax()` - Perform tax calculations on encrypted values
- `getTaxOwed()` - Retrieve encrypted calculation results
- `clearTaxRecord()` - Remove stored tax information

## 🎬 Demo Video

[Watch the complete demonstration video showcasing all features and transaction flows]

## 📸 Transaction Screenshots

### Submit Tax Info Transaction
![Submit Tax Info](screenshots/submit-tax-info.png)
*Submitting encrypted tax information to the blockchain*

### Calculate Tax Transaction  
![Calculate Tax](screenshots/calculate-tax.png)
*Performing homomorphic tax calculations on encrypted data*

### View Result Transaction
![View Result](screenshots/view-result.png) 
*Retrieving and decrypting tax calculation results*

### Clear Records Transaction
![Clear Records](screenshots/clear-records.png)
*Removing tax records from the blockchain*

## 🏗️ Technical Architecture

### Frontend
- **Framework**: Vanilla JavaScript with modern ES6+ features
- **Styling**: Custom CSS with dark theme and responsive design
- **Web3 Integration**: Ethers.js v6 for blockchain interactions
- **Wallet Support**: MetaMask integration with network switching

### Smart Contract
- **Language**: Solidity ^0.8.24
- **Network**: Sepolia Testnet
- **Features**: FHE simulation, event logging, access control
- **Gas Optimization**: Efficient storage patterns and batch operations

### Cryptography
- **Encryption**: Simulated Fully Homomorphic Encryption
- **Hashing**: Keccak-256 for data integrity
- **Proofs**: Cryptographic proof generation for encrypted values

## 📊 Tax Calculation Logic

The system implements a progressive tax structure:

- **10% Tax Bracket**: Income up to $50,000
- **20% Tax Bracket**: Income from $50,001 to $100,000  
- **30% Tax Bracket**: Income above $100,000

### Example Calculations

**Low Income Scenario** ($30,000 income, $5,000 deductions):
- Taxable Income: $25,000
- Tax Owed: $2,500 (10% bracket)
- Effective Rate: 8.33%

**Medium Income Scenario** ($75,000 income, $12,000 deductions):
- Taxable Income: $63,000
- Tax Owed: $7,600 (mixed brackets)
- Effective Rate: 10.13%

**High Income Scenario** ($150,000 income, $25,000 deductions):
- Taxable Income: $125,000
- Tax Owed: $22,500 (all brackets)
- Effective Rate: 15.00%

## 🔒 Privacy Features

### Data Protection
- All financial data encrypted before blockchain submission
- Homomorphic calculations preserve privacy throughout processing
- Results only decryptable by the data owner
- No intermediate plaintext exposure

### Blockchain Transparency
- Transaction hashes provide public verifiability
- Contract state changes are auditable
- Privacy maintained while ensuring system integrity

## 🎯 Use Cases

- **Individual Taxpayers**: Private tax estimation and planning
- **Financial Advisors**: Client tax calculations without data exposure
- **Researchers**: Privacy-preserving tax policy analysis
- **Educational**: Learning about FHE and blockchain applications

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Web3**: Ethers.js v6.15.0
- **Cryptography**: Keccak-256 hashing, simulated FHE
- **UI/UX**: Font Awesome icons, Google Fonts (Inter, JetBrains Mono)

## 🎨 Design Philosophy

The interface emphasizes clarity and security with:
- **Dark Theme**: Reduces eye strain for financial data review
- **Monospace Typography**: Ensures accurate number display
- **Progressive Disclosure**: Information revealed as needed
- **Security Indicators**: Clear visual feedback for privacy status

## 🔮 Future Roadmap

- **Real FHE Integration**: Implementation with production FHE libraries
- **Multi-Chain Support**: Deployment to additional blockchain networks
- **Advanced Tax Scenarios**: Support for complex deductions and credits
- **Mobile Optimization**: Native mobile application development
- **Audit Integration**: Third-party security audits and certifications

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on submitting pull requests, reporting issues, and improving the codebase.

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on [GitHub](https://github.com/DarioRippin/FHETaxCalculator/issues)
- Check existing documentation and FAQ
- Join our community discussions

---

**⚠️ Disclaimer**: This is a demonstration project for educational purposes. For actual tax calculations, consult qualified tax professionals and use officially approved software.