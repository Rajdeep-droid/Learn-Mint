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
    videoId: "Fj2zIeC9OPE", // Stellar 101
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
    title: "INTRODUCTION TO",
    subtitle: "SOROBAN",
    duration: "3H 45M",
    level: "INTERMEDIATE",
    reward: "10 LEARN + NFT",
    enrolled: "8,201",
    videoId: "k45aZ9M666g", // Intro to Soroban
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
    id: 2,
    title: "SMART CONTRACTS",
    subtitle: "FUNDAMENTALS",
    duration: "4H 30M",
    level: "ADVANCED",
    reward: "50 LEARN + NFT",
    enrolled: "2,847",
    videoId: "W0-tT2-lBEE", // Build your first Soroban Contract
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
    id: 3,
    title: "STELLAR DEFI",
    subtitle: "& AMMS",
    duration: "2H 50M",
    level: "INTERMEDIATE",
    reward: "15 LEARN + NFT",
    enrolled: "5,190",
    videoId: "vVjV-oG3zHk", // AMMs on Stellar
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
];
