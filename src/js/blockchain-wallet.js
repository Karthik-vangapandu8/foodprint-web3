/**
 * FoodPrint Blockchain Wallet Integration
 * Handles signing harvest/storage entries with user's connected wallet
 */

// Handle "Add to Blockchain" button clicks
document.addEventListener('DOMContentLoaded', function() {
  // Find all "Add to Blockchain" buttons
  const blockchainButtons = document.querySelectorAll('[onclick*="addToBlockchain"]');
  
  blockchainButtons.forEach(button => {
    // Remove the old onclick handler
    button.removeAttribute('onclick');
    
    // Add new handler that uses wallet signing
    button.addEventListener('click', async function(e) {
      e.preventDefault();
      
      // Get the log ID from the button's data or nearby element
      const row = button.closest('tr');
      const logId = row ? row.querySelector('td:first-child').textContent.trim() : null;
      
      if (!logId) {
        alert('Could not find harvest/storage ID');
        return;
      }
      
      // Check if wallet is connected
      if (!window.FoodPrintWallet || !window.FoodPrintWallet.getUserAddress()) {
        alert('Please connect your wallet first! Click the "Connect Wallet" button in the header.');
        return;
      }
      
      try {
        button.disabled = true;
        button.textContent = 'Signing...';
        
        // Determine if this is harvest or storage based on URL
        const isHarvest = window.location.pathname.includes('harvest');
        const endpoint = isHarvest ? 
          '/app/harvest/save/blockchain/wallet' : 
          '/app/storage/save/blockchain/wallet';
        
        // Get the entry data
        const dataResponse = await fetch(isHarvest ? '/app/harvest' : '/app/storage');
        
        // Create data to sign
        const blockchainData = {
          logID: logId,
          timestamp: new Date().toISOString(),
          userAddress: window.FoodPrintWallet.getUserAddress(),
        };
        
        // Sign the data with wallet
        const message = `FoodPrint: Sign ${isHarvest ? 'harvest' : 'storage'} entry ${logId} at ${blockchainData.timestamp}`;
        
        const signedData = await window.FoodPrintWallet.signData(message);
        
        // Send to server
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            logID: logId,
            signature: signedData.signature,
            message: signedData.message,
            walletAddress: signedData.address,
            blockchainData: blockchainData,
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert(`✅ Success! ${isHarvest ? 'Harvest' : 'Storage'} entry signed with your wallet!\n\nWallet: ${signedData.address}\nSignature: ${signedData.signature.substring(0, 20)}...`);
          
          // Update button
          button.classList.remove('btn-success');
          button.classList.add('btn-secondary');
          button.textContent = '✓ Signed';
          button.disabled = true;
          
          // Reload page to show updated status
          setTimeout(() => window.location.reload(), 1500);
        } else {
          throw new Error(result.message || 'Failed to sign entry');
        }
        
      } catch (error) {
        console.error('Blockchain signing error:', error);
        alert(`❌ Error signing with wallet: ${error.message}\n\nMake sure your wallet is connected and you approved the signature request.`);
        button.disabled = false;
        button.textContent = 'Add to Blockchain';
      }
    });
  });
});

// Alternative: Intercept old blockchain calls and redirect to wallet
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const url = args[0];
  
  // Intercept old Algorand blockchain calls
  if (typeof url === 'string' && 
      (url.includes('/app/harvest/save/blockchain') || 
       url.includes('/app/storage/save/blockchain')) &&
      !url.includes('/wallet')) {
    
    const response = await originalFetch(...args);
    const data = await response.json().catch(() => ({}));
    
    // If Algorand not configured, show helpful message
    if (data.useWalletSigning) {
      alert('💡 Algorand blockchain not configured.\n\nPlease use your connected wallet to sign instead!\n\n✅ Your MetaMask wallet is already connected.\n✅ Just click "Add to Blockchain" again - it will use your wallet automatically.');
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: response.headers
      });
    }
    
    return response;
  }
  
  return originalFetch(...args);
};

console.log('✅ Blockchain wallet integration loaded');





