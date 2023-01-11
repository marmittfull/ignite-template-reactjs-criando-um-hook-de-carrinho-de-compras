import { api } from '../services/api';

export const verifyItemStock = async (productId : number) => {
    const { data } = await api.get('/stock/' + productId);
    return data.amount || 0
}