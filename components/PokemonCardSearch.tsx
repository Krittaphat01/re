import React, { useState, useEffect, useCallback } from 'react';
import { TextField, Grid, Card, CardMedia, CardContent, Typography, Button, CircularProgress, Alert, Pagination } from '@mui/material';
import axios from 'axios';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';

interface CardType {
  id: string;
  name: string;
  images: { large: string };
  tcgplayer?: {
    prices?: {
      normal?: { market: number };
      holofoil?: { market: number };
      reverseHolofoil?: { market: number };
    };
  };
  price?: number;
}

interface PokemonCardSearchProps {
  addToCart: (card: CardType) => void;
}

const PokemonCardSearch: React.FC<PokemonCardSearchProps> = ({ addToCart }) => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const fetchCards = useCallback(async (term: string) => {
    if (!term.trim()) {
      setCards([]); // 🔹 ล้างผลการค้นหาถ้าไม่มีค่าในช่องค้นหา
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=name:*${term}*`, {
        headers: { 'X-api-key': 'bffbe7c7-cf5c-4854-9b63-b51f85a3616c' },
      });

      const fetchedCards = response.data.data.map((card: CardType) => ({
        ...card,
        price: Math.max(
          card.tcgplayer?.prices?.normal?.market ?? 0,
          card.tcgplayer?.prices?.holofoil?.market ?? 0,
          card.tcgplayer?.prices?.reverseHolofoil?.market ?? 0
        ),
      }));

      setCards(fetchedCards);
      setPage(1); // Reset เป็นหน้าแรกเมื่อค้นหาใหม่
    } catch {
      setError('Failed to fetch cards. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchCards(searchTerm);
      } else {
        setCards([]); // 🔹 ล้างข้อมูลถ้าช่องค้นหาว่าง
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchCards]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const paginatedCards = cards.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div style={{ padding: '20px' }}>
      <TextField
        label="Search Cards"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px' }}
      />

      {loading && <CircularProgress sx={{ display: 'block', margin: 'auto', marginTop: '20px' }} />}
      {error && <Alert severity="error" sx={{ margin: '20px auto', width: '80%' }}>{error}</Alert>}

      <Grid container spacing={3}>
        {paginatedCards.map((card) => (
          <Grid item xs={6} sm={3} md={2} lg={2} key={card.id}>
            <Card sx={{ maxWidth: 250, backgroundColor: 'transparent', boxShadow: 'none', textAlign: 'center' }}>
              <CardMedia
                component="img"
                image={card.images.large}
                alt={card.name}
                sx={{ width: '100%', height: 140, objectFit: 'contain', marginTop: '25px' }}
              />
              <CardContent sx={{
                backgroundColor: '#0b0c16',
                borderRadius: '16px',
                padding: '8px',
                color: 'white',
                textAlign: 'center',
                width: '160px',
                height: '170px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                margin: '0 auto',
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', marginTop: '25px' }}>
                  {card.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'lightgray', marginBottom: '2px' }}>
                  {card.price ?? 0 > 0 ? `$${(card.price ?? 0).toFixed(2)}` : 'Price not available'}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  size="small"
                  sx={{
                    color: 'white',
                    backgroundColor: '#4F4F4F',
                    opacity: 0.7,
                    '&:hover': { backgroundColor: '#3333FF', opacity: 1 },
                  }}
                  onClick={() => addToCart(card)}
                >
                  <LocalMallOutlinedIcon sx={{ marginRight: '8px' }} />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!loading && !error && cards.length === 0 && searchTerm && (
        <Typography variant="h6" style={{ textAlign: 'center', marginTop: '20px' }}>
          No cards found for "{searchTerm}".
        </Typography>
      )}

      {cards.length > itemsPerPage && (
        <Pagination
          count={Math.ceil(cards.length / itemsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
          sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
        />
      )}
    </div>
  );
};

export default PokemonCardSearch;
