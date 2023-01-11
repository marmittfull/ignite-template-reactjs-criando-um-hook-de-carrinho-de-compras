import { api } from '../services/api';

export const getProductInformation = async (productId : number) => {
    const { data } = await api.get('/products/' + productId);
    return data;
}