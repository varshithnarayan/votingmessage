let blockchain = []; // Array to hold the blockchain
let peer = null;
let conn = null;

// Initialize PeerJS
function initializePeer() {
    peer = new Peer(); // Create a new peer with a unique ID

    peer.on('open', (id) => {
        document.getElementById('peer-id').textContent = `Your Peer ID: ${id}`;
        console.log('Your Peer ID:', id); // Debug: Log Peer ID
    });

    peer.on('connection', (connection) => {
        conn = connection;
        console.log('Incoming peer connection:', connection.peer); // Debug: Log incoming connection
        handleConnection(conn);
    });
}

// Handle peer connections
function handleConnection(connection) {
    connection.on('data', (data) => {
        if (data.type === 'sync') {
            if (data.blockchain.length > blockchain.length) {
                blockchain = data.blockchain;
                console.log('Blockchain synced with peer. New length:', blockchain.length); // Debug: Log blockchain length
                updateBlockchainDisplay();
            }
        } else if (data.type === 'newBlock') {
            blockchain.push(data.block);
            console.log('New block received from peer:', data.block); // Debug: Log new block
            updateBlockchainDisplay();
        }
    });
}

// Connect to another peer
document.getElementById('connect-peer').addEventListener('click', () => {
    const peerId = document.getElementById('peer-connect-id').value;
    conn = peer.connect(peerId);

    conn.on('open', () => {
        console.log('Connected to peer:', peerId); // Debug: Log successful connection
        conn.send({ type: 'sync', blockchain: blockchain });
        console.log('Syncing blockchain with peer:', blockchain.length); // Debug: Log syncing process

        conn.on('data', (data) => {
            if (data.type === 'sync') {
                blockchain = data.blockchain;
                console.log('Received synced blockchain from peer. New length:', blockchain.length); // Debug: Log synced length
                updateBlockchainDisplay();
            } else if (data.type === 'newBlock') {
                blockchain.push(data.block);
                console.log('New block received from peer:', data.block); // Debug: Log new block received
                updateBlockchainDisplay();
            }
        });
    });
});

// Create a new vote (block)
document.getElementById('vote-btn').addEventListener('click', () => {
    const vote = document.getElementById('vote').value;
    if (vote.trim() === "") return;

    const previousHash = blockchain.length ? blockchain[blockchain.length - 1].hash : '0';
    const block = {
        index: blockchain.length + 1,
        vote: vote,
        previousHash: previousHash,
        timestamp: Date.now(),
        hash: calculateHash(vote, previousHash)
    };

    blockchain.push(block);
    console.log('New block created:', block); // Debug: Log newly created block
    updateBlockchainDisplay();

    // Broadcast the new block to all connected peers
    if (conn) {
        conn.send({ type: 'newBlock', block: block });
        console.log('Broadcasting new block to peers:', block); // Debug: Log broadcast action
    }
});

// Function to calculate hash for the block
function calculateHash(vote, previousHash) {
    return String(vote + previousHash + Date.now()); // Simple hash function for demonstration
}

// Update the blockchain display
function updateBlockchainDisplay() {
    const blockchainDisplay = document.getElementById('blockchain-display');
    blockchainDisplay.value = JSON.stringify(blockchain, null, 2); // Pretty print the blockchain
    console.log('Blockchain display updated:', blockchain); // Debug: Log updated blockchain display
}

// Toggle Peer ID visibility
document.getElementById('show-peer-id').addEventListener('click', () => {
    const peerIdSection = document.getElementById('peer-id-section');
    peerIdSection.style.display = peerIdSection.style.display === 'none' ? 'block' : 'none';
});

// Toggle Blockchain display visibility
document.getElementById('show-blockchain').addEventListener('click', () => {
    const blockchainSection = document.getElementById('blockchain-section');
    blockchainSection.style.display = blockchainSection.style.display === 'none' ? 'block' : 'none';
});

// Initialize PeerJS on page load
initializePeer();
