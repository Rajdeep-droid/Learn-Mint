export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Course {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  level: string;
  reward: string;
  enrolled: string;
  videoId: string; // YouTube Video ID
  questions: QuizQuestion[];
}

export const COURSES: Course[] = [
  {
    id: 0,
    title: "STELLAR PROTOCOL",
    subtitle: "FUNDAMENTALS",
    duration: "2H 15M",
    level: "BEGINNER",
    reward: "5 LEARN + NFT",
    enrolled: "12,450",
    videoId: "Yr1EqM18UxA", // Stellar Blockchain Explained
    questions: [
      {
        question: "What consensus mechanism does the Stellar network use?",
        options: ["Proof of Work (PoW)", "Stellar Consensus Protocol (SCP)", "Delegated Proof of Stake", "Proof of Authority"],
        correctIndex: 1,
      },
      {
        question: "What is the primary native asset of the Stellar network?",
        options: ["Bitcoin", "Ethereum", "Lumens (XLM)", "LEARN"],
        correctIndex: 2,
      },
      {
        question: "What is the main goal of the Stellar network?",
        options: ["Smart contract heavy execution", "Cross-border payments & asset issuance", "Anonymous private transactions", "File storage"],
        correctIndex: 1,
      },
      {
        question: "What is a 'Trustline' in the Stellar ecosystem?",
        options: ["A connection between two accounts", "Permission to hold a non-native asset", "A multi-signature requirement", "The ledger sync protocol"],
        correctIndex: 1,
      },
      {
        question: "How long does a typical Stellar transaction take to confirm?",
        options: ["10 minutes", "~3-5 seconds", "~30 seconds", "2 minutes"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 1,
    title: "ASSET ISSUANCE",
    subtitle: "ON STELLAR",
    duration: "1H 45M",
    level: "BEGINNER",
    reward: "5 LEARN + NFT",
    enrolled: "6,320",
    videoId: "iicu5jdyA44", // Introduction to Stellar Development
    questions: [
      {
        question: "Who can issue assets on the Stellar network?",
        options: ["Only banks", "Only the Stellar Development Foundation", "Anyone", "Only validated nodes"],
        correctIndex: 2,
      },
      {
        question: "What two things are required to represent an asset on Stellar?",
        options: ["Asset Code and Issuer Account ID", "Smart Contract and Asset Code", "Issuer Name and Ticker", "Token ID and Private Key"],
        correctIndex: 0,
      },
      {
        question: "Which operation is used to send issued assets?",
        options: ["Mint Asset", "Payment", "Issue Token", "Create Trustline"],
        correctIndex: 1,
      },
      {
        question: "What must a receiver do before receiving a non-native asset?",
        options: ["Pay a fee", "Establish a Trustline", "Run a node", "Sign a smart contract"],
        correctIndex: 1,
      },
      {
        question: "Can an issuer revoke access to an asset?",
        options: ["No, it's immutable", "Yes, if they use authorization flags (Auth Revocable)", "Only if they ask validators", "Only within 24 hours"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 2,
    title: "INTRODUCTION TO",
    subtitle: "SOROBAN",
    duration: "3H 45M",
    level: "INTERMEDIATE",
    reward: "10 LEARN + NFT",
    enrolled: "8,201",
    videoId: "T9Wa2AW-cK4", // Introduction to Soroban
    questions: [
      {
        question: "What is Soroban?",
        options: ["A new consensus algorithm", "Stellar's native smart contract platform", "A decentralized exchange", "A cross-chain bridge"],
        correctIndex: 1,
      },
      {
        question: "Which programming language is primarily used to write Soroban contracts?",
        options: ["Solidity", "Rust", "Go", "TypeScript"],
        correctIndex: 1,
      },
      {
        question: "What environment do Soroban contracts run in?",
        options: ["EVM", "WebAssembly (WASM)", "LLVM", "JVM"],
        correctIndex: 1,
      },
      {
        question: "Why was Soroban built on top of Stellar?",
        options: ["To slow down the network", "To compete with Bitcoin", "To add Turing-complete logic to a fast, scalable network", "To replace XLM"],
        correctIndex: 2,
      },
      {
        question: "Which tool is used to test Soroban contracts locally?",
        options: ["Hardhat", "Truffle", "Soroban CLI", "Foundry"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 3,
    title: "STELLAR DEFI",
    subtitle: "& AMMS",
    duration: "2H 50M",
    level: "INTERMEDIATE",
    reward: "15 LEARN + NFT",
    enrolled: "5,190",
    videoId: "DNCCzYCURf8", // Why Develop on Stellar
    questions: [
      {
        question: "What does AMM stand for?",
        options: ["Automated Market Maker", "Automatic Money Machine", "Asynchronous Market Mechanism", "Asset Minting Module"],
        correctIndex: 0,
      },
      {
        question: "How is price determined in a standard Liquidity Pool?",
        options: ["By a centralized order book", "By the ratio of the two assets in the pool (x * y = k)", "By external oracles only", "By network validators voting"],
        correctIndex: 1,
      },
      {
        question: "What happens when you provide liquidity to a Stellar AMM?",
        options: ["You receive pool shares representing your portion of the pool", "Your assets are locked forever", "You become a network validator", "You receive fixed interest payments"],
        correctIndex: 0,
      },
      {
        question: "Are AMMs native to the Stellar Protocol?",
        options: ["No, they require complex smart contracts", "Yes, they are implemented natively at Protocol 18", "Only on the Futurenet", "No, they only exist on Ethereum"],
        correctIndex: 1,
      },
      {
        question: "What is Impermanent Loss?",
        options: ["Losing your seed phrase", "A loss in value when providing liquidity compared to simply holding the assets", "When a transaction fails and fees are lost", "A bug in the smart contract"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 4,
    title: "SMART CONTRACTS",
    subtitle: "FUNDAMENTALS",
    duration: "4H 30M",
    level: "ADVANCED",
    reward: "50 LEARN + NFT",
    enrolled: "2,847",
    videoId: "FXmwC9kdFd4", // Rust Essentials for Soroban
    questions: [
      {
        question: "What attribute is used to expose a Rust function as a Soroban contract invocation?",
        options: ["#[contractimpl]", "#[contract]", "#[expose]", "#[soroban_fn]"],
        correctIndex: 0,
      },
      {
        question: "How do you access the execution context in a Soroban function?",
        options: ["Through the 'this' keyword", "By passing the 'Env' object as the first parameter", "Using global variables", "Through the 'Ctx' object"],
        correctIndex: 1,
      },
      {
        question: "Which macro is used to define the contract type?",
        options: ["#[contracttype]", "#[type]", "#[derive(Contract)]", "#[soroban_type]"],
        correctIndex: 0,
      },
      {
        question: "How do you store persistent data on the ledger in Soroban?",
        options: ["env.storage().persistent().set()", "env.db.write()", "state.push()", "env.ledger().save()"],
        correctIndex: 0,
      },
      {
        question: "How do you handle authentication in Soroban?",
        options: ["Using require_auth() on an Address object", "Using msg.sender", "Validating signatures manually", "Through IP whitelisting"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 5,
    title: "ADVANCED SOROBAN",
    subtitle: "DAPP DEVELOPMENT",
    duration: "5H 15M",
    level: "ADVANCED",
    reward: "100 LEARN + NFT",
    enrolled: "1,204",
    videoId: "6ukJ8enVsoY", // Stellar Explained in 3 Mins
    questions: [
      {
        question: "How do Soroban contracts interact with native Stellar assets?",
        options: ["They cannot", "Using the wrapped SAC (Stellar Asset Contract)", "By creating a bridge", "Through a centralized API"],
        correctIndex: 1,
      },
      {
        question: "What is the purpose of 'require_auth_for_args'?",
        options: ["To restrict function calls to admins", "To assert that a specific address authorized the exact arguments", "To validate the sender's balance", "To check the transaction fee"],
        correctIndex: 1,
      },
      {
        question: "How are contract upgrades handled in Soroban?",
        options: ["Contracts are immutable and cannot be upgraded", "By calling env.deployer().update_current_contract_wasm()", "By asking validators to vote", "By sending a payment to the network"],
        correctIndex: 1,
      },
      {
        question: "What data structure is recommended for mapping keys to values in Soroban?",
        options: ["std::collections::HashMap", "soroban_sdk::Map", "Vec", "Array"],
        correctIndex: 1,
      },
      {
        question: "What happens if a contract invocation exceeds the gas limit?",
        options: ["The transaction fails and changes are rolled back", "It charges the sender more automatically", "It pauses and resumes later", "The network burns the contract"],
        correctIndex: 0,
      },
    ],
  }
];
