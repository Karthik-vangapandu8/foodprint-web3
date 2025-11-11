/**
 * FoodPrint Web3 Wallet Connection Module
 * Supports MetaMask, WalletConnect, and other Web3 providers
 */

// Wait for ethers to be fully loaded
const getEthers = () => {
  return window.ethers || ethers;
};

// Note: This will be loaded after ethers.js and web3modal are included via CDN
let web3Modal;
let provider;
let signer;
let userAddress;

/**
 * Initialize Web3Modal with wallet providers
 */
function initWeb3Modal() {
  const providerOptions = {
    // WalletConnect can be added here if needed
    // walletconnect: {
    //   package: WalletConnectProvider,
    //   options: {
    //     infuraId: "YOUR_INFURA_ID"
    //   }
    // }
  };

  web3Modal = new Web3Modal.default({
    cacheProvider: false,
    providerOptions,
    disableInjectedProvider: false,
  });
}

/**
 * Connect wallet and get user address
 */
async function connectWallet() {
  try {
    // Check if Web3Modal is initialized
    if (!web3Modal) {
      initWeb3Modal();
    }

    // Check if MetaMask or other Web3 provider is installed
    if (!window.ethereum) {
      alert(
        'No Web3 wallet detected! Please install MetaMask or another Web3 wallet extension.'
      );
      window.open('https://metamask.io/download/', '_blank');
      return null;
    }

    // Connect to wallet
    const instance = await web3Modal.connect();
    const ethersLib = getEthers();
    provider = new ethersLib.providers.Web3Provider(instance);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    console.log('Wallet connected:', userAddress);

    // Listen for account changes
    instance.on('accountsChanged', accounts => {
      if (accounts.length === 0) {
        handleDisconnect();
      } else {
        userAddress = accounts[0];
        updateWalletUI(userAddress);
      }
    });

    // Listen for chain changes
    instance.on('chainChanged', chainId => {
      window.location.reload();
    });

    return userAddress;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    alert('Failed to connect wallet: ' + error.message);
    return null;
  }
}

/**
 * Disconnect wallet
 */
async function disconnectWallet() {
  try {
    if (web3Modal) {
      await web3Modal.clearCachedProvider();
    }

    provider = null;
    signer = null;
    userAddress = null;

    console.log('Wallet disconnected');
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
}

/**
 * Show role selection modal
 */
function showRoleSelectionModal() {
  return new Promise((resolve) => {
    const roles = [
      { value: 'farmer', label: '🌾 Farmer', desc: 'Grow and harvest produce' },
      { value: 'wholesaler', label: '📦 Wholesaler', desc: 'Buy and distribute bulk produce' },
      { value: 'distributor', label: '🚚 Distributor', desc: 'Transport and deliver products' },
      { value: 'retailer', label: '🏪 Retailer', desc: 'Sell to end consumers' },
      { value: 'admin', label: '⚙️ Administrator', desc: 'Manage the platform' }
    ];

    // Create modal HTML
    const modalHTML = `
      <div id="roleSelectionModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;">
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%;">
          <h2 style="margin-top: 0; color: #333;">Select Your Role</h2>
          <p style="color: #666; margin-bottom: 20px;">Choose your role in the FoodPrint supply chain:</p>
          <div id="roleOptions">
            ${roles.map(role => `
              <div class="role-option" data-role="${role.value}" style="border: 2px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 5px; cursor: pointer; transition: all 0.3s;">
                <strong style="font-size: 18px;">${role.label}</strong>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${role.desc}</p>
              </div>
            `).join('')}
          </div>
          <button id="cancelRoleSelection" style="margin-top: 20px; padding: 10px 20px; background: #ccc; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add hover effects
    const roleOptions = document.querySelectorAll('.role-option');
    roleOptions.forEach(option => {
      option.addEventListener('mouseenter', () => {
        option.style.borderColor = '#4CAF50';
        option.style.backgroundColor = '#f0f9f0';
      });
      option.addEventListener('mouseleave', () => {
        option.style.borderColor = '#ddd';
        option.style.backgroundColor = 'white';
      });
      option.addEventListener('click', () => {
        const selectedRole = option.getAttribute('data-role');
        document.getElementById('roleSelectionModal').remove();
        resolve(selectedRole);
      });
    });

    // Cancel button
    document.getElementById('cancelRoleSelection').addEventListener('click', () => {
      document.getElementById('roleSelectionModal').remove();
      resolve(null);
    });
  });
}

/**
 * Link wallet to user account on server with role selection
 */
async function linkWalletToAccount(walletAddress, userRole) {
  try {
    // If no role provided, ask user to select one
    if (!userRole) {
      userRole = await showRoleSelectionModal();
      if (!userRole) {
        alert('Role selection cancelled. Wallet connection cancelled.');
        return false;
      }
    }

    // Create a message to sign for verification
    const message = `FoodPrint: Link wallet ${walletAddress} as ${userRole} at ${new Date().toISOString()}`;

    // Sign the message
    const signature = await signer.signMessage(message);

    // Send to server
    const response = await fetch('/app/wallet/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: walletAddress,
        signature: signature,
        message: message,
        userRole: userRole,
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('Wallet linked successfully with role:', userRole);
      return { success: true, role: userRole };
    } else {
      console.error('Failed to link wallet:', data.message);
      alert('Failed to link wallet: ' + data.message);
      return false;
    }
  } catch (error) {
    console.error('Error linking wallet:', error);
    alert('Error linking wallet: ' + error.message);
    return false;
  }
}

/**
 * Unlink wallet from user account
 */
async function unlinkWalletFromAccount() {
  try {
    const response = await fetch('/app/wallet/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      console.log('Wallet unlinked successfully');
      return true;
    } else {
      console.error('Failed to unlink wallet:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error unlinking wallet:', error);
    return false;
  }
}

/**
 * Get wallet connection status from server
 */
async function getWalletStatus() {
  try {
    const response = await fetch('/app/wallet/status');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting wallet status:', error);
    return null;
  }
}

/**
 * Sign data with connected wallet
 */
async function signData(data) {
  try {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    const message =
      typeof data === 'string' ? data : JSON.stringify(data);
    const signature = await signer.signMessage(message);

    return {
      message: message,
      signature: signature,
      address: userAddress,
    };
  } catch (error) {
    console.error('Error signing data:', error);
    throw error;
  }
}

/**
 * Update UI to show wallet connection status
 */
function updateWalletUI(address, role) {
  const walletBtn = document.getElementById('walletConnectBtn');
  const walletAddress = document.getElementById('walletAddress');
  const walletStatus = document.getElementById('walletStatus');

  if (walletBtn) {
    if (address) {
      walletBtn.textContent = 'Disconnect Wallet';
      walletBtn.classList.remove('btn-primary');
      walletBtn.classList.add('btn-success');
    } else {
      walletBtn.textContent = 'Connect Wallet';
      walletBtn.classList.remove('btn-success');
      walletBtn.classList.add('btn-primary');
    }
  }

  if (walletAddress) {
    walletAddress.textContent = address
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : 'Not connected';
  }

  if (walletStatus) {
    if (address) {
      const roleEmoji = {
        'farmer': '🌾',
        'wholesaler': '📦',
        'distributor': '🚚',
        'retailer': '🏪',
        'admin': '⚙️'
      };
      const roleLabel = role ? `${roleEmoji[role] || ''} ${role.charAt(0).toUpperCase() + role.slice(1)}` : 'Connected';
      walletStatus.innerHTML = `<span class="badge badge-success">${roleLabel}</span>`;
    } else {
      walletStatus.innerHTML = '<span class="badge badge-secondary">Not connected</span>';
    }
  }
}

/**
 * Handle wallet disconnect
 */
function handleDisconnect() {
  disconnectWallet();
  updateWalletUI(null);
}

/**
 * Main wallet button click handler
 */
async function handleWalletButtonClick() {
  if (userAddress) {
    // Disconnect
    const confirmed = confirm('Do you want to disconnect your wallet?');
    if (confirmed) {
      await unlinkWalletFromAccount();
      await disconnectWallet();
      updateWalletUI(null);
      alert('Wallet disconnected successfully!');
    }
  } else {
    // Connect
    const address = await connectWallet();
    if (address) {
      // Automatically show role selection and link wallet
      const result = await linkWalletToAccount(address);
      if (result && result.success) {
        updateWalletUI(address, result.role);
        alert(`Welcome! You're now connected as a ${result.role}. You can start using FoodPrint supply chain features.`);
        
        // Refresh page to show role-based features
        setTimeout(() => window.location.reload(), 1000);
      } else {
        // If linking failed, disconnect
        await disconnectWallet();
        updateWalletUI(null);
      }
    }
  }
}

/**
 * Initialize wallet connection on page load
 */
async function initWalletConnection() {
  // Initialize Web3Modal
  initWeb3Modal();

  // Check if user has wallet linked on server
  const status = await getWalletStatus();

  if (status && status.walletConnected) {
    // Try to auto-connect if wallet was previously connected
    try {
      const address = await connectWallet();
      if (
        address &&
        address.toLowerCase() === status.walletAddress.toLowerCase()
      ) {
        updateWalletUI(address, status.userRole);
      }
    } catch (error) {
      console.log('Auto-connect failed:', error);
    }
  }

  // Set up button listener
  const walletBtn = document.getElementById('walletConnectBtn');
  if (walletBtn) {
    walletBtn.addEventListener('click', handleWalletButtonClick);
  }
}

// Export functions for global use
if (typeof window !== 'undefined') {
  window.FoodPrintWallet = {
    connect: connectWallet,
    disconnect: disconnectWallet,
    linkToAccount: linkWalletToAccount,
    unlinkFromAccount: unlinkWalletFromAccount,
    getStatus: getWalletStatus,
    signData: signData,
    getUserAddress: () => userAddress,
    getSigner: () => signer,
  };

  // Auto-initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWalletConnection);
  } else {
    initWalletConnection();
  }
}

