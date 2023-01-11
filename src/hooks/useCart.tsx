import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';
import { getProductInformation } from '../util/getProductInformation';
import { verifyItemStock } from '../util/verifyItemStock';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  useEffect(() => {
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
  }, [cart])

  const addProduct = async (productId: number) => {
    try {
      const itemStock = await verifyItemStock(productId);
      const idxItemOnCart = cart.findIndex(product => product.id == productId);
      const itemOnCart = cart[idxItemOnCart];
       if(Math.max(itemOnCart?.amount, 0) == itemStock){
         throw 'Quantidade solicitada fora de estoque';
       }
      const newCart = structuredClone(cart);
      if(idxItemOnCart > -1){
        newCart[idxItemOnCart].amount += 1;
      } else {
        const product = await getProductInformation(productId);
        product.amount = 1;
        newCart.push({
          ...product
        })
      }
      setCart(newCart);
    } catch(err) {
      toast.error(err || 'Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCart = cart.filter(product => product.id != productId);
      setCart(newCart);
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    if(amount > 0){
      try {
        const itemStock = await verifyItemStock(productId);
        const idxItemOnCart = cart.findIndex(product => product.id == productId);
        if(Math.max(amount, 1) > itemStock){
          throw 'Quantidade solicitada fora de estoque';
        }
        const newCart = structuredClone(cart);
        newCart[idxItemOnCart].amount = amount;      
        setCart(newCart);      
      } catch(err) {
        toast.error(err || 'Erro na alteração de quantidade do produto')
      }
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
