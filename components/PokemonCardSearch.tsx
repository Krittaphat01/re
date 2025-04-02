import React, { useState } from 'react';
import { TextField, Grid, Card, CardMedia, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';

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

// ประกาศ props ที่จะรับ addToCart
interface PokemonCardSearchProps {
  addToCart: (card: CardType) => void;
}

const PokemonCardSearch: React.FC<PokemonCardSearchProps> = ({ addToCart }) => {
  const [cards, setCards] = useState<CardType[]>([]); // เก็บข้อมูลการ์ด
  const [searchTerm, setSearchTerm] = useState<string>(''); // เก็บคำค้นหา
  const [loading, setLoading] = useState(false); // กำหนดสถานะการโหลด
  const [error, setError] = useState<string | null>(null); // เก็บข้อความ error

  const fetchCards = async (term: string) => {
    if (!term.trim()) {
      setCards([]); // ถ้าไม่มีคำค้นหาให้ล้างการ์ด
      setError(null);
      return;
    }

    setLoading(true); // กำหนดสถานะการโหลดเป็น true
    setError(null); // เคลียร์ error ก่อน

    try {
      // ดึงข้อมูลจาก API ด้วย axios
      const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=name:${term}`, {
        headers: { 'X-api-key': 'bffbe7c7-cf5c-4854-9b63-b51f85a3616c' },
      });
      setCards(response.data.data || []); // เก็บการ์ดที่ได้จาก API
    } catch {
      setError('Failed to fetch cards. Please try again later.'); // ถ้ามีข้อผิดพลาดจะตั้งค่า error
    } finally {
      setLoading(false); // ปิดสถานะการโหลด
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value); // เก็บคำค้นหา
    fetchCards(value); // เรียกฟังก์ชัน fetchCards เมื่อมีการค้นหา
  };

  return (
    <div style={{ padding: '20px' }}>
      <TextField
        label="Search Cards"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearch}
        style={{ marginBottom: '20px' }}
      />

      {/* Loading State */}
      {loading && <CircularProgress sx={{ display: 'block', margin: 'auto', marginTop: '20px' }} />}

      {/* Error Message */}
      {error && <Alert severity="error" sx={{ margin: '20px auto', width: '80%' }}>{error}</Alert>}

      {/* Card Results */}
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
            <Card sx={{ maxWidth: 250, backgroundColor: 'transparent', boxShadow: 'none', padding: '0px', position: 'relative', textAlign: 'center' }}>
              <CardMedia
                component="img"
                image={card.images.large}
                alt={card.name}
                sx={{
                  width: '100%',
                  height: 140,
                  objectFit: 'contain',
                  position: 'relative',
                  top: 25,
                  margin: '0 auto',
                  zIndex: 1,
                }}
              />
              <CardContent sx={{ backgroundColor: '#0b0c16', color: 'white', textAlign: 'center', borderRadius: '16px', padding: '1px' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', marginTop: '25px' }}>
                  {card.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'lightgray', marginBottom: '2px' }}>
                  {/* Show price if available */}
                  {card.tcgplayer?.prices?.normal?.market ? `$${card.tcgplayer?.prices?.normal?.market.toFixed(2)}` : 'Price not available'}
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
                  onClick={() => addToCart(card)} // Pass the card data to the addToCart function
                >
                  <LocalMallOutlinedIcon sx={{ marginRight: '8px' }} />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Cards Found */}
      {!loading && !error && cards.length === 0 && searchTerm && (
        <Typography variant="h6" style={{ textAlign: 'center', marginTop: '20px' }}>
          No cards found for "{searchTerm}".
        </Typography>
      )}
    </div>
  );
};

export default PokemonCardSearch;
