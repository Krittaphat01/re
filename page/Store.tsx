/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Pagination, IconButton, Badge, CircularProgress, Menu, MenuItem, Select, MenuItem as MuiMenuItem, FormControl, InputLabel } from '@mui/material';
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
  set: {
    id: string;
  };
  rarity: string;
  types: string[];
}
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Store: React.FC = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [cardSets, setCardSets] = useState<any[]>([]);
  const [rarities, setRarities] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const cardsPerPage = 20;
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const [selectedSet, setSelectedSet] = useState<string | ''>('');
  const [selectedRarity, setSelectedRarity] = useState<string | ''>('');
  const [selectedType, setSelectedType] = useState<string | ''>('');

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
    const fetchCardSets = async () => {
      try {
        const response = await axios.get('https://api.pokemontcg.io/v2/sets', { headers: { "X-api-key": "bffbe7c7-cf5c-4854-9b63-b51f85a3616c" } });
        setCardSets(response.data.data);
      } catch (error) {
        console.error('Error fetching card sets:', error);
      }
    };
    const fetchRarities = async () => {
      try {
        const response = await axios.get('https://api.pokemontcg.io/v2/rarities', { headers: { "X-api-key": "bffbe7c7-cf5c-4854-9b63-b51f85a3616c" } });
        setRarities(response.data.data.map((item: string) => ({ name: item })));
      } catch (error) {
        console.error('Error fetching rarities:', error);
      }
    };
    const fetchTypes = async () => {
      try {
        const response = await axios.get('https://api.pokemontcg.io/v2/types', { headers: { "X-api-key": "bffbe7c7-cf5c-4854-9b63-b51f85a3616c" } });
        setTypes(response.data.data.map((item: string) => ({ name: item })));
      } catch (error) {
        console.error('Error fetching types:', error);
      }
    };
    fetchCardSets();
    fetchRarities();
    fetchTypes();
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
  const filteredCards = cards.filter((card) => {
    return (
      (selectedSet ? card.set.id === selectedSet : true) &&
      (selectedRarity ? card.rarity === selectedRarity : true) &&
      (selectedType ? card.types.includes(selectedType) : true)
    );
  });
  return (
    <Container
      sx={{
        minHeight: '100%',
        minWidth: '100%',

      }}
    >

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box component="img" src="/public/Group 5.png" alt="Pokemon Market Logo" sx={{ height: 100 }} />
        <Box
          display="flex"
          alignItems="center"
          position="fixed"
          right="16px"
          top="16px"
          zIndex={1000}
        >
          <IconButton color="primary" onClick={() => setCartOpen(true)}>
            <Badge badgeContent={cartItems.length} color="error">
              <LocalMallOutlinedIcon sx={{ color: 'red', fontSize: 52 }} />
            </Badge>
          </IconButton>
          <IconButton color="primary" onClick={handleUserMenuOpen}>
            <AccountCircleIcon sx={{ color: '#3333FF', fontSize: 52 }} />
          </IconButton>
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
      <OrderModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <PokemonCardSearch
        addToCart={(card) => setCartItems((prev) => [
          ...prev,
          {
            id: card.id,
            name: card.name,
            price: Math.max(
              card.tcgplayer?.prices?.normal?.market ?? 0,
              card.tcgplayer?.prices?.holofoil?.market ?? 0,
              card.tcgplayer?.prices?.reverseHolofoil?.market ?? 0
            ),
            quantity: 1,
            image: card.images.large
          }
        ])}
      />
      <Box display="flex" justifyContent="center" mb={2} alignItems="center">
        <FormControl sx={{ width: '200px', marginRight: '10px' }}>
          <InputLabel>Set</InputLabel>
          <Select
            value={selectedSet}
            onChange={(e) => setSelectedSet(e.target.value)}
            label="Set"
          >
            <MuiMenuItem value="">All Sets</MuiMenuItem>
            {cardSets.map((set) => (
              <MuiMenuItem key={set.id} value={set.id}>{set.name}</MuiMenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ width: '200px', marginRight: '10px' }}>
          <InputLabel>Rarity</InputLabel>
          <Select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            label="Rarity"
          >
            <MuiMenuItem value="">All Rarities</MuiMenuItem>
            {rarities.map((rarity) => (
              <MuiMenuItem key={rarity.name} value={rarity.name}>{rarity.name}</MuiMenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ width: '200px', marginRight: '10px' }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            label="Type"
          >
            <MuiMenuItem value="">All Types</MuiMenuItem>
            {types.map((type) => (
              <MuiMenuItem key={type.name} value={type.name}>{type.name}</MuiMenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ปุ่ม Clear Filters */}
        <IconButton
          color="primary"
          onClick={() => {
            setSelectedSet('');
            setSelectedRarity('');
            setSelectedType('');
          }}
          sx={{ ml: 2, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
        >
          Clear
        </IconButton>
      </Box>
      <Grid container spacing={3} justifyContent="center">
        {filteredCards.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage).map((card) => (
          <Grid item xs={6} sm={3} md={2} lg={2} key={card.id}>
            <ProductCard
              cardId={card.id}
              addToCart={(selectedCard) => setCartItems((prev) => [
                ...prev,
                {
                  id: selectedCard.id,
                  name: selectedCard.name,
                  price: selectedCard.price,
                  quantity: 1,
                  image: selectedCard.images.large
                }
              ])}
            />
          </Grid>
        ))}
      </Grid>
      <Pagination
        count={Math.ceil(filteredCards.length / cardsPerPage)}
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
