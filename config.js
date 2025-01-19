const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const config = {
    apiUrl: API_URL,
    endpoints: {
        products: `${API_URL}/api/products`,
        login: `${API_URL}/api/login`,
        upload: `${API_URL}/api/upload`,
        admin: `${API_URL}/api/admin`
    }
};
