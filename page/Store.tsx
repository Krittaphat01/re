import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Pagination, IconButton, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ProductCard from '../components/ProductCard';
import PokemonCardSearch from '../components/PokemonCardSearch';
import Cart from '../components/Cart';
import OrderModal from '../components/OrderModal';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';

interface CardType {
  id: string;
  name: string;
  images: {
    large: string;
  };
  tcgplayer: {
    prices?: {
      normal?: { market: number };
    };
  };
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const Store: React.FC = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const cardsPerPage = 20;
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // ตรวจสอบการเข้าสู่ระบบ หากไม่มีผู้ใช้จะนำไปที่หน้า Login
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      } else {
        setCurrentUser(user);
      }
    });
    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get('https://api.pokemontcg.io/v2/cards', {
          headers: { "X-api-key": "bffbe7c7-cf5c-4854-9b63-b51f85a3616c" }
        });
        setCards(response.data.data);
      } catch (error) {
        console.error('Error fetching cards:', error);
      }
    };

    fetchCards();
  }, []);

  // แสดง loading spinner ถ้ายังไม่ทราบสถานะผู้ใช้
  if (!currentUser) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = cards.slice(indexOfFirstCard, indexOfLastCard);

  const addToCart = (card: CardType) => {
    setCartItems((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === card.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === card.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        { id: card.id, name: card.name, price: card.tcgplayer.prices?.normal?.market || 0, quantity: 1 }
      ];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prevCart) => prevCart.map((item) => item.id === id ? { ...item, quantity } : item));
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <Container sx={{ backgroundColor: '#1a1a2e', minHeight: '100vh', minWidth: '100vw', padding: '20px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" color="white">Pokemon Market</Typography>
        <IconButton color="primary" onClick={() => setCartOpen(true)}>
          <LocalMallOutlinedIcon sx={{ color: 'white' }} />
        </IconButton>
      </Box>

      <PokemonCardSearch addToCart={addToCart} />
      <Box display="flex" justifyContent="center" mt={3}>
        <Button onClick={handleOpenModal} variant="contained" color="primary">
          View Your Orders
        </Button>
      </Box>

      {/* OrderModal Component */}
      <OrderModal open={modalOpen} onClose={handleCloseModal} />

      <Grid container spacing={3} justifyContent="center">
        {currentCards.map((card) => (
          <Grid item xs={6} sm={3} md={2} lg={2} key={card.id}>
            <ProductCard cardId={card.id} card={card} addToCart={addToCart} />
          </Grid>
        ))}
      </Grid>

      <Pagination
        count={Math.ceil(cards.length / cardsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        sx={{ display: 'flex', justifyContent: 'center', color: 'white', mt: 2 }}
      />

      <Cart 
        open={cartOpen} 
        onClose={() => setCartOpen(false)} 
        cartItems={cartItems} 
        updateQuantity={updateQuantity} 
        removeFromCart={removeFromCart} 
        clearCart={clearCart} 
      />
    </Container>
  );
};

export default Store;
