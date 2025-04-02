import React, { useState, useEffect, useCallback } from 'react';
import { TextField, Grid, Card, CardMedia, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';
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
  price?: number; // Added price property
}

interface PokemonCardSearchProps {
  addToCart: (card: CardType) => void;
}

const PokemonCardSearch: React.FC<PokemonCardSearchProps> = ({ addToCart }) => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async (term: string) => {
    if (!term.trim()) {
      setCards([]);
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
    } catch {
      setError('Failed to fetch cards. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm) {
        fetchCards(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchCards]);

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
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
            <Card sx={{ maxWidth: 250, backgroundColor: 'transparent', boxShadow: 'none', textAlign: 'center' }}>
              <CardMedia
                component="img"
                image={card.images.large}
                alt={card.name}
                sx={{ width: '100%', height: 140, objectFit: 'contain', marginTop: '25px' }}
              />
              <CardContent sx={{ backgroundColor: '#0b0c16', color: 'white', textAlign: 'center', borderRadius: '16px', padding: '1px' }}>
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
                    marginBottom: '10px',
                    backgroundColor: '#4F4F4F',
                    opacity: 0.7,
                    '&:hover': {
                      backgroundColor: '#3333FF',
                      opacity: 1,
                    },
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
    </div>
  );
};

export default PokemonCardSearch;
