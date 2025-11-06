// Mock data removed - now using real API data from backend

export const mockSubmitOrder = async (orderData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Mock order submitted:', orderData);
      resolve({ success: true, orderId: Math.random().toString(36).substr(2, 9) });
    }, 1000);
  });
};

export const mockSubmitContact = async (contactData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Mock contact form submitted:', contactData);
      resolve({ success: true });
    }, 1000);
  });
};