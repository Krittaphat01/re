import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Typography, Box, Pagination, 
  IconButton,  CircularProgress, Menu, MenuItem 
} from '@mui/material';
import axios from 'axios';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
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
  image: string; // Add image property
}

const Store: React.FC = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const cardsPerPage = 20;
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  // ตรวจสอบสถานะผู้ใช้ ถ้าไม่ได้ล็อกอินให้ไปที่หน้า Login
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

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    handleUserMenuClose();
  };

  return (
    <Container sx={{ backgroundColor: '#1a1a2e', minHeight: '100vh', minWidth: '100vw', padding: '20px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" color="white">Pokemon Market</Typography>

        <Box display="flex" alignItems="center">
          <IconButton color="primary" onClick={() => setCartOpen(true)}>
            <LocalMallOutlinedIcon sx={{ color: 'red' }} />
          </IconButton>

          {/* User Icon */}
          <IconButton color="primary" onClick={handleUserMenuOpen}>
            <AccountCircleIcon sx={{ color: 'white' }} />
          </IconButton>

          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
          >
            <MenuItem onClick={handleOpenModal}>View Your Orders</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* OrderModal Component */}
      <OrderModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <PokemonCardSearch addToCart={(card) => setCartItems((prev) => [...prev, { id: card.id, name: card.name, price: card.tcgplayer.prices?.normal?.market || 0, quantity: 1, image: card.images.large }])} />

      <Grid container spacing={3} justifyContent="center">
        {cards.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage).map((card) => (
          <Grid item xs={6} sm={3} md={2} lg={2} key={card.id}>
            <ProductCard cardId={card.id} card={card} addToCart={(card) => setCartItems((prev) => [...prev, { id: card.id, name: card.name, price: card.tcgplayer.prices?.normal?.market || 0, quantity: 1, image: card.images.large }])} />
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
        updateQuantity={(id, quantity) => setCartItems((prev) => prev.map((item) => item.id === id ? { ...item, quantity } : item))}
        removeFromCart={(id) => setCartItems((prev) => prev.filter((item) => item.id !== id))}
        clearCart={() => setCartItems([])}
      />
    </Container>
  );
};

export default Store;
